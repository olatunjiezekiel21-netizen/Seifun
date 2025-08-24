import type { Handler } from '@netlify/functions'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY

export const handler: Handler = async (event) => {
	if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }
	if (!OPENAI_API_KEY) return { statusCode: 500, body: 'Missing OPENAI_API_KEY' }
	try {
		const { message } = JSON.parse(event.body || '{}')
		if (!message) return { statusCode: 400, body: 'Missing message' }
		const res = await fetch('https://api.openai.com/v1/chat/completions', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
			body: JSON.stringify({
				model: 'gpt-4o-mini',
				messages: [
					{ role: 'system', content: 'You are Seilor, a helpful trading assistant for the Sei network. Keep replies concise and friendly.' },
					{ role: 'user', content: String(message) }
				]
			})
		})
		if (!res.ok) return { statusCode: 500, body: await res.text() }
		const data = await res.json()
		const text = data?.choices?.[0]?.message?.content || 'Okay.'
		return { statusCode: 200, body: JSON.stringify({ text }) }
	} catch (err: any) {
		return { statusCode: 500, body: `Error: ${err.message}` }
	}
}