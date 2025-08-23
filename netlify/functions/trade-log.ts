import type { Handler } from '@netlify/functions'
import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI as string
const MONGODB_DB = process.env.MONGODB_DB || 'seifu'
const COLLECTION = process.env.MONGODB_TRADES_COLLECTION || 'user_trades'

export const handler: Handler = async (event) => {
	if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }
	if (!MONGODB_URI) return { statusCode: 500, body: 'Missing MONGODB_URI' }
	try {
		const body = JSON.parse(event.body || '{}')
		const nowIso = new Date().toISOString()
		const doc = {
			wallet: body.wallet || '',
			dex: body.dex || 'fixed',
			tokenIn: String(body.tokenIn || '').toLowerCase(),
			tokenOut: String(body.tokenOut || '').toLowerCase(),
			amountIn: Number(body.amountIn || 0),
			amountOut: Number(body.amountOut || 0),
			txHash: body.txHash || '',
			status: body.status || 'success',
			createdAt: nowIso
		}
		if (!doc.tokenIn || !doc.tokenOut) return { statusCode: 400, body: 'Missing tokenIn/tokenOut' }
		const client = new MongoClient(MONGODB_URI)
		await client.connect()
		const col = client.db(MONGODB_DB).collection(COLLECTION)
		await col.insertOne(doc as any)
		await client.close()
		return { statusCode: 200, body: JSON.stringify({ ok: true }) }
	} catch (err: any) {
		return { statusCode: 500, body: `Error: ${err.message}` }
	}
}

