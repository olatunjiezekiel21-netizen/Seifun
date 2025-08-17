import type { Handler } from '@netlify/functions'

const QDRANT_URL = process.env.QDRANT_URL as string
const QDRANT_API_KEY = process.env.QDRANT_API_KEY as string
const QDRANT_COLLECTION = process.env.QDRANT_COLLECTION || 'docs_vectors'
const OPENAI_API_KEY = process.env.OPENAI_API_KEY as string

async function ensureCollection(): Promise<void> {
	const res = await fetch(`${QDRANT_URL}/collections/${encodeURIComponent(QDRANT_COLLECTION)}`, {
		headers: { 'Content-Type': 'application/json', 'api-key': QDRANT_API_KEY || '' }
	})
	if (res.ok) return
	// Create with OpenAI embedding dimension 1536
	const createRes = await fetch(`${QDRANT_URL}/collections/${encodeURIComponent(QDRANT_COLLECTION)}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json', 'api-key': QDRANT_API_KEY || '' },
		body: JSON.stringify({
			vectors: { size: 1536, distance: 'Cosine' }
		})
	})
	if (!createRes.ok) throw new Error(`Failed to create collection: ${createRes.status} ${await createRes.text()}`)
}

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
		const { documents } = JSON.parse(event.body || '{}') as { documents: Array<{ id?: string | number; text: string; metadata?: Record<string, any> }> }
		if (!Array.isArray(documents) || documents.length === 0) return { statusCode: 400, body: 'Provide documents: [{ text, metadata? }]' }
		await ensureCollection()
		const points = [] as any[]
		for (const doc of documents) {
			const vector = await embed(doc.text)
			points.push({ id: doc.id ?? undefined, vector, payload: { text: doc.text, ...(doc.metadata || {}) } })
		}
		const upsertRes = await fetch(`${QDRANT_URL}/collections/${encodeURIComponent(QDRANT_COLLECTION)}/points?wait=true`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json', 'api-key': QDRANT_API_KEY || '' },
			body: JSON.stringify({ points })
		})
		if (!upsertRes.ok) return { statusCode: 500, body: `Qdrant upsert failed: ${upsertRes.status} ${await upsertRes.text()}` }
		return { statusCode: 200, body: JSON.stringify({ upserted: points.length }) }
	} catch (err: any) {
		return { statusCode: 500, body: `Error: ${err.message}` }
	}
}