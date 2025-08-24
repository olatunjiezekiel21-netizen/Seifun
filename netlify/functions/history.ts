import type { Handler } from '@netlify/functions'
import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI as string
const DB = process.env.MONGODB_DB || 'seifu'
const COLLECTION = process.env.MONGODB_TRADES_COLLECTION || 'user_trades'

export const handler: Handler = async (event) => {
	if (event.httpMethod !== 'GET') return { statusCode: 405, body: 'Method Not Allowed' }
	if (!MONGODB_URI) return { statusCode: 500, body: 'Missing MONGODB_URI' }
	try {
		const wallet = (event.queryStringParameters?.wallet || '').toLowerCase()
		if (!wallet) return { statusCode: 400, body: 'Missing wallet' }
		const client = new MongoClient(MONGODB_URI)
		await client.connect()
		const col = client.db(DB).collection(COLLECTION)
		const docs = await col.find({ wallet }).sort({ createdAt: -1 }).limit(200).toArray()
		await client.close()
		return { statusCode: 200, body: JSON.stringify(docs) }
	} catch (err: any) {
		return { statusCode: 500, body: `Error: ${err.message}` }
	}
}