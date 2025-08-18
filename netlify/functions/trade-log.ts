import type { Handler } from '@netlify/functions'
import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI as string
const MONGODB_DB = process.env.MONGODB_DB || 'seifu'
const COLLECTION = process.env.MONGODB_TRADES_COLLECTION || 'user_trades'

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }
  if (!MONGODB_URI) return { statusCode: 500, body: 'Missing MONGODB_URI' }
  try {
    const body = JSON.parse(event.body || '{}') as {
      userId?: string; wallet?: string; dex?: string; tokenIn?: string; tokenOut?: string;
      amountIn?: string; amountOut?: string; minOut?: string; priceImpact?: number;
      slippageBps?: number; txHash?: string; status?: 'success'|'failed'|'blocked'; reason?: string;
    }
    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    const col = client.db(MONGODB_DB).collection(COLLECTION)
    const doc = {
      userId: body.userId || null, wallet: body.wallet || null, dex: body.dex || null,
      tokenIn: body.tokenIn || null, tokenOut: body.tokenOut || null, amountIn: body.amountIn || null,
      amountOut: body.amountOut || null, minOut: body.minOut || null,
      priceImpact: typeof body.priceImpact === 'number' ? body.priceImpact : null,
      slippageBps: typeof body.slippageBps === 'number' ? body.slippageBps : 100,
      txHash: body.txHash || null, status: body.status || 'success', reason: body.reason || null,
      createdAt: new Date().toISOString()
    }
    await col.insertOne(doc as any)
    await client.close()
    return { statusCode: 200, body: JSON.stringify({ ok: true }) }
  } catch (err: any) {
    return { statusCode: 500, body: `Error: ${err.message}` }
  }
}

