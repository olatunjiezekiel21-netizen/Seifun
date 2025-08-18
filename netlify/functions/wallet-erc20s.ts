import type { Handler } from '@netlify/functions'
import { ethers } from 'ethers'

// Simple ERC-20 discovery via Transfer logs and balance checks
// Input: { address: string, lookbackBlocks?: number, maxContracts?: number }

const DEFAULT_RPC = process.env.SEI_RPC_URL || 'https://evm-rpc-testnet.sei-apis.com'

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }
  try {
    const { address, lookbackBlocks = 500_000, maxContracts = 50 } = JSON.parse(event.body || '{}') as { address?: string; lookbackBlocks?: number; maxContracts?: number }
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) return { statusCode: 400, body: 'Provide valid address' }

    const provider = new ethers.JsonRpcProvider(DEFAULT_RPC)
    const latest = await provider.getBlockNumber()
    const fromBlock = Math.max(0, latest - lookbackBlocks)
    const transferTopic = ethers.id('Transfer(address,address,uint256)')

    // Gather contracts where address appeared as from or to
    const contracts = new Set<string>()
    const addrs = [
      { name: 'to', topic: ethers.zeroPadValue(address, 32).toLowerCase(), index: 2 },
      { name: 'from', topic: ethers.zeroPadValue(address, 32).toLowerCase(), index: 1 }
    ]

    for (const role of addrs) {
      const logs = await provider.getLogs({
        fromBlock,
        toBlock: latest,
        topics: [transferTopic, role.index === 1 ? role.topic : null, role.index === 2 ? role.topic : null]
      }).catch(() => [])
      for (const log of logs) {
        if (contracts.size >= maxContracts) break
        if (log.address) contracts.add(log.address.toLowerCase())
      }
      if (contracts.size >= maxContracts) break
    }

    // Probe each contract for ERC-20 interface and balances
    const results: Array<{ address: string; symbol: string; balance: string }> = []
    for (const c of Array.from(contracts)) {
      try {
        const erc20 = new ethers.Contract(c, [
          'function balanceOf(address) view returns (uint256)',
          'function decimals() view returns (uint8)',
          'function symbol() view returns (string)'
        ], provider)
        const [raw, dec, sym] = await Promise.all([
          erc20.balanceOf(address),
          erc20.decimals(),
          erc20.symbol()
        ])
        const bal = Number(ethers.formatUnits(raw, dec))
        // Only include non-zero or known symbols
        if (bal > 0 || String(sym).length > 0) {
          results.push({ address: c, symbol: String(sym), balance: bal.toFixed(4) })
        }
      } catch {
        continue
      }
    }

    return { statusCode: 200, body: JSON.stringify({ tokens: results }) }
  } catch (err: any) {
    return { statusCode: 500, body: `Error: ${err.message}` }
  }
}

