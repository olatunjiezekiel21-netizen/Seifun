import { z } from 'zod'
import { cambrianSeiAgent } from '../services/CambrianSeiAgent'

const EvmAddress = z.string().regex(/^0x[a-fA-F0-9]{40}$|^0x0$/, 'Invalid address (use 0x.. or 0x0 for native SEI)')

export const QuoteArgs = z.object({
  inToken: z.string().min(1),
  outToken: z.string().min(1),
  amount: z.string().min(1)
})

export const ExecArgs = z.object({
  inToken: z.string().min(1),
  outToken: z.string().min(1),
  amountIn: z.string().min(1),
  minOut: z.string().min(1).optional(),
  deadlineSec: z.number().int().positive().optional()
})

function normalizeToken(t: string): string {
  const x = t.trim().toLowerCase()
  if (x === 'sei' || x === 'native' || x === '0x0') return '0x0'
  return t
}

export async function tool_quote_swap(raw: unknown) {
  const args = QuoteArgs.parse(raw)
  const tokenIn = normalizeToken(args.inToken)
  const tokenOut = normalizeToken(args.outToken)
  // Validate after normalization
  EvmAddress.parse(tokenIn)
  EvmAddress.parse(tokenOut)
  const quote = await cambrianSeiAgent.getSwapQuote({
    tokenIn: tokenIn as any,
    tokenOut: tokenOut as any,
    amount: args.amount
  })
  return {
    route: quote.route || [],
    expectedOut: String(quote.outputAmount ?? ''),
    priceImpactPct: Number(quote.priceImpact ?? 0),
    gasEstimate: 'unknown'
  }
}

export async function tool_execute_swap(raw: unknown) {
  const args = ExecArgs.parse(raw)
  const tokenIn = normalizeToken(args.inToken)
  const tokenOut = normalizeToken(args.outToken)
  EvmAddress.parse(tokenIn)
  EvmAddress.parse(tokenOut)

  // Optional: pre-quote and check slippage
  const pre = await cambrianSeiAgent.getSwapQuote({
    tokenIn: tokenIn as any,
    tokenOut: tokenOut as any,
    amount: args.amountIn
  })
  const impact = Number(pre.priceImpact ?? 0)
  if (impact > 5) {
    throw new Error(`High price impact (${impact.toFixed(2)}%). Refusing by policy.`)
  }

  // Execute swap (approval handled internally)
  const res = await cambrianSeiAgent.swapTokens({
    tokenIn: tokenIn as any,
    tokenOut: tokenOut as any,
    amount: args.amountIn
  })

  // Try to extract tx hash from message
  const txMatch = /TX:\s*(0x[a-fA-F0-9]{64})/i.exec(res)
  const txHash = txMatch ? txMatch[1] : ''

  return {
    txHash,
    message: res,
    priceImpactPct: impact,
    expectedOut: String(pre.outputAmount ?? '')
  }
}