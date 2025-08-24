import type { Handler } from '@netlify/functions'
import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI as string
const DB = process.env.MONGODB_DB || 'seifu'
const COLLECTION = process.env.MONGODB_TODOS_COLLECTION || 'todos'

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
				const action = body.action || 'add'
				if (action === 'add') {
					const { owner, task, due } = body
					if (!owner || !task) return { statusCode: 400, body: 'Missing owner or task' }
					await col.insertOne({ owner: String(owner).toLowerCase(), task, due: due || null, completed: false, createdAt: new Date().toISOString() })
					return { statusCode: 200, body: JSON.stringify({ ok: true }) }
				}
				if (action === 'complete') {
					const { owner, index } = body
					if (!owner || index === undefined) return { statusCode: 400, body: 'Missing owner or index' }
					const ownerLc = String(owner).toLowerCase()
					const items = await col.find({ owner: ownerLc }).sort({ createdAt: -1 }).limit(200).toArray()
					const doc = items[index]
					if (!doc?._id) return { statusCode: 404, body: 'Item not found' }
					await col.updateOne({ _id: doc._id }, { $set: { completed: true, updatedAt: new Date().toISOString() } })
					return { statusCode: 200, body: JSON.stringify({ ok: true }) }
				}
				return { statusCode: 400, body: 'Unknown action' }
			}
			return { statusCode: 405, body: 'Method Not Allowed' }
		} finally {
			await client.close()
		}
	} catch (err: any) {
		return { statusCode: 500, body: `Error: ${err.message}` }
	}
}