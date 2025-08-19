import {
  createPublicClient,
  createWalletClient,
  http,
  type Address,
  type PublicClient,
  type WalletClient,
  type Chain
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { Symphony } from 'symphony-sdk/viem'

// Shared param interfaces consumed by ActionBrain
export interface SwapParams {
  tokenIn: Address
  tokenOut: Address
  amount: string
}

export interface StakeParams {
  amount: string
  action?: 'delegate' | 'undelegate' | 'redelegate' | 'query' | 'claim'
  validator?: Address
  newValidator?: Address
}

export interface LendingParams {
  amount: string
  token: string
}

export interface TradingParams {
  market: string
  side: 'long' | 'short'
  size: string
  leverage?: number
}

export class CambrianSeiAgent {
  public publicClient: PublicClient
  public walletClient: WalletClient
  private symphonySDK: Symphony
  private walletAddress: Address

  constructor(privateKey: string) {
    const account = privateKeyToAccount(privateKey as Address)

    const mode = (process as any).env?.NETWORK_MODE || (import.meta as any).env?.VITE_NETWORK_MODE || 'testnet'
    const rpcUrl = mode === 'mainnet' ? 'https://evm-rpc.sei-apis.com' : 'https://evm-rpc-testnet.sei-apis.com'

    const seiMainnet: Chain = {
      id: 1329,
      name: 'Sei Mainnet',
      nativeCurrency: { name: 'Sei', symbol: 'SEI', decimals: 18 },
      rpcUrls: { default: { http: [rpcUrl] }, public: { http: [rpcUrl] } }
    } as unknown as Chain
    const seiTestnet: Chain = {
      id: 1328,
      name: 'Sei Testnet',
      nativeCurrency: { name: 'Sei', symbol: 'SEI', decimals: 18 },
      rpcUrls: { default: { http: [rpcUrl] }, public: { http: [rpcUrl] } }
    } as unknown as Chain
    const chain = mode === 'mainnet' ? seiMainnet : seiTestnet

    this.publicClient = createPublicClient({ chain, transport: http(rpcUrl) })
    this.walletClient = createWalletClient({ account, chain, transport: http(rpcUrl) })
    this.walletAddress = account.address

    this.symphonySDK = new Symphony({ walletClient: this.walletClient })
    this.symphonySDK.connectWalletClient(this.walletClient)
  }

  getAddress(): string { return this.walletAddress }

  // Native SEI balance or ERC-20 balance
  async getBalance(tokenAddress?: Address): Promise<string> {
    try {
      if (!tokenAddress || tokenAddress === ('0x0' as any)) {
        const bal = await this.publicClient.getBalance({ address: this.walletAddress })
        return (Number(bal) / 1e18).toFixed(4)
      }
      const decimals = await this.publicClient.readContract({
        address: tokenAddress,
        abi: [{ name: 'decimals', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint8' }] }],
        functionName: 'decimals'
      }) as number
      const raw = await this.publicClient.readContract({
        address: tokenAddress,
        abi: [{ name: 'balanceOf', type: 'function', stateMutability: 'view', inputs: [{ name: 'a', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] }],
        functionName: 'balanceOf',
        args: [this.walletAddress]
      }) as bigint
      return (Number(raw) / 10 ** Number(decimals)).toFixed(4)
    } catch {
      return '0.0000'
    }
  }

  // Symphony quote (wrap native SEI as needed)
  async getSwapQuote(params: SwapParams): Promise<{ inputAmount: string; outputAmount: number; priceImpact: number; route: any[] }> {
    const WSEI = (import.meta as any).env?.VITE_WSEI_TESTNET || '0x3894085ef7ff0f0aedf52e2a2704928d1ec074f1'
    const tokenIn = params.tokenIn === ('0x0' as any) ? (WSEI as any) : params.tokenIn
    const tokenOut = params.tokenOut === ('0x0' as any) ? (WSEI as any) : params.tokenOut
    const route = await this.symphonySDK.getRoute(tokenIn, tokenOut, params.amount)
    const out = Number(route?.outputAmount ?? 0)
    const pi = Number(route?.priceImpact ?? 0)
    return { inputAmount: params.amount, outputAmount: isFinite(out) ? out : 0, priceImpact: isFinite(pi) ? pi : 0, route: route?.path ?? [] }
  }

  // Symphony swap flow
  async swapTokens(params: SwapParams): Promise<string> {
    const WSEI = (import.meta as any).env?.VITE_WSEI_TESTNET || '0x3894085ef7ff0f0aedf52e2a2704928d1ec074f1'
    const isNativeIn = params.tokenIn === ('0x0' as any)
    const tokenIn = isNativeIn ? (WSEI as any) : params.tokenIn
    const tokenOut = params.tokenOut === ('0x0' as any) ? (WSEI as any) : params.tokenOut

    const balance = await this.getBalance(isNativeIn ? undefined : tokenIn)
    if (Number(balance) < Number(params.amount)) throw new Error(`Insufficient balance. Have: ${balance}, Need: ${params.amount}`)

    const route = await this.symphonySDK.getRoute(tokenIn, tokenOut, params.amount)
    const approved = await route.checkApproval()
    if (!approved) await route.giveApproval()
    const { swapReceipt } = await route.swap()
    return `✅ Swap completed on Sei Testnet! TX: ${swapReceipt.transactionHash}`
  }

  // Token creation via factory
  async createToken(params: { name: string; symbol: string; totalSupply: string; decimals?: number; valueSei?: string }): Promise<{ txHash: string }> {
    const mode = (process as any).env?.NETWORK_MODE || (import.meta as any).env?.VITE_NETWORK_MODE || 'testnet'
    const FACTORY_ADDRESS = mode === 'mainnet'
      ? ((import.meta as any).env?.VITE_FACTORY_ADDRESS_MAINNET || '0x46287770F8329D51004560dC3BDED879A6565B9A')
      : ((import.meta as any).env?.VITE_FACTORY_ADDRESS_TESTNET || '0x50C0b92b3BC34D7FeD7Da0C48a2F16a636D95C9F')

    const bytecode = await this.publicClient.getBytecode({ address: FACTORY_ADDRESS as any }).catch(() => null)
    if (!bytecode || bytecode === '0x') throw new Error(`Token factory not deployed on ${mode}. Set VITE_FACTORY_ADDRESS_${mode.toUpperCase()}`)

    const abi = [{
      type: 'function', name: 'createToken', stateMutability: 'payable',
      inputs: [
        { name: 'name', type: 'string' },
        { name: 'symbol', type: 'string' },
        { name: 'decimals', type: 'uint8' },
        { name: 'totalSupply', type: 'uint256' }
      ], outputs: [{ name: '', type: 'address' }]
    }] as const
    const feeSei = params.valueSei ?? (mode === 'mainnet' ? '0.2' : '2')
    const valueWei = BigInt(Math.floor(parseFloat(feeSei) * 1e18))
    const txHash = await this.walletClient.writeContract({
      address: FACTORY_ADDRESS as any,
      abi: abi as any,
      functionName: 'createToken',
      args: [params.name, params.symbol, params.decimals ?? 18, BigInt(params.totalSupply)],
      value: valueWei
    })
    return { txHash: txHash as string }
  }

  // Staking helpers via precompile (env-configurable)
  async getDelegations(): Promise<Array<{ validator: Address; amount: string }>> {
    const precompile = ((import.meta as any).env?.VITE_STAKING_PRECOMPILE || '0x0000000000000000000000000000000000001005') as Address
    const out: Array<{ validator: Address; amount: string }> = []
    try {
      const abi = [{ type: 'function', name: 'getDelegations', stateMutability: 'view', inputs: [{ name: 'd', type: 'address' }], outputs: [{ name: 'validators', type: 'address[]' }, { name: 'amounts', type: 'uint256[]' }] }]
      const res = await this.publicClient.readContract({ address: precompile, abi: abi as any, functionName: 'getDelegations', args: [this.walletAddress] }) as any
      const validators = res?.[0] || []
      const amounts = res?.[1] || []
      for (let i = 0; i < Math.min(validators.length, amounts.length); i++) {
        out.push({ validator: validators[i], amount: (Number(amounts[i]) / 1e18).toFixed(4) })
      }
    } catch {}
    return out
  }

  async getPendingRewards(validator?: Address): Promise<{ total: string; byValidator: Array<{ validator: Address; amount: string }> }> {
    const precompile = ((import.meta as any).env?.VITE_STAKING_PRECOMPILE || '0x0000000000000000000000000000000000001005') as Address
    const byValidator: Array<{ validator: Address; amount: string }> = []
    let total = 0
    try {
      if (validator) {
        const abi = [{ type: 'function', name: 'pendingRewards', stateMutability: 'view', inputs: [{ name: 'd', type: 'address' }, { name: 'v', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] }]
        const r = await this.publicClient.readContract({ address: precompile, abi: abi as any, functionName: 'pendingRewards', args: [this.walletAddress, validator] }) as bigint
        total += Number(r)
        byValidator.push({ validator, amount: (Number(r) / 1e18).toFixed(4) })
      }
    } catch {}
    return { total: (total / 1e18).toFixed(4), byValidator }
  }

  async claimRewards(validator?: Address): Promise<string> {
    const precompile = ((import.meta as any).env?.VITE_STAKING_PRECOMPILE || '0x0000000000000000000000000000000000001005') as Address
    if (validator) {
      const hash = await this.walletClient.writeContract({ address: precompile, abi: [{ type: 'function', name: 'withdrawRewards', stateMutability: 'nonpayable', inputs: [{ name: 'v', type: 'address' }], outputs: [] }] as any, functionName: 'withdrawRewards', args: [validator] })
      return `✅ Claimed rewards from ${validator}. TX: ${hash}`
    }
    const hash2 = await this.walletClient.writeContract({ address: precompile, abi: [{ type: 'function', name: 'withdrawAllRewards', stateMutability: 'nonpayable', inputs: [], outputs: [] }] as any, functionName: 'withdrawAllRewards', args: [] as any })
    return `✅ Claimed all rewards. TX: ${hash2}`
  }

  async stakeTokens(params: StakeParams): Promise<string> {
    const precompile = ((import.meta as any).env?.VITE_STAKING_PRECOMPILE || '0x0000000000000000000000000000000000001005') as Address
    const code = await this.publicClient.getBytecode({ address: precompile }).catch(() => null)
    if (!code || code === '0x') throw new Error('Staking precompile not available on this network')
    const valueWei = BigInt(Math.floor(parseFloat(params.amount) * 1e18))
    if ((params.action || 'delegate') === 'delegate') {
      if (!params.validator) throw new Error('Provide validator address')
      const h = await this.walletClient.writeContract({ address: precompile, abi: [{ type: 'function', name: 'delegate', stateMutability: 'payable', inputs: [{ name: 'v', type: 'address' }], outputs: [] }] as any, functionName: 'delegate', args: [params.validator], value: valueWei })
      return `✅ Delegated ${params.amount} SEI to ${params.validator}. TX: ${h}`
    }
    if (params.action === 'undelegate') {
      if (!params.validator) throw new Error('Provide validator address')
      const h = await this.walletClient.writeContract({ address: precompile, abi: [{ type: 'function', name: 'undelegate', stateMutability: 'nonpayable', inputs: [{ name: 'v', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [] }] as any, functionName: 'undelegate', args: [params.validator, valueWei] })
      return `✅ Undelegated ${params.amount} SEI from ${params.validator}. TX: ${h}`
    }
    if (params.action === 'redelegate') {
      if (!params.validator || !params.newValidator) throw new Error('Provide src and dst validator addresses')
      const h = await this.walletClient.writeContract({ address: precompile, abi: [{ type: 'function', name: 'redelegate', stateMutability: 'nonpayable', inputs: [{ name: 'src', type: 'address' }, { name: 'dst', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [] }] as any, functionName: 'redelegate', args: [params.validator, params.newValidator, valueWei] })
      return `✅ Redelegated ${params.amount} SEI from ${params.validator} to ${params.newValidator}. TX: ${h}`
    }
    return 'Unsupported staking action'
  }

  async unstakeTokens(params: StakeParams): Promise<string> {
    // Placeholder until Silo integration is finalized
    return `📤 Unstaking ${params.amount} SEI initiated (testnet placeholder)`
  }

  // Simple portfolio/trading placeholders to satisfy imports
  async lendTokens(params: LendingParams): Promise<string> { return `Lending ${params.amount} ${params.token} (placeholder)` }
  async borrowTokens(params: LendingParams): Promise<string> { return `Borrowing ${params.amount} ${params.token} (placeholder)` }
  async repayLoan(params: LendingParams): Promise<string> { return `Repaying ${params.amount} ${params.token} (placeholder)` }
  async openPosition(params: TradingParams): Promise<string> { return `Opened ${params.side} ${params.market} size ${params.size} (placeholder)` }
  async closePosition(positionId: string): Promise<string> { return `Closed position ${positionId} (placeholder)` }
  async getPositions(): Promise<any[]> { return [] }
  async getWalletInfo(): Promise<any> { return { address: this.walletAddress, seiBalance: await this.getBalance(), network: 'Sei Testnet' } }
}

// Export singleton instance
const PRIVATE_KEY = '0x7c5e4b6198276efe786d05f2e3f3ef8f91409066a5de3f1ca58e630c3445c684'
export const cambrianSeiAgent = new CambrianSeiAgent(PRIVATE_KEY)

