import type { Handler } from '@netlify/functions'
import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI as string
const MONGODB_DB = process.env.MONGODB_DB || 'seifu'
const COLLECTION = process.env.MONGODB_TX_COLLECTION || 'tx_logs'

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }
  if (!MONGODB_URI) return { statusCode: 500, body: 'Missing MONGODB_URI' }
  try {
    const body = JSON.parse(event.body || '{}') as {
      wallet?: string
      action: string
      params?: any
      txHash?: string
      status?: 'success'|'failed'|'pending'
    }
    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    const col = client.db(MONGODB_DB).collection(COLLECTION)
    const doc = {
      wallet: body.wallet || null,
      action: body.action,
      params: body.params || {},
      txHash: body.txHash || null,
      status: body.status || 'success',
      createdAt: new Date().toISOString()
    }
    await col.insertOne(doc)
    await client.close()
    return { statusCode: 200, body: JSON.stringify({ ok: true }) }
  } catch (err: any) {
    return { statusCode: 500, body: `Error: ${err.message}` }
  }
}