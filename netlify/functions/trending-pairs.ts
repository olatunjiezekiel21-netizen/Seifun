import type { Handler } from '@netlify/functions';

const DEXSCREENER_API = 'https://api.dexscreener.com/latest/dex/tokens/';
const DEXSCREENER_TRENDS = 'https://api.dexscreener.com/latest/dex/trending';
const COINGECKO_MARKETS = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=volume_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h';

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Try DexScreener trending first
    try {
      const ds = await fetch(DEXSCREENER_TRENDS);
      if (ds.ok) {
        const data = await ds.json();
        const items = (data?.pairs || []).slice(0, 15).map((p: any) => ({
          name: p?.baseToken?.name || `${p?.baseToken?.symbol || 'TOKEN'}`,
          symbol: p?.baseToken?.symbol || 'UNKNOWN',
          priceUsd: parseFloat(p?.priceUsd || '0') || 0,
          priceChange24h: parseFloat(p?.priceChange?.h24 || '0') || 0,
          liquidityUsd: parseFloat(p?.liquidity?.usd || '0') || 0,
          url: p?.url || (p?.pairAddress ? `https://dexscreener.com/sei/${p.pairAddress}` : undefined),
          chainId: p?.chainId || 'sei',
        }));
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ source: 'dexscreener', items }),
        };
      }
    } catch {}

    // Fallback: CoinGecko top markets
    try {
      const cg = await fetch(COINGECKO_MARKETS);
      if (cg.ok) {
        const rows = await cg.json();
        const items = rows.slice(0, 15).map((r: any) => ({
          name: r?.name,
          symbol: (r?.symbol || '').toUpperCase(),
          priceUsd: r?.current_price || 0,
          priceChange24h: r?.price_change_percentage_24h || 0,
          liquidityUsd: r?.total_volume || 0,
          url: r?.id ? `https://www.coingecko.com/en/coins/${r.id}` : undefined,
          chainId: 'sei',
        }));
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ source: 'coingecko', items }),
        };
      }
    } catch {}

    return { statusCode: 502, body: 'Failed to fetch trending pairs' };
  } catch (err: any) {
    return { statusCode: 500, body: JSON.stringify({ error: err?.message || 'Internal Error' }) };
  }
};

export { handler };

