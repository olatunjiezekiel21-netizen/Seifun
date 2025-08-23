import type { Handler } from '@netlify/functions'
import { ethers } from 'ethers'

const EVM_MAINNET = 'https://evm-rpc.sei-apis.com'
const EVM_TESTNET = 'https://evm-rpc-testnet.sei-apis.com'

export const handler: Handler = async (event) => {
	if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }
	try {
		const { address, network = 'testnet', lookbackBlocks = 200_000, limit = 10, includeNative = true, nativeBlocks = 300, hours } = JSON.parse(event.body || '{}') as { address?: string; network?: 'mainnet' | 'testnet'; lookbackBlocks?: number; limit?: number; includeNative?: boolean; nativeBlocks?: number; hours?: number }
		if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) return { statusCode: 400, body: 'Provide valid EVM address' }
		const rpc = process.env.SEI_RPC_URL || (network === 'testnet' ? EVM_TESTNET : EVM_MAINNET)
		const provider = new ethers.JsonRpcProvider(rpc)
		const latest = await provider.getBlockNumber()
		const maxLogsWindow = 50_000
		const estBlocksPerHour = 3600 // approx; adjust if needed per network
		const windowFromHours = hours && hours > 0 ? Math.min(maxLogsWindow, Math.max(1000, Math.floor(hours * estBlocksPerHour))) : undefined
		const window = windowFromHours ?? Math.max(1_000, Math.min(maxLogsWindow, lookbackBlocks))
		const fromBlock = Math.max(0, latest - window)

		const transferTopic = ethers.id('Transfer(address,address,uint256)')
		const walletTopic = ethers.zeroPadValue(address, 32).toLowerCase()
		let logsIn: any[] = []
		let logsOut: any[] = []
		try {
			logsIn = await provider.getLogs({ fromBlock, toBlock: latest, topics: [transferTopic, null, walletTopic] })
			logsOut = await provider.getLogs({ fromBlock, toBlock: latest, topics: [transferTopic, walletTopic, null] })
		} catch (e:any) {
			return { statusCode: 200, body: JSON.stringify({ transfers: [], native: [], note: `log query failed: ${e?.message||e}` }) }
		}
		const decode = (log: any) => ({ token: log.address, from: '0x' + log.topics[1].slice(26), to: '0x' + log.topics[2].slice(26), amount: ethers.getBigInt(log.data).toString(), txHash: log.transactionHash, blockNumber: log.blockNumber })
		const erc20Transfers = [...logsIn, ...logsOut].map(decode).sort((a,b)=> b.blockNumber - a.blockNumber).slice(0, Math.max(1, Math.min(100, limit)))

		let nativeTransfers: Array<{ from: string; to: string; value: string; txHash: string; blockNumber: number }> = []
		if (includeNative) {
			const scanBlocks = Math.max(10, Math.min(2000, nativeBlocks))
			for (let b = latest; b > latest - scanBlocks && b >= 0 && nativeTransfers.length < limit; b--) {
				const blk = await provider.getBlock(b, true).catch(()=>null)
				if (!blk || !Array.isArray((blk as any).transactions)) continue
				for (const tx of (blk as any).transactions as any[]) {
					const from = (tx.from || '').toLowerCase()
					const to = (tx.to || '').toLowerCase()
					if (from === address.toLowerCase() || to === address.toLowerCase()) {
						nativeTransfers.push({ from: tx.from, to: tx.to || '0x', value: ethers.formatEther(tx.value || 0), txHash: tx.hash, blockNumber: tx.blockNumber })
						if (nativeTransfers.length >= limit) break
					}
				}
			}
		}

		return { statusCode: 200, body: JSON.stringify({ transfers: erc20Transfers, native: nativeTransfers }) }
	} catch (err: any) {
		return { statusCode: 500, body: `Error: ${err.message}` }
	}
}
