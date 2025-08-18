import type { Handler } from '@netlify/functions'

const OLLAMA_URL = process.env.OLLAMA_URL as string | undefined
const OPENAI_API_KEY = process.env.OPENAI_API_KEY as string | undefined

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }
  try {
    const { prompt, model } = JSON.parse(event.body || '{}') as { prompt?: string; model?: string }
    if (!prompt || typeof prompt !== 'string') return { statusCode: 400, body: 'Provide prompt' }

    // Prefer local Ollama if available
    if (OLLAMA_URL) {
      const m = model || 'llama3:instruct'
      const res = await fetch(`${OLLAMA_URL.replace(/\/$/, '')}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: m, prompt, stream: false })
      })
      if (!res.ok) return { statusCode: 500, body: `Ollama error: ${res.status} ${await res.text()}` }
      const data = await res.json()
      const text = data.response || ''
      return { statusCode: 200, body: JSON.stringify({ text }) }
    }

    // Fallback to OpenAI if configured
    if (OPENAI_API_KEY) {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 500
        })
      })
      if (!res.ok) return { statusCode: 500, body: `OpenAI error: ${res.status} ${await res.text()}` }
      const data = await res.json()
      const text = data.choices?.[0]?.message?.content || ''
      return { statusCode: 200, body: JSON.stringify({ text }) }
    }

    return { statusCode: 503, body: 'No LLM backend configured (set OLLAMA_URL or OPENAI_API_KEY)' }
  } catch (err: any) {
    return { statusCode: 500, body: `Error: ${err.message}` }
  }
}