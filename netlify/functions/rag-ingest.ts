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
		body: JSON.stringify({
			model: 'text-embedding-3-small',
			input: text
		})
	})
	if (!res.ok) {
		throw new Error(`Embedding failed: ${res.status} ${await res.text()}`)
	}
	const data = await res.json()
	return data.data[0].embedding
}

export const handler: Handler = async (event) => {
	if (event.httpMethod !== 'POST') {
		return { statusCode: 405, body: 'Method Not Allowed' }
	}
	if (!MONGODB_URI || !OPENAI_API_KEY) {
		return { statusCode: 500, body: 'Missing MONGODB_URI or OPENAI_API_KEY' }
	}

	try {
		const { documents } = JSON.parse(event.body || '{}') as { documents: Array<{ id?: string; text: string; metadata?: Record<string, any> }> }
		if (!Array.isArray(documents) || documents.length === 0) {
			return { statusCode: 400, body: 'Provide documents: [{ text, metadata? }]' }
		}

		const client = new MongoClient(MONGODB_URI)
		await client.connect()
		const db = client.db(MONGODB_DB)
		const col = db.collection(MONGODB_COLLECTION)

		// Ensure index exists (Atlas Vector Search or 2dsphere fallback is managed outside)

		const items = [] as any[]
		for (const doc of documents) {
			const vector = await embed(doc.text)
			items.push({
				_id: doc.id || undefined,
				text: doc.text,
				metadata: doc.metadata || {},
				vector
			})
		}

		if (items.length > 0) {
			await col.insertMany(items, { ordered: false })
		}

		await client.close()
		return { statusCode: 200, body: JSON.stringify({ inserted: items.length }) }
	} catch (err: any) {
		return { statusCode: 500, body: `Error: ${err.message}` }
	}
}