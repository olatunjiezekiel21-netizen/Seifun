import type { Handler } from '@netlify/functions'

const OLLAMA_URL = process.env.OLLAMA_URL
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY // support legacy env name, but never expose it

async function callOllama(prompt: string, model?: string): Promise<string> {
	const url = `${OLLAMA_URL}/api/generate`
	const res = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ model: model || 'llama3.1', prompt, stream: false })
	})
	if (!res.ok) throw new Error(`Ollama error: ${await res.text()}`)
	const data = await res.json() as any
	return data.response || data.text || ''
}

async function callOpenAI(prompt: string, model?: string): Promise<string> {
	const m = model || 'gpt-3.5-turbo'
	const res = await fetch('https://api.openai.com/v1/chat/completions', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${OPENAI_API_KEY}`
		},
		body: JSON.stringify({
			model: m,
			messages: [{ role: 'user', content: prompt }],
			temperature: 0.3,
			max_tokens: 500
		})
	})
	if (!res.ok) throw new Error(`OpenAI error: ${await res.text()}`)
	const data = await res.json() as any
	return data.choices?.[0]?.message?.content || ''
}

export const handler: Handler = async (event) => {
	if (event.httpMethod !== 'POST') {
		return { statusCode: 405, body: 'Method Not Allowed' }
	}
	try {
		const { prompt, model } = JSON.parse(event.body || '{}') as { prompt?: string; model?: string }
		if (!prompt) return { statusCode: 400, body: 'Missing prompt' }

		if (OLLAMA_URL) {
			try {
				const text = await callOllama(prompt, model)
				return { statusCode: 200, body: JSON.stringify({ text }) }
			} catch {}
		}
		if (OPENAI_API_KEY) {
			const text = await callOpenAI(prompt, model)
			return { statusCode: 200, body: JSON.stringify({ text }) }
		}
		return { statusCode: 503, body: 'No LLM backend configured (set OLLAMA_URL or OPENAI_API_KEY)' }
	} catch (e: any) {
		return { statusCode: 500, body: e?.message || 'Internal Error' }
	}
}