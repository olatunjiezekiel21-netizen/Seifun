import type { Handler } from '@netlify/functions'

const PALOMA_URL = process.env.PALOMA_API_URL || 'https://api.palomanft.io/v1/listings'

export const handler: Handler = async (event) => {
	if (event.httpMethod !== 'GET') return { statusCode: 405, body: 'Method Not Allowed' }
	try {
		const collection = (event.queryStringParameters?.collection || '').trim()
		const limitRaw = (event.queryStringParameters?.limit || '10').trim()
		const limit = Math.max(1, Math.min(50, parseInt(limitRaw)))
		if (!collection) return { statusCode: 400, body: 'Provide collection (0x...)' }
		const url = new URL(PALOMA_URL)
		url.searchParams.set('collection', collection)
		url.searchParams.set('limit', String(limit))
		const res = await fetch(url.toString())
		if (!res.ok) return { statusCode: res.status, body: await res.text() }
		const data = await res.json()
		return { statusCode: 200, body: JSON.stringify(data) }
	} catch (e: any) {
		return { statusCode: 500, body: e?.message || 'Internal Error' }
	}
}