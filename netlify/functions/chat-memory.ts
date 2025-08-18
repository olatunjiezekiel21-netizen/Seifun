import type { Handler } from '@netlify/functions'
import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI as string
const MONGODB_DB = process.env.MONGODB_DB || 'seifu'
const COLLECTION = process.env.MONGODB_CHAT_COLLECTION || 'chat_memory'

export const handler: Handler = async (event) => {
	if (!MONGODB_URI) return { statusCode: 500, body: 'Missing MONGODB_URI' }

	const client = new MongoClient(MONGODB_URI)
	try {
		await client.connect()
		const db = client.db(MONGODB_DB)
		const col = db.collection(COLLECTION)

		if (event.httpMethod === 'GET') {
			const userId = (event.queryStringParameters?.userId || '').trim()
			if (!userId) return { statusCode: 400, body: 'Missing userId' }
			const doc = await col.findOne({ userId })
			return { statusCode: 200, body: JSON.stringify(doc || { userId, messages: [] }) }
		}

		if (event.httpMethod === 'POST') {
			const body = JSON.parse(event.body || '{}') as { userId?: string; message?: { type: 'user'|'assistant'; message: string; timestamp?: string } }
			const userId = (body.userId || '').trim()
			if (!userId || !body.message?.message || !body.message?.type) return { statusCode: 400, body: 'Provide userId and message {type,message}' }
			const entry = { ...body.message, timestamp: body.message.timestamp || new Date().toISOString() }
			await col.updateOne(
				{ userId },
				{ $set: { userId, updatedAt: new Date() }, $push: { messages: entry } },
				{ upsert: true }
			)
			return { statusCode: 200, body: JSON.stringify({ ok: true }) }
		}

		if (event.httpMethod === 'DELETE') {
			const { userId } = JSON.parse(event.body || '{}') as { userId?: string }
			if (!userId) return { statusCode: 400, body: 'Provide userId' }
			await col.deleteOne({ userId })
			return { statusCode: 200, body: JSON.stringify({ ok: true }) }
		}

		return { statusCode: 405, body: 'Method Not Allowed' }
	} catch (err: any) {
		return { statusCode: 500, body: `Error: ${err.message}` }
	} finally {
		await client.close()
	}
}