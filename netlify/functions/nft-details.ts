import type { Handler } from '@netlify/functions'
import { createPublicClient, http, getAddress } from 'viem'

const SEI_RPC_URL = process.env.SEI_RPC_URL || process.env.VITE_SEI_MAINNET_RPC || 'https://evm-rpc.sei-apis.com'

const ERC721_ABI = [
	{ type: 'function', name: 'tokenURI', stateMutability: 'view', inputs: [{ name: 'tokenId', type: 'uint256' }], outputs: [{ name: '', type: 'string' }] }
] as const

function resolveUri(uri: string): string {
	if (!uri) return ''
	if (uri.startsWith('ipfs://')) return `https://ipfs.io/ipfs/${uri.replace('ipfs://', '')}`
	return uri
}

export const handler: Handler = async (event) => {
	if (event.httpMethod !== 'GET') return { statusCode: 405, body: 'Method Not Allowed' }
	try {
		const collection = (event.queryStringParameters?.collection || '').trim()
		const tokenIdRaw = (event.queryStringParameters?.tokenId || '').trim()
		if (!collection || !tokenIdRaw) return { statusCode: 400, body: 'Provide collection (0x...) and tokenId' }
		let tokenId: bigint
		try { tokenId = BigInt(tokenIdRaw) } catch { return { statusCode: 400, body: 'Invalid tokenId' } }

		const client = createPublicClient({ transport: http(SEI_RPC_URL) })
		let tokenUri = ''
		try {
			tokenUri = await client.readContract({
				address: getAddress(collection),
				abi: ERC721_ABI,
				functionName: 'tokenURI',
				args: [tokenId]
			}) as string
		} catch (e: any) {
			return { statusCode: 502, body: `Failed to read tokenURI: ${e?.message || e}` }
		}

		const resolved = resolveUri(tokenUri)
		let metadata: any = null
		try {
			const res = await fetch(resolved)
			if (res.ok) {
				metadata = await res.json().catch(async () => ({ raw: await res.text() }))
			}
		} catch {}

		if (metadata && metadata.image) metadata.image = resolveUri(metadata.image)
		return {
			statusCode: 200,
			body: JSON.stringify({
				collection: getAddress(collection),
				tokenId: tokenId.toString(),
				tokenUri,
				resolvedUri: resolved,
				metadata: metadata || null
			})
		}
	} catch (e: any) {
		return { statusCode: 500, body: e?.message || 'Internal Error' }
	}
}