import type { Handler } from '@netlify/functions'
import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI as string
const DB = process.env.MONGODB_DB || 'seifu'
const COLLECTION = process.env.MONGODB_CHAT_COLLECTION || 'chat_messages'

export const handler: Handler = async (event) => {
	if (!MONGODB_URI) return { statusCode: 500, body: 'Missing MONGODB_URI' }
	try {
		const client = new MongoClient(MONGODB_URI)
		await client.connect()
		const col = client.db(DB).collection(COLLECTION)
		try {
			if (event.httpMethod === 'GET') {
				const owner = (event.queryStringParameters?.owner || '').toLowerCase()
				if (!owner) return { statusCode: 400, body: 'Missing owner' }
				const items = await col.find({ owner }).sort({ createdAt: -1 }).limit(200).toArray()
				return { statusCode: 200, body: JSON.stringify(items) }
			}
			if (event.httpMethod === 'POST') {
				const body = JSON.parse(event.body || '{}')
				const { owner, role, message } = body
				if (!owner || !role || !message) return { statusCode: 400, body: 'Missing owner/role/message' }
				await col.insertOne({ owner: String(owner).toLowerCase(), role, message, createdAt: new Date().toISOString() })
				return { statusCode: 200, body: JSON.stringify({ ok: true }) }
			}
			return { statusCode: 405, body: 'Method Not Allowed' }
		} finally {
			await client.close()
		}
	} catch (err: any) {
		return { statusCode: 500, body: `Error: ${err.message}` }
	}
}