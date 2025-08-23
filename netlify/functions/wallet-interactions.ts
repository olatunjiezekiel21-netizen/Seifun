import type { Handler } from '@netlify/functions'
import { ethers } from 'ethers'

const EVM_MAINNET = 'https://evm-rpc.sei-apis.com'
const EVM_TESTNET = 'https://evm-rpc-testnet.sei-apis.com'

export const handler: Handler = async (event) => {
	if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }
	try {
		const { address, network = 'testnet', lookbackBlocks = 200_000, limit = 10, mode = 'transfers' } = JSON.parse(event.body || '{}') as { address?: string; network?: 'mainnet' | 'testnet'; lookbackBlocks?: number; limit?: number; mode?: 'transfers' | 'last' }
		if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) return { statusCode: 400, body: 'Provide valid EVM address' }
		const rpc = process.env.SEI_RPC_URL || (network === 'testnet' ? EVM_TESTNET : EVM_MAINNET)
		const provider = new ethers.JsonRpcProvider(rpc)
		const latest = await provider.getBlockNumber()
		const fromBlock = Math.max(0, latest - lookbackBlocks)

		const transferTopic = ethers.id('Transfer(address,address,uint256)')
		const walletTopic = ethers.zeroPadValue(address, 32).toLowerCase()
		const logsIn = await provider.getLogs({ fromBlock, toBlock: latest, topics: [transferTopic, null, walletTopic] }).catch(() => [])
		const logsOut = await provider.getLogs({ fromBlock, toBlock: latest, topics: [transferTopic, walletTopic, null] }).catch(() => [])
		const decode = (log: any) => ({ token: log.address, from: '0x' + log.topics[1].slice(26), to: '0x' + log.topics[2].slice(26), amount: ethers.getBigInt(log.data).toString(), txHash: log.transactionHash, blockNumber: log.blockNumber })
		const all = [...logsIn, ...logsOut].map(decode).sort((a,b)=> b.blockNumber - a.blockNumber).slice(0, Math.max(1, Math.min(100, limit)))
		return { statusCode: 200, body: JSON.stringify({ transfers: all }) }
	} catch (err: any) {
		return { statusCode: 500, body: `Error: ${err.message}` }
	}
}
