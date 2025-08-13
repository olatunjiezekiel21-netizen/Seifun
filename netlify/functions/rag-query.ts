import type { Handler } from '@netlify/functions'
import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI as string
const MONGODB_DB = process.env.MONGODB_DB || 'seifu'
const MONGODB_COLLECTION = process.env.MONGODB_RAG_COLLECTION || 'rag_documents'
const OPENAI_API_KEY = process.env.OPENAI_API_KEY as string

async function embed(text: string): Promise<number[]> {
	const res = await fetch('https://api.openai.com/v1/embeddings', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${OPENAI_API_KEY}`
		},
		body: JSON.stringify({ model: 'text-embedding-3-small', input: text })
	})
	if (!res.ok) throw new Error(`Embedding failed: ${res.status} ${await res.text()}`)
	const data = await res.json()
	return data.data[0].embedding
}

export const handler: Handler = async (event) => {
	if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }
	if (!MONGODB_URI || !OPENAI_API_KEY) return { statusCode: 500, body: 'Missing MONGODB_URI or OPENAI_API_KEY' }

	try {
		const { query, topK = 5, filter } = JSON.parse(event.body || '{}') as { query: string; topK?: number; filter?: Record<string, any> }
		if (!query || typeof query !== 'string') return { statusCode: 400, body: 'Provide query string' }

		const qVec = await embed(query)
		const client = new MongoClient(MONGODB_URI)
		await client.connect()
		const db = client.db(MONGODB_DB)
		const col = db.collection(MONGODB_COLLECTION)

		// Atlas Vector Search pipeline
		const pipeline: any[] = [
			{
				$vectorSearch: {
					index: process.env.MONGODB_VECTOR_INDEX || 'rag_vector_index',
					path: 'vector',
					queryVector: qVec,
					numCandidates: Math.max(50, topK * 10),
					limit: topK,
					filter: filter || undefined
				}
			},
			{ $project: { _id: 1, text: 1, metadata: 1, score: { $meta: 'vectorSearchScore' } } }
		]

		const results = await col.aggregate(pipeline).toArray()
		await client.close()
		return { statusCode: 200, body: JSON.stringify({ results }) }
	} catch (err: any) {
		return { statusCode: 500, body: `Error: ${err.message}` }
	}
}