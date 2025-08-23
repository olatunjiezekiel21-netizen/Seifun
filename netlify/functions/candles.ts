import type { Handler } from '@netlify/functions'
import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI as string
const MONGODB_DB = process.env.MONGODB_DB || 'seifu'
const COLLECTION = process.env.MONGODB_TRADES_COLLECTION || 'user_trades'
const USDC = (process.env.USDC_ADDRESS || '0x948dff0c876EbEb1e233f9aF8Df81c23d4E068C6').toLowerCase()

function floorTime(ts: number, intervalMs: number): number { return Math.floor(ts / intervalMs) * intervalMs }

export const handler: Handler = async (event) => {
	if (event.httpMethod !== 'GET') return { statusCode: 405, body: 'Method Not Allowed' }
	if (!MONGODB_URI) return { statusCode: 500, body: 'Missing MONGODB_URI' }
	try {
		const token = (event.queryStringParameters?.token || '').toLowerCase()
		const tf = (event.queryStringParameters?.tf || '1m').toLowerCase()
		if (!token || !token.startsWith('0x')) return { statusCode: 400, body: 'Missing token' }
		const intervalMs = tf === '5m' ? 5*60_000 : tf === '15m' ? 15*60_000 : tf === '1h' ? 60*60_000 : 60_000
		const lookbackMs = 24 * 60 * 60_000
		const since = new Date(Date.now() - lookbackMs)

		const client = new MongoClient(MONGODB_URI)
		await client.connect()
		const col = client.db(MONGODB_DB).collection(COLLECTION)
		const docs = await col.find({ createdAt: { $gte: since.toISOString() } }).sort({ createdAt: 1 }).toArray()
		await client.close()

		// Build trades involving USDC and token
		type Trade = { ts: number; price: number; volumeToken: number }
		const trades: Trade[] = []
		for (const d of docs) {
			const tIn = String(d.tokenIn||'').toLowerCase()
			const tOut = String(d.tokenOut||'').toLowerCase()
			const aIn = Number(d.amountIn||'0')
			const aOut = Number(d.amountOut||'0')
			const ts = new Date(d.createdAt||Date.now()).getTime()
			// token bought with USDC: price = usdc/token
			if (tIn === USDC && tOut === token && aOut > 0 && aIn > 0) {
				trades.push({ ts, price: aIn / aOut, volumeToken: aOut })
				continue
			}
			// token sold to USDC: price = usdc/token
			if (tIn === token && tOut === USDC && aIn > 0 && aOut > 0) {
				trades.push({ ts, price: aOut / aIn, volumeToken: aIn })
			}
		}

		// Aggregate to OHLCV
		const buckets: Record<number, { o:number; h:number; l:number; c:number; v:number }> = {}
		for (const tr of trades) {
			const b = floorTime(tr.ts, intervalMs)
			if (!buckets[b]) buckets[b] = { o: tr.price, h: tr.price, l: tr.price, c: tr.price, v: 0 }
			const bk = buckets[b]
			bk.h = Math.max(bk.h, tr.price)
			bk.l = Math.min(bk.l, tr.price)
			bk.c = tr.price
			bk.v += tr.volumeToken
		}
		const series = Object.entries(buckets).sort((a,b)=>Number(a[0])-Number(b[0])).map(([t, v]) => ({ time: Math.floor(Number(t)/1000), open: v.o, high: v.h, low: v.l, close: v.c, volume: v.v }))
		return { statusCode: 200, body: JSON.stringify({ series, tf }) }
	} catch (err: any) {
		return { statusCode: 500, body: `Error: ${err.message}` }
	}
}