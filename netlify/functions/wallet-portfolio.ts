(cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF'
diff --git a/netlify/functions/wallet-portfolio.ts b/netlify/functions/wallet-portfolio.ts
--- a/netlify/functions/wallet-portfolio.ts
+++ b/netlify/functions/wallet-portfolio.ts
@@ -0,0 +1,85 @@
+import type { Handler } from '@netlify/functions'
+import { ethers } from 'ethers'
+import { StargateClient } from '@cosmjs/stargate'
+
+const EVM_MAINNET = 'https://evm-rpc.sei-apis.com'
+const EVM_TESTNET = 'https://evm-rpc-testnet.sei-apis.com'
+const COSMOS_MAINNET = process.env.SEI_COSMOS_RPC_URL || 'https://sei-rpc.polkachu.com:443'
+
+function isEvm(addr: string): boolean { return /^0x[a-fA-F0-9]{40}$/.test(addr) }
+function isCosmos(addr: string): boolean { return /^sei[a-z0-9]{10,}/.test(addr) }
+
+export const handler: Handler = async (event) => {
+  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }
+  try {
+    const { address, network = 'mainnet', includeSymbols = [] } = JSON.parse(event.body || '{}') as { address?: string; network?: 'mainnet' | 'testnet'; includeSymbols?: string[] }
+    if (!address) return { statusCode: 400, body: 'Missing address' }
+
+    if (isEvm(address)) {
+      const rpc = process.env.SEI_RPC_URL || (network === 'testnet' ? EVM_TESTNET : EVM_MAINNET)
+      const provider = new ethers.JsonRpcProvider(rpc)
+      const nativeBal = await provider.getBalance(address).catch(() => 0n)
+      const nativeSei = Number(ethers.formatUnits(nativeBal, 18))
+
+      // ERC-20 discovery similar to wallet-erc20s
+      const latest = await provider.getBlockNumber()
+      const fromBlock = Math.max(0, latest - 500_000)
+      const transferTopic = ethers.id('Transfer(address,address,uint256)')
+      const walletTopic = ethers.zeroPadValue(address, 32).toLowerCase()
+
+      const contracts = new Set<string>()
+      for (const [idx, topic] of [1, 2].entries()) {
+        const logs = await provider.getLogs({ fromBlock, toBlock: latest, topics: [transferTopic, topic === 1 ? walletTopic : null, topic === 2 ? walletTopic : null] }).catch(() => [])
+        for (const log of logs) if (log.address) contracts.add(log.address.toLowerCase())
+        if (contracts.size >= 100) break
+      }
+
+      const erc20s: Array<{ address: string; symbol: string; balance: number }> = []
+      for (const c of Array.from(contracts)) {
+        try {
+          const erc20 = new ethers.Contract(c, [ 'function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)', 'function symbol() view returns (string)' ], provider)
+          const [raw, dec, sym] = await Promise.all([ erc20.balanceOf(address), erc20.decimals(), erc20.symbol() ])
+          const bal = Number(ethers.formatUnits(raw, Number(dec)))
+          if (bal > 0 || String(sym).length > 0) erc20s.push({ address: c, symbol: String(sym), balance: Number(bal.toFixed(6)) })
+        } catch {}
+        if (erc20s.length >= 100) break
+      }
+
+      // includeSymbols check
+      const includeUpper = includeSymbols.map(s => s.toUpperCase())
+      const heldSymbols = erc20s.filter(t => includeUpper.includes(t.symbol.toUpperCase())).map(t => t.symbol)
+      const notHeldSymbols = includeUpper.filter(s => !heldSymbols.includes(s) && s !== 'SEI')
+      const holdsSei = nativeSei > 0
+      if (includeUpper.includes('SEI') && holdsSei) heldSymbols.push('SEI')
+      if (includeUpper.includes('SEI') && !holdsSei) notHeldSymbols.push('SEI')
+
+      return { statusCode: 200, body: JSON.stringify({
+        network,
+        type: 'evm',
+        native: { symbol: 'SEI', balance: Number(nativeSei.toFixed(6)) },
+        tokens: erc20s,
+        heldSymbols,
+        notHeldSymbols
+      }) }
+    }
+
+    if (isCosmos(address)) {
+      const rpc = COSMOS_MAINNET
+      const client = await StargateClient.connect(rpc)
+      const balances = await client.getAllBalances(address)
+      const tokens = balances.map(b => ({ denom: b.denom, amount: b.amount }))
+      const sei = balances.find(b => b.denom.endsWith('usei'))
+      const nativeSei = sei ? Number(sei.amount) / 1e6 : 0
+      return { statusCode: 200, body: JSON.stringify({
+        network: 'mainnet',
+        type: 'cosmos',
+        native: { symbol: 'SEI', balance: Number(nativeSei.toFixed(6)) },
+        tokens
+      }) }
+    }
+
+    return { statusCode: 400, body: 'Unknown address format. Provide 0x.. (EVM) or sei...' }
+  } catch (err: any) {
+    return { statusCode: 500, body: `Error: ${err.message}` }
+  }
+}
EOF
)
