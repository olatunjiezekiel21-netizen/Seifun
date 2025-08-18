import type { Handler } from '@netlify/functions'

// Aggregates trending pairs from DexScreener and GeckoTerminal (best-effort)
const DEX_SCREENER = 'https://api.dexscreener.com/latest/dex/search?q=sei'
const GECKO_TERMINAL = 'https://api.geckoterminal.com/api/v2/networks/sei/pools'

export const handler: Handler = async () => {
  try {
    const [dsRes, gtRes] = await Promise.all([
      fetch(DEX_SCREENER).catch(() => null),
      fetch(GECKO_TERMINAL).catch(() => null)
    ])
    const ds = dsRes && dsRes.ok ? await dsRes.json() : null
    const gt = gtRes && gtRes.ok ? await gtRes.json() : null
    return { statusCode: 200, body: JSON.stringify({ dexscreener: ds, gecko: gt }) }
  } catch (err: any) {
    return { statusCode: 200, body: JSON.stringify({ dexscreener: null, gecko: null, note: 'Upstream error or Netlify egress policy' }) }
  }
}

