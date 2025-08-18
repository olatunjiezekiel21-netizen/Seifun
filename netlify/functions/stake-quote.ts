import type { Handler } from '@netlify/functions'

export const handler: Handler = async (event) => {
	if (event.httpMethod !== 'GET') return { statusCode: 405, body: 'Method Not Allowed' }
	try {
		const token = (event.queryStringParameters?.token || 'SEI').toUpperCase()
		const amount = parseFloat(event.queryStringParameters?.amount || '0')
		const apy = token === 'SEI' ? 8.2 : 12.5
		const min = 0.1
		if (amount < min) {
			return { statusCode: 200, body: JSON.stringify({ ok: true, token, apy, minAmount: min, canStake: false, reason: `Minimum is ${min} ${token}` }) }
		}
		return { statusCode: 200, body: JSON.stringify({ ok: true, token, apy, minAmount: min, canStake: true }) }
	} catch (e: any) {
		return { statusCode: 500, body: e?.message || 'Internal Error' }
	}
}