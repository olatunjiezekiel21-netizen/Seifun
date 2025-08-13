export interface RAGResult {
	score: number
	text: string
	metadata?: Record<string, any>
}

export class RAGService {
	static async ingest(docs: Array<{ id?: string; text: string; metadata?: Record<string, any> }>): Promise<number> {
		const res = await fetch('/.netlify/functions/rag-ingest', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ documents: docs })
		})
		if (!res.ok) throw new Error(await res.text())
		const data = await res.json()
		return data.inserted as number
	}

	static async query(query: string, topK = 5, filter?: Record<string, any>): Promise<RAGResult[]> {
		const res = await fetch('/.netlify/functions/rag-query', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ query, topK, filter })
		})
		if (!res.ok) throw new Error(await res.text())
		const data = await res.json()
		return (data.results as any[]).map(r => ({ score: r.score, text: r.text, metadata: r.metadata }))
	}
}