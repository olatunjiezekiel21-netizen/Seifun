import type { Handler } from '@netlify/functions'
import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI as string
const DB = process.env.MONGODB_DB || 'seifu'
const COLLECTION = process.env.MONGODB_TOKENS_COLLECTION || 'tokens'

export const handler: Handler = async (event) => {
	if (!MONGODB_URI) return { statusCode: 500, body: 'Missing MONGODB_URI' }
	try {
		const client = new MongoClient(MONGODB_URI)
		await client.connect()
		const col = client.db(DB).collection(COLLECTION)
		try {
			if (event.httpMethod === 'GET') {
				const addr = (event.queryStringParameters?.address || '').toLowerCase()
				if (addr) {
					const token = await col.findOne({ address: addr })
					return { statusCode: 200, body: JSON.stringify(token || null) }
				}
				const tokens = await col.find({}).sort({ createdAt: -1 }).limit(1000).toArray()
				return { statusCode: 200, body: JSON.stringify(tokens) }
			}
			if (event.httpMethod === 'POST') {
				const body = JSON.parse(event.body || '{}')
				if (!body.address) return { statusCode: 400, body: 'Missing address' }
				const doc = {
					address: String(body.address).toLowerCase(),
					name: body.name || '',
					symbol: body.symbol || '',
					description: body.description || '',
					totalSupply: body.totalSupply || '0',
					decimals: body.decimals || 18,
					creator: body.creator || '',
					createdAt: body.createdAt || new Date().toISOString(),
					verified: !!body.verified,
					securityScore: Number(body.securityScore || 0),
					holders: Number(body.holders || 0),
					liquidity: Number(body.liquidity || 0),
					marketCap: Number(body.marketCap || 0),
					volume24h: Number(body.volume24h || 0),
					price: Number(body.price || 0),
					priceChange24h: Number(body.priceChange24h || 0),
					tokenImage: body.tokenImage || '',
					launchType: body.launchType || 'fair'
				}
				await col.updateOne({ address: doc.address }, { $set: doc }, { upsert: true })
				return { statusCode: 200, body: JSON.stringify({ ok: true }) }
			}
			return { statusCode: 405, body: 'Method Not Allowed' }
		} finally {
			await client.close()
		}
	} catch (err: any) {
		return { statusCode: 500, body: `Error: ${err.message}` }
	}
}