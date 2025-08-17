import type { Handler } from '@netlify/functions'
import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI as string
const MONGODB_DB = process.env.MONGODB_DB || 'seifu'
const TRADES = process.env.MONGODB_TRADES_COLLECTION || 'user_trades'

export const handler: Handler = async (event) => {
	if (event.httpMethod !== 'GET') return { statusCode: 405, body: 'Method Not Allowed' }
	if (!MONGODB_URI) return { statusCode: 500, body: 'Missing MONGODB_URI' }
	try {
		const wallet = (event.queryStringParameters?.wallet || '').trim().toLowerCase()
		if (!wallet) return { statusCode: 400, body: 'Provide wallet' }
		const client = new MongoClient(MONGODB_URI)
		await client.connect()
		const col = client.db(MONGODB_DB).collection(TRADES)
		const since = Date.now() - 1000 * 60 * 60 * 24 * 30 // last 30 days
		const cursor = col.find({ wallet: { $regex: new RegExp(`^${wallet}$`, 'i') }, createdAt: { $gte: new Date(since).toISOString() } })
		const docs = await cursor.toArray()
		await client.close()
		const total = docs.length
		const successes = docs.filter(d => d.status === 'success').length
		const blocked = docs.filter(d => d.status === 'blocked').length
		const failed = docs.filter(d => d.status === 'failed').length
		const avgImpact = (() => {
			const impacts = docs.map(d => Number(d.priceImpact || 0)).filter(n => isFinite(n))
			return impacts.length ? Number((impacts.reduce((a,b)=>a+b,0) / impacts.length).toFixed(2)) : 0
		})()
		return { statusCode: 200, body: JSON.stringify({ total, successes, blocked, failed, avgImpact }) }
	} catch (e: any) {
		return { statusCode: 500, body: e?.message || 'Internal Error' }
	}
}