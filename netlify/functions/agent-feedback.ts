import type { Handler } from '@netlify/functions'
import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI as string
const MONGODB_DB = process.env.MONGODB_DB || 'seifu'
const COLLECTION = process.env.MONGODB_FEEDBACK_COLLECTION || 'agent_feedback'

export const handler: Handler = async (event) => {
	if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }
	if (!MONGODB_URI) return { statusCode: 500, body: 'Missing MONGODB_URI' }
	try {
		const body = JSON.parse(event.body || '{}') as {
			userId?: string
			wallet?: string
			advice: string
			caution?: string
			confidence_score?: number
			recommendation?: string
			context?: any
		}
		const client = new MongoClient(MONGODB_URI)
		await client.connect()
		const col = client.db(MONGODB_DB).collection(COLLECTION)
		const doc = {
			userId: body.userId || null,
			wallet: body.wallet || null,
			advice: body.advice,
			caution: body.caution || null,
			confidence_score: typeof body.confidence_score === 'number' ? body.confidence_score : null,
			recommendation: body.recommendation || null,
			context: body.context || {},
			createdAt: new Date().toISOString()
		}
		await col.insertOne(doc as any)
		await client.close()
		return { statusCode: 200, body: JSON.stringify({ ok: true }) }
	} catch (err: any) {
		return { statusCode: 500, body: `Error: ${err.message}` }
	}
}