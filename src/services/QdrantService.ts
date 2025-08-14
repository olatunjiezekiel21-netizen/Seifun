export interface QdrantPoint {
	id?: string | number
	score?: number
	payload?: Record<string, any>
}

export class QdrantService {
	static async ingest(docs: Array<{ id?: string | number; text: string; metadata?: Record<string, any> }>): Promise<number> {
		const res = await fetch('/.netlify/functions/qdrant-ingest', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ documents: docs })
		})
		if (!res.ok) throw new Error(await res.text())
		const data = await res.json()
		return data.upserted as number
	}

	static async query(query: string, topK = 5, filter?: Record<string, any>): Promise<QdrantPoint[]> {
		const res = await fetch('/.netlify/functions/qdrant-query', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ query, topK, filter })
		})
		if (!res.ok) throw new Error(await res.text())
		const data = await res.json()
		return data.results as QdrantPoint[]
	}
}