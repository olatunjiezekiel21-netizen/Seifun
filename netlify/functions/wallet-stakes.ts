import type { Handler } from '@netlify/functions'
import { ethers } from 'ethers'

const EVM_MAINNET = 'https://evm-rpc.sei-apis.com'
const EVM_TESTNET = 'https://evm-rpc-testnet.sei-apis.com'
const PRECOMPILE = '0x0000000000000000000000000000000000001005'

const STAKING_ABI = [
	{ type: 'function', name: 'getDelegations', stateMutability: 'view', inputs: [{ name: 'd', type: 'address' }], outputs: [{ name: 'validators', type: 'address[]' }, { name: 'amounts', type: 'uint256[]' }] },
	{ type: 'function', name: 'pendingRewards', stateMutability: 'view', inputs: [{ name: 'd', type: 'address' }, { name: 'v', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] }
] as const

export const handler: Handler = async (event) => {
	if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }
	try {
		const { address, network = 'testnet' } = JSON.parse(event.body || '{}') as { address?: string; network?: 'mainnet' | 'testnet' }
		if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) return { statusCode: 400, body: 'Provide valid EVM address' }
		const rpc = process.env.SEI_RPC_URL || (network === 'testnet' ? EVM_TESTNET : EVM_MAINNET)
		const provider = new ethers.JsonRpcProvider(rpc)
		// Verify precompile available
		try { await provider.getCode(PRECOMPILE) } catch {}
		const staking = new ethers.Contract(PRECOMPILE, STAKING_ABI as any, provider)
		let validators: string[] = []
		let amounts: bigint[] = []
		try {
			const res = await staking.getDelegations(address)
			validators = (res?.[0] || []) as string[]
			amounts = (res?.[1] || []) as bigint[]
		} catch (e:any) {
			return { statusCode: 200, body: JSON.stringify({ delegations: [], rewards: [], note: `getDelegations failed: ${e?.message||e}` }) }
		}
		const delegations = validators.map((v, i) => ({ validator: v, amount: Number(ethers.formatEther(amounts[i] || 0n)) }))
		const rewards: Array<{ validator: string; amount: number }> = []
		for (const v of validators.slice(0, 50)) {
			try {
				const r: bigint = await staking.pendingRewards(address, v)
				rewards.push({ validator: v, amount: Number(ethers.formatEther(r)) })
			} catch {}
		}
		const totalDelegated = delegations.reduce((s, d) => s + d.amount, 0)
		const totalRewards = rewards.reduce((s, r) => s + r.amount, 0)
		return { statusCode: 200, body: JSON.stringify({ network, address, totalDelegated, totalRewards, delegations, rewards }) }
	} catch (err: any) {
		return { statusCode: 500, body: `Error: ${err.message}` }
	}
}