import type { Handler } from '@netlify/functions'
import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI as string
const MONGODB_DB = process.env.MONGODB_DB || 'seifu'
const COLLECTION = process.env.MONGODB_RISK_COLLECTION || 'risk_policies'

async function getDb() {
	if (!MONGODB_URI) throw new Error('Missing MONGODB_URI')
	const client = new MongoClient(MONGODB_URI)
	await client.connect()
	return { client, col: client.db(MONGODB_DB).collection(COLLECTION) }
}

export const handler: Handler = async (event) => {
	try {
		if (event.httpMethod === 'POST') {
			const body = JSON.parse(event.body || '{}')
			const { action } = body
			const { client, col } = await getDb()
			try {
				switch (action) {
					case 'flag': {
						const { address, reason, token } = body
						if (!address) return { statusCode: 400, body: 'Missing address' }
						await col.updateOne({ type: 'flags', address: address.toLowerCase(), token: (token||'').toLowerCase() }, { $set: { address: address.toLowerCase(), token: (token||'').toLowerCase(), reason: reason||'flagged', updatedAt: new Date().toISOString() } }, { upsert: true })
						return { statusCode: 200, body: JSON.stringify({ ok: true }) }
					}
					case 'unflag': {
						const { address, token } = body
						if (!address) return { statusCode: 400, body: 'Missing address' }
						await col.deleteOne({ type: 'flags', address: address.toLowerCase(), token: (token||'').toLowerCase() })
						return { statusCode: 200, body: JSON.stringify({ ok: true }) }
					}
					case 'settings': {
						const { token, blockFlags } = body
						if (!token) return { statusCode: 400, body: 'Missing token' }
						await col.updateOne({ type: 'settings', token: token.toLowerCase() }, { $set: { token: token.toLowerCase(), blockFlags: !!blockFlags, updatedAt: new Date().toISOString() } }, { upsert: true })
						return { statusCode: 200, body: JSON.stringify({ ok: true }) }
					}
					case 'check': {
						const { address, token } = body
						if (!address) return { statusCode: 400, body: 'Missing address' }
						const flag = await col.findOne({ type: 'flags', address: address.toLowerCase(), token: (token||'').toLowerCase() })
						const settings = token ? await col.findOne({ type: 'settings', token: token.toLowerCase() }) : null
						return { statusCode: 200, body: JSON.stringify({ flagged: !!flag, reason: flag?.reason || null, block: !!flag && !!settings?.blockFlags }) }
					}
					default:
						return { statusCode: 400, body: 'Unknown action' }
				}
			} finally {
				await client.close()
			}
		}
		if (event.httpMethod === 'GET') {
			const params = event.queryStringParameters || {}
			const { client, col } = await getDb()
			try {
				if (params.list === 'flags') {
					const docs = await col.find({ type: 'flags' }).limit(200).toArray()
					return { statusCode: 200, body: JSON.stringify(docs) }
				}
				if (params.list === 'settings') {
					const docs = await col.find({ type: 'settings' }).limit(200).toArray()
					return { statusCode: 200, body: JSON.stringify(docs) }
				}
				return { statusCode: 400, body: 'Specify list=flags|settings' }
			} finally {
				await client.close()
			}
		}
		return { statusCode: 405, body: 'Method Not Allowed' }
	} catch (err: any) {
		return { statusCode: 500, body: `Error: ${err.message}` }
	}
}