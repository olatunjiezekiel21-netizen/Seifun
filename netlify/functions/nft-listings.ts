import type { Handler } from '@netlify/functions'

// Simple proxy to fetch NFT listings from Paloma NFT (or any marketplace API)
// Input: { collection?: string, page?: number, limit?: number }

const MARKET_API = process.env.NFT_MARKET_API || 'https://api.palomanft.io/v1/listings'

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }
  try {
    const { collection, page = 1, limit = 20 } = JSON.parse(event.body || '{}') as { collection?: string; page?: number; limit?: number }
    const qs = new URLSearchParams()
    if (collection) qs.set('collection', collection)
    qs.set('page', String(page))
    qs.set('limit', String(limit))
    const url = `${MARKET_API}?${qs.toString()}`
    const res = await fetch(url)
    if (!res.ok) return { statusCode: 502, body: `Marketplace error: ${res.status}` }
    const data = await res.json()
    return { statusCode: 200, body: JSON.stringify({ listings: data }) }
  } catch (err: any) {
    return { statusCode: 500, body: `Error: ${err.message}` }
  }
}

