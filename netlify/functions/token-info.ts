import type { Handler } from '@netlify/functions';

const DEX_SEARCH = 'https://api.dexscreener.com/latest/dex/search?q=';
const CG_SEARCH = 'https://api.coingecko.com/api/v3/search?query=';
const CG_COIN = (id: string) => `https://api.coingecko.com/api/v3/coins/${id}`;
const CG_MARKETS = (idsCsv: string) => `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${idsCsv}&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h`;

async function fetchDex(query: string) {
  const res = await fetch(DEX_SEARCH + encodeURIComponent(query));
  if (!res.ok) return null;
  const data = await res.json();
  const pairs = data?.pairs || [];
  if (!pairs.length) return null;
  // choose highest liquidity
  const best = pairs.reduce((a: any, b: any) => (Number(a?.liquidity?.usd || 0) > Number(b?.liquidity?.usd || 0) ? a : b));
  return {
    source: 'dexscreener',
    name: best?.baseToken?.name || best?.baseToken?.symbol,
    symbol: best?.baseToken?.symbol,
    priceUsd: Number(best?.priceUsd || 0),
    priceChange24h: Number(best?.priceChange?.h24 || 0),
    liquidityUsd: Number(best?.liquidity?.usd || 0),
    image: best?.info?.imageUrl,
    url: best?.url,
  };
}

async function fetchCoinGecko(query: string) {
  // search ids
  const s = await fetch(CG_SEARCH + encodeURIComponent(query));
  if (!s.ok) return null;
  const sr = await s.json();
  const coins = (sr?.coins || []).slice(0, 3);
  if (!coins.length) return null;
  // try markets for price and links for socials
  const ids = coins.map((c: any) => c.id).join(',');
  const m = await fetch(CG_MARKETS(ids));
  const markets = m.ok ? await m.json() : [];
  // pick best by market cap rank
  const best = markets.sort((a: any, b: any) => (a.market_cap_rank || 9999) - (b.market_cap_rank || 9999))[0] || {};
  // fetch full coin data for socials if needed
  let twitter: string | undefined;
  let website: string | undefined;
  try {
    const cFull = await fetch(CG_COIN(best?.id || coins[0].id));
    if (cFull.ok) {
      const c = await cFull.json();
      twitter = c?.links?.twitter_screen_name ? `https://x.com/${c.links.twitter_screen_name}` : undefined;
      website = Array.isArray(c?.links?.homepage) ? c.links.homepage.find((x: string) => !!x) : undefined;
    }
  } catch {}
  return {
    source: 'coingecko',
    name: best?.name || coins[0]?.name,
    symbol: (best?.symbol || coins[0]?.symbol || '').toUpperCase(),
    priceUsd: Number(best?.current_price || 0),
    priceChange24h: Number(best?.price_change_percentage_24h || 0),
    liquidityUsd: Number(best?.total_volume || 0),
    image: best?.image,
    url: best?.id ? `https://www.coingecko.com/en/coins/${best.id}` : undefined,
    twitter,
    website,
  };
}

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  const q = (event.queryStringParameters?.q || '').trim();
  if (!q) return { statusCode: 400, body: 'Missing q' };

  try {
    const dex = await fetchDex(q).catch(() => null);
    if (dex) return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dex) };
    const cg = await fetchCoinGecko(q).catch(() => null);
    if (cg) return { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cg) };
    return { statusCode: 404, body: 'Token not found' };
  } catch (e: any) {
    return { statusCode: 500, body: JSON.stringify({ error: e?.message || 'Internal Error' }) };
  }
};

export { handler };

