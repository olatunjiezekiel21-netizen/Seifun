(cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF'
diff --git a/src/langchain/symphony/swap.ts b/src/langchain/symphony/swap.ts
--- a/src/langchain/symphony/swap.ts
+++ b/src/langchain/symphony/swap.ts
@@ -0,0 +1,28 @@
+import { SeiAgentKit } from '../../services/SeiAgentKit'
+
+export type SwapParams = {
+  amount: string
+  tokenInTicker: string
+  tokenOutTicker: string
+}
+
+export class SeiSwapTool {
+  name = 'sei_swap'
+  description = 'Swap tokens on Sei using Symphony/Router'
+  private kit: SeiAgentKit
+
+  constructor(kit: SeiAgentKit) {
+    this.kit = kit
+  }
+
+  async call(input: SwapParams): Promise<any> {
+    const { amount, tokenInTicker, tokenOutTicker } = input
+    if (!amount || !tokenInTicker || !tokenOutTicker) throw new Error('Missing amount/tokenInTicker/tokenOutTicker')
+
+    const quote = await this.kit.quote(amount, tokenInTicker, tokenOutTicker)
+    if (!quote || Number(quote.outputAmount) <= 0) throw new Error('No route/liquidity for this pair')
+
+    const res = await this.kit.swap(amount, tokenInTicker, tokenOutTicker)
+    return { message: res, quote }
+  }
+}
EOF
)
