import type { Handler } from '@netlify/functions'

const QDRANT_URL = process.env.QDRANT_URL as string
const QDRANT_API_KEY = process.env.QDRANT_API_KEY as string
const QDRANT_COLLECTION = process.env.QDRANT_COLLECTION || 'docs_vectors'
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
	if (!QDRANT_URL || !OPENAI_API_KEY) return { statusCode: 500, body: 'Missing QDRANT_URL or OPENAI_API_KEY' }
	try {
		const { query, topK = 5, filter } = JSON.parse(event.body || '{}') as { query: string; topK?: number; filter?: Record<string, any> }
		if (!query || typeof query !== 'string') return { statusCode: 400, body: 'Provide query string' }
		const vector = await embed(query)
		const searchRes = await fetch(`${QDRANT_URL}/collections/${encodeURIComponent(QDRANT_COLLECTION)}/points/search`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'api-key': QDRANT_API_KEY || '' },
			body: JSON.stringify({ vector, limit: topK, with_payload: true, filter })
		})
		if (!searchRes.ok) return { statusCode: 500, body: `Qdrant search failed: ${searchRes.status} ${await searchRes.text()}` }
		const data = await searchRes.json()
		return { statusCode: 200, body: JSON.stringify({ results: data.result }) }
	} catch (err: any) {
		return { statusCode: 500, body: `Error: ${err.message}` }
	}
}