import { Address } from 'viem'
import { cambrianSeiAgent } from './CambrianSeiAgent'

export class SeiAgentKit {
  private mode: string
  private usdc: string

  constructor() {
    this.mode = (process as any).env?.NETWORK_MODE || (import.meta as any).env?.VITE_NETWORK_MODE || 'testnet'
    this.usdc = (import.meta as any).env?.VITE_USDC_TESTNET || '0x4fCF1784B31630811181f670Aea7A7bEF803eaED'
  }

  resolveTicker(t: string): Address {
    const s = (t || '').trim().toUpperCase()
    if (s === 'SEI' || s === 'WSEI' || s === 'NATIVE' || s === 'ETH') return '0x0' as Address
    if (s === 'USDC') return this.usdc as Address
    if (/^0x[a-fA-F0-9]{40}$/.test(t)) return t as Address
    throw new Error(`Unknown token ticker: ${t}`)
  }

  async quote(amount: string, tokenInTicker: string, tokenOutTicker: string) {
    const tokenIn = this.resolveTicker(tokenInTicker)
    const tokenOut = this.resolveTicker(tokenOutTicker)
    return await cambrianSeiAgent.getSwapQuote({ tokenIn, tokenOut, amount })
  }

  async swap(amount: string, tokenInTicker: string, tokenOutTicker: string) {
    const tokenIn = this.resolveTicker(tokenInTicker)
    const tokenOut = this.resolveTicker(tokenOutTicker)
    return await cambrianSeiAgent.swapTokens({ tokenIn, tokenOut, amount })
  }
}

export const seiAgentKit = new SeiAgentKit()
