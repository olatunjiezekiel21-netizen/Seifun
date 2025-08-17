import type { Handler } from '@netlify/functions'

interface TokenPair {
	chainId: string;
	dexId: string;
	pairAddress: string;
	baseToken: { address: string; name: string; symbol: string };
	quoteToken: { address: string; name: string; symbol: string };
	priceUsd: number;
	priceNative: number;
	volume24h: number;
	priceChange24h: number;
	liquidity: { usd: number; base: number; quote: number };
	fdv?: number;
	txns: { h24: { buys: number; sells: number } };
	pairCreatedAt?: number;
	url?: string;
}

async function fetchDexScreener(limit: number): Promise<TokenPair[]> {
	try {
		const res = await fetch('https://api.dexscreener.com/latest/dex/search/?q=sei');
		if (!res.ok) return [];
		const data = await res.json() as any;
		const pairs: TokenPair[] = (data.pairs || [])
			.filter((p: any) => p.chainId === 'sei')
			.map((pair: any) => ({
				chainId: pair.chainId,
				dexId: pair.dexId || 'unknown',
				pairAddress: pair.pairAddress,
				baseToken: { address: pair.baseToken?.address || '', name: pair.baseToken?.name || '', symbol: pair.baseToken?.symbol || '' },
				quoteToken: { address: pair.quoteToken?.address || '', name: pair.quoteToken?.name || '', symbol: pair.quoteToken?.symbol || '' },
				priceUsd: parseFloat(pair.priceUsd || '0') || 0,
				priceNative: parseFloat(pair.priceNative || '0') || 0,
				volume24h: pair.volume?.h24 || 0,
				priceChange24h: pair.priceChange?.h24 || 0,
				liquidity: { usd: pair.liquidity?.usd || 0, base: pair.liquidity?.base || 0, quote: pair.liquidity?.quote || 0 },
				fdv: pair.fdv,
				txns: { h24: { buys: pair.txns?.h24?.buys || 0, sells: pair.txns?.h24?.sells || 0 } },
				pairCreatedAt: pair.pairCreatedAt,
				url: pair.url
			}))
			.sort((a: TokenPair, b: TokenPair) => (b.liquidity.usd - a.liquidity.usd))
			.slice(0, limit);
		return pairs;
	} catch {
		return [];
	}
}

async function fetchGeckoTerminal(limit: number): Promise<TokenPair[]> {
	try {
		const res = await fetch('https://api.geckoterminal.com/api/v2/networks/sei/trending_pools?page=1&include=base_token,quote_token');
		if (!res.ok) return [];
		const data = await res.json() as any;
		const items = (data.data || []).slice(0, limit);
		const pairs: TokenPair[] = items.map((pool: any) => {
			const attr = pool.attributes || {};
			const rel = pool.relationships || {};
			return {
				chainId: attr.network || 'sei',
				dexId: attr.dex_id || 'unknown',
				pairAddress: attr.address,
				baseToken: {
					address: rel?.base_token?.data?.id?.split('_')[1] || '',
					name: attr.base_token_name || '',
					symbol: attr.base_token_symbol || ''
				},
				quoteToken: {
					address: rel?.quote_token?.data?.id?.split('_')[1] || '',
					name: attr.quote_token_name || '',
					symbol: attr.quote_token_symbol || ''
				},
				priceUsd: parseFloat(attr.base_token_price_usd || '0') || 0,
				priceNative: parseFloat(attr.base_token_price_native_currency || '0') || 0,
				volume24h: parseFloat(attr.volume_usd?.h24 || '0') || 0,
				priceChange24h: parseFloat(attr.price_change_percentage?.h24 || '0') || 0,
				liquidity: { usd: parseFloat(attr.reserve_in_usd || '0') || 0, base: 0, quote: 0 },
				fdv: parseFloat(attr.fdv_usd || '0') || undefined,
				txns: { h24: { buys: parseInt(attr.transactions?.h24?.buys || '0'), sells: parseInt(attr.transactions?.h24?.sells || '0') } },
				pairCreatedAt: attr.pool_created_at ? new Date(attr.pool_created_at).getTime() : undefined,
				url: `https://www.geckoterminal.com/${attr.network}/pools/${attr.address}`
			}
		});
		return pairs;
	} catch {
		return [];
	}
}

export const handler: Handler = async (event) => {
	try {
		const limit = Math.max(1, Math.min(100, parseInt((event.queryStringParameters?.limit as string) || '24')));
		const [ds, gt] = await Promise.all([fetchDexScreener(limit), fetchGeckoTerminal(limit)]);
		// Merge by pairAddress and prefer DexScreener metrics where overlapping
		const map = new Map<string, TokenPair>();
		for (const p of gt) { map.set(p.pairAddress, p); }
		for (const p of ds) { map.set(p.pairAddress, p); }
		const merged = Array.from(map.values()).sort((a, b) => b.liquidity.usd - a.liquidity.usd).slice(0, limit);
		return { statusCode: 200, body: JSON.stringify({ pairs: merged }) };
	} catch (e: any) {
		return { statusCode: 500, body: JSON.stringify({ error: e?.message || 'failed' }) };
	}
}