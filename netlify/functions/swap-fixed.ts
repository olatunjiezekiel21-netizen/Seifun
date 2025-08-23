import type { Handler } from '@netlify/functions'
import { ethers } from 'ethers'

const EVM_MAINNET = 'https://evm-rpc.sei-apis.com'
const EVM_TESTNET = 'https://evm-rpc-testnet.sei-apis.com'
const USDC = process.env.USDC_ADDRESS || '0x948dff0c876EbEb1e233f9aF8Df81c23d4E068C6'
const TREASURY = process.env.SWAP_TREASURY_ADDRESS || ''
const HOT_PRIVATE_KEY = process.env.SWAP_HOT_WALLET_KEY || ''
const RATE_USDC_PER_SEI = Number(process.env.SWAP_RATE_USDC_PER_SEI || '0.5')

const ERC20 = [
	'function balanceOf(address) view returns (uint256)',
	'function decimals() view returns (uint8)',
	'function transfer(address to, uint256 amount) returns (bool)'
]

async function logTrade(payload: any) {
	try { await fetch(process.env.URL ? `${process.env.URL}/.netlify/functions/trade-log` : '/.netlify/functions/trade-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }) } catch {}
}

export const handler: Handler = async (event) => {
	if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }
	try {
		const { action, to, seiAmount, usdcAmount, direction } = JSON.parse(event.body || '{}') as { action?: 'quote' | 'swap'; to?: string; seiAmount?: string; usdcAmount?: string; direction?: 'SEI_TO_USDC' | 'USDC_TO_SEI' }
		if (!action) return { statusCode: 400, body: 'Missing action' }
		if (!TREASURY) return { statusCode: 500, body: 'Server not configured: SWAP_TREASURY_ADDRESS missing' }
		const provider = new ethers.JsonRpcProvider(process.env.SEI_RPC_URL || EVM_TESTNET)

		// Quote only
		if (action === 'quote') {
			if (seiAmount) {
				const inSei = Number(seiAmount)
				if (!isFinite(inSei) || inSei <= 0) return { statusCode: 400, body: 'Invalid seiAmount' }
				const outUsdc = inSei * RATE_USDC_PER_SEI
				return { statusCode: 200, body: JSON.stringify({ outUsdc }) }
			}
			if (usdcAmount) {
				const inUsdc = Number(usdcAmount)
				if (!isFinite(inUsdc) || inUsdc <= 0) return { statusCode: 400, body: 'Invalid usdcAmount' }
				const outSei = inUsdc / RATE_USDC_PER_SEI
				return { statusCode: 200, body: JSON.stringify({ outSei }) }
			}
			return { statusCode: 400, body: 'Provide seiAmount or usdcAmount for quote' }
		}

		// Swap execution
		if (action === 'swap') {
			if (!to || !/^0x[a-fA-F0-9]{40}$/.test(to)) return { statusCode: 400, body: 'Invalid recipient address' }
			if (!HOT_PRIVATE_KEY) return { statusCode: 500, body: 'Server not configured: SWAP_HOT_WALLET_KEY missing' }
			const hot = new ethers.Wallet(HOT_PRIVATE_KEY, provider)

			if ((direction || 'SEI_TO_USDC') === 'SEI_TO_USDC') {
				const inSei = Number(seiAmount || '0')
				if (!isFinite(inSei) || inSei <= 0) return { statusCode: 400, body: 'Invalid seiAmount' }
				const usdc = new ethers.Contract(USDC, ERC20, provider)
				const [dec, bal] = await Promise.all([ usdc.decimals(), usdc.balanceOf(hot.address) ])
				const outUsdc = BigInt(Math.floor(inSei * RATE_USDC_PER_SEI * 10 ** Number(dec)))
				if (bal < outUsdc) return { statusCode: 400, body: 'Insufficient USDC liquidity in hot wallet' }
				const tx = await new ethers.Contract(USDC, ERC20, hot).transfer(to, outUsdc)
				await logTrade({ wallet: to, dex: 'fixed', tokenIn: '0x0', tokenOut: USDC, amountIn: String(inSei), amountOut: String(Number(outUsdc)/10**Number(dec)), txHash: tx.hash, status: 'success' })
				return { statusCode: 200, body: JSON.stringify({ status: 'sent', txHash: tx.hash, outUsdc: String(outUsdc) }) }
			}

			// USDC -> SEI
			const inUsdc = Number(usdcAmount || '0')
			if (!isFinite(inUsdc) || inUsdc <= 0) return { statusCode: 400, body: 'Invalid usdcAmount' }
			const outSeiWei = ethers.parseEther(String(inUsdc / RATE_USDC_PER_SEI))
			const hotBalance = await provider.getBalance(hot.address)
			if (hotBalance < outSeiWei) return { statusCode: 400, body: 'Insufficient SEI liquidity in hot wallet' }
			const tx = await hot.sendTransaction({ to, value: outSeiWei })
			await logTrade({ wallet: to, dex: 'fixed', tokenIn: USDC, tokenOut: '0x0', amountIn: String(inUsdc), amountOut: String(Number(ethers.formatEther(outSeiWei))), txHash: tx.hash, status: 'success' })
			return { statusCode: 200, body: JSON.stringify({ status: 'sent', txHash: tx.hash, outSei: String(outSeiWei) }) }
		}

		return { statusCode: 400, body: 'Unknown action' }
	} catch (err: any) {
		return { statusCode: 500, body: `Error: ${err.message}` }
	}
}