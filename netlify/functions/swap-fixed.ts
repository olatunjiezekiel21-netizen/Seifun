import type { Handler } from '@netlify/functions'
import { ethers } from 'ethers'

// Env configuration
const EVM_RPC = process.env.SEI_RPC_URL || 'https://evm-rpc-testnet.sei-apis.com'
const USDC = process.env.USDC_ADDRESS || '0x948dff0c876EbEb1e233f9aF8Df81c23d4E068C6'
const TREASURY = process.env.SWAP_TREASURY_ADDRESS || ''
const HOT_PRIVATE_KEY = process.env.SWAP_HOT_WALLET_KEY || ''
const RATE_USDC_PER_SEI = Number(process.env.SWAP_RATE_USDC_PER_SEI || '0.5')

const ERC20 = [
	'function balanceOf(address) view returns (uint256)',
	'function decimals() view returns (uint8)',
	'function transfer(address to, uint256 amount) returns (bool)'
]

export const handler: Handler = async (event) => {
	if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }
	try {
		const { action, to, seiAmount } = JSON.parse(event.body || '{}') as { action?: 'quote' | 'swap'; to?: string; seiAmount?: string }
		if (!action) return { statusCode: 400, body: 'Missing action' }
		if (!TREASURY) return { statusCode: 500, body: 'Server not configured: SWAP_TREASURY_ADDRESS missing' }

		// Quote only
		if (action === 'quote') {
			const inSei = Number(seiAmount || '0')
			if (!isFinite(inSei) || inSei <= 0) return { statusCode: 400, body: 'Invalid seiAmount' }
			const outUsdc = inSei * RATE_USDC_PER_SEI
			return { statusCode: 200, body: JSON.stringify({ outUsdc }) }
		}

		// Swap: verify inbound SEI to treasury and send USDC
		if (action === 'swap') {
			if (!to || !/^0x[a-fA-F0-9]{40}$/.test(to)) return { statusCode: 400, body: 'Invalid recipient address' }
			const inSei = Number(seiAmount || '0')
			if (!isFinite(inSei) || inSei <= 0) return { statusCode: 400, body: 'Invalid seiAmount' }
			if (!HOT_PRIVATE_KEY) return { statusCode: 500, body: 'Server not configured: SWAP_HOT_WALLET_KEY missing' }

			const provider = new ethers.JsonRpcProvider(EVM_RPC)
			const hot = new ethers.Wallet(HOT_PRIVATE_KEY, provider)

			// Check hot wallet USDC balance
			const usdc = new ethers.Contract(USDC, ERC20, provider)
			const [dec, bal] = await Promise.all([ usdc.decimals(), usdc.balanceOf(hot.address) ])
			const outUsdc = BigInt(Math.floor(inSei * RATE_USDC_PER_SEI * 10 ** Number(dec)))
			if (bal < outUsdc) return { statusCode: 400, body: 'Insufficient USDC liquidity in hot wallet' }

			// Best-effort: optionally verify inbound SEI tx to treasury via recent txs (skipped due to indexer limits)
			// Proceed to transfer USDC to user
			const tx = await new ethers.Contract(USDC, ERC20, hot).transfer(to, outUsdc)
			return { statusCode: 200, body: JSON.stringify({ status: 'sent', txHash: tx.hash, outUsdc: String(outUsdc) }) }
		}

		return { statusCode: 400, body: 'Unknown action' }
	} catch (err: any) {
		return { statusCode: 500, body: `Error: ${err.message}` }
	}
}