import type { Handler } from '@netlify/functions'

export const handler: Handler = async () => {
	try {
		const hasOllama = !!process.env.OLLAMA_URL
		const hasOpenAI = !!(process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY)
		const backend = hasOllama ? 'ollama' : hasOpenAI ? 'openai' : 'none'
		return {
			statusCode: 200,
			body: JSON.stringify({ ok: true, backend })
		}
	} catch (e: any) {
		return { statusCode: 200, body: JSON.stringify({ ok: false, backend: 'unknown' }) }
	}
}