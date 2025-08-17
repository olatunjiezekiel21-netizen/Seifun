import type { Handler } from '@netlify/functions'
import { createPublicClient, http, getAddress } from 'viem'

const SEI_RPC_URL = process.env.SEI_RPC_URL || process.env.VITE_SEI_TESTNET_RPC || 'https://evm-rpc-testnet.sei-apis.com'

const ERC20_ABI = [
  { type: 'function', name: 'balanceOf', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] },
  { type: 'function', name: 'decimals', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint8' }] },
  { type: 'function', name: 'symbol', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'string' }] },
  { type: 'function', name: 'name', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'string' }] }
] as const

function padAddressTopic(addr: string): `0x${string}` {
  const a = addr.toLowerCase().replace(/^0x/, '')
  return `0x000000000000000000000000${a}` as `0x${string}`
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') return { statusCode: 405, body: 'Method Not Allowed' }
  try {
    const walletRaw = (event.queryStringParameters?.wallet || '').trim()
    if (!walletRaw) return { statusCode: 400, body: 'Provide wallet' }
    const wallet = getAddress(walletRaw)
    const client = createPublicClient({ transport: http(SEI_RPC_URL) })

    const latest = await client.getBlockNumber()
    const span = BigInt(100000) // scan ~100k blocks
    const fromBlock = latest > span ? latest - span : 0n

    const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
    const toTopic = padAddressTopic(wallet)

    // Fetch logs where wallet is recipient or sender
    const [toLogs, fromLogs] = await Promise.all([
      client.getLogs({
        fromBlock,
        toBlock: latest,
        topics: [TRANSFER_TOPIC as `0x${string}`, undefined, toTopic]
      }).catch(() => []),
      client.getLogs({
        fromBlock,
        toBlock: latest,
        topics: [TRANSFER_TOPIC as `0x${string}`, toTopic]
      }).catch(() => [])
    ])

    const addresses = new Set<string>()
    for (const l of [...toLogs, ...fromLogs]) {
      if (l.address) addresses.add(getAddress(l.address))
    }

    // Probe balances for discovered contracts
    const results: Array<{ address: string; symbol: string; name?: string; balance: string }> = []
    for (const addr of Array.from(addresses).slice(0, 50)) { // cap to 50 tokens for performance
      try {
        const [raw, dec, sym, nm] = await Promise.all([
          client.readContract({ address: addr as any, abi: ERC20_ABI, functionName: 'balanceOf', args: [wallet] }) as Promise<bigint>,
          client.readContract({ address: addr as any, abi: ERC20_ABI, functionName: 'decimals' }) as Promise<number>,
          client.readContract({ address: addr as any, abi: ERC20_ABI, functionName: 'symbol' }) as Promise<string>,
          client.readContract({ address: addr as any, abi: ERC20_ABI, functionName: 'name' }) as Promise<string>
        ])
        if (raw > 0n) {
          const denom = BigInt(10) ** BigInt(dec)
          const whole = Number(raw) / Number(denom)
          results.push({ address: addr, symbol: sym, name: nm, balance: whole.toFixed(4) })
        }
      } catch {
        continue
      }
    }

    return { statusCode: 200, body: JSON.stringify({ wallet, tokens: results }) }
  } catch (e: any) {
    return { statusCode: 500, body: e?.message || 'Internal Error' }
  }
}