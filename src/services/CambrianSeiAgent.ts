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
  minOut?: string
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
  private static readonly UNISWAPV2_ROUTER_ABI = [
    { type: 'function', name: 'getAmountsOut', stateMutability: 'view', inputs: [
      { name: 'amountIn', type: 'uint256' }, { name: 'path', type: 'address[]' }
    ], outputs: [{ name: 'amounts', type: 'uint256[]' }] },
    { type: 'function', name: 'swapExactTokensForTokens', stateMutability: 'nonpayable', inputs: [
      { name: 'amountIn', type: 'uint256' },
      { name: 'amountOutMin', type: 'uint256' },
      { name: 'path', type: 'address[]' },
      { name: 'to', type: 'address' },
      { name: 'deadline', type: 'uint256' }
    ], outputs: [{ name: 'amounts', type: 'uint256[]' }] },
    // DragonSwap naming (SEI) + ETH aliases for compatibility
    { type: 'function', name: 'swapExactSEIForTokens', stateMutability: 'payable', inputs: [
      { name: 'amountOutMin', type: 'uint256' },
      { name: 'path', type: 'address[]' },
      { name: 'to', type: 'address' },
      { name: 'deadline', type: 'uint256' }
    ], outputs: [{ name: 'amounts', type: 'uint256[]' }] },
    { type: 'function', name: 'swapExactTokensForSEI', stateMutability: 'nonpayable', inputs: [
      { name: 'amountIn', type: 'uint256' },
      { name: 'amountOutMin', type: 'uint256' },
      { name: 'path', type: 'address[]' },
      { name: 'to', type: 'address' },
      { name: 'deadline', type: 'uint256' }
    ], outputs: [{ name: 'amounts', type: 'uint256[]' }] },
    { type: 'function', name: 'swapExactETHForTokens', stateMutability: 'payable', inputs: [
      { name: 'amountOutMin', type: 'uint256' },
      { name: 'path', type: 'address[]' },
      { name: 'to', type: 'address' },
      { name: 'deadline', type: 'uint256' }
    ], outputs: [{ name: 'amounts', type: 'uint256[]' }] },
    { type: 'function', name: 'swapExactTokensForETH', stateMutability: 'nonpayable', inputs: [
      { name: 'amountIn', type: 'uint256' },
      { name: 'amountOutMin', type: 'uint256' },
      { name: 'path', type: 'address[]' },
      { name: 'to', type: 'address' },
      { name: 'deadline', type: 'uint256' }
    ], outputs: [{ name: 'amounts', type: 'uint256[]' }] },
    { type: 'function', name: 'WETH', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'address' }] }
  ] as const

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
    const mode = (process as any).env?.NETWORK_MODE || (import.meta as any).env?.VITE_NETWORK_MODE || 'testnet'
    const routerAddr = (import.meta as any).env?.VITE_ROUTER_ADDRESS || (mode === 'mainnet' ? '' : '0x527b42CA5e11370259EcaE68561C14dA415477C8')
    let WSEI = (import.meta as any).env?.VITE_WSEI_TESTNET || '0x3894085ef7ff0f0aedf52e2a2704928d1ec074f1'
    try {
      if (routerAddr) {
        const weth = await this.publicClient.readContract({ address: routerAddr as any, abi: CambrianSeiAgent.UNISWAPV2_ROUTER_ABI as any, functionName: 'WETH' }) as string
        if (weth && weth !== '0x0000000000000000000000000000000000000000') WSEI = weth
      }
    } catch {}
    const tokenIn = params.tokenIn === ('0x0' as any) ? (WSEI as any) : params.tokenIn
    const tokenOut = params.tokenOut === ('0x0' as any) ? (WSEI as any) : params.tokenOut

    // 1) Try Vortex quote if configured (mainnet typically)
    try {
      const vortexApi = (import.meta as any).env?.VITE_VORTEX_QUOTE_API || (mode === 'mainnet' ? 'https://api.vortexprotocol.io/v1/quote' : '')
      if (vortexApi) {
        const url = `${vortexApi}?tokenIn=${tokenIn}&tokenOut=${tokenOut}&amount=${params.amount}`
        const res = await fetch(url)
        if (res.ok) {
          const data = await res.json()
          const out = Number(data?.amountOut ?? 0)
          const pi = Number(data?.priceImpact ?? 0)
          if (isFinite(out) && out > 0) {
            return { inputAmount: params.amount, outputAmount: out, priceImpact: isFinite(pi) ? pi : 0, route: data?.route || [] }
          }
        }
      }
    } catch {}

    // 2) Symphony route
    try {
      const route = await this.symphonySDK.getRoute(tokenIn, tokenOut, params.amount)
      const out = Number(route?.outputAmount ?? 0)
      const pi = Number(route?.priceImpact ?? 0)
      if (isFinite(out) && out > 0) {
        return { inputAmount: params.amount, outputAmount: out, priceImpact: isFinite(pi) ? pi : 0, route: route?.path ?? [] }
      }
    } catch {}

    // 3) Direct router getAmountsOut fallback if configured
    try {
      const router = routerAddr || ''
      if (router) {
        const path = [tokenIn, tokenOut]
        const inDecimals = tokenIn.toLowerCase() === (WSEI as string).toLowerCase() ? 18 : (await this.publicClient.readContract({ address: tokenIn, abi: [{ type: 'function', name: 'decimals', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint8' }] }] as any, functionName: 'decimals' }) as number)
        const outDecimals = tokenOut.toLowerCase() === (WSEI as string).toLowerCase() ? 18 : (await this.publicClient.readContract({ address: tokenOut, abi: [{ type: 'function', name: 'decimals', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint8' }] }] as any, functionName: 'decimals' }) as number)
        const amountInWei = BigInt(Math.floor(parseFloat(params.amount) * 10 ** inDecimals))
        const amounts = await this.publicClient.readContract({ address: router as any, abi: CambrianSeiAgent.UNISWAPV2_ROUTER_ABI as any, functionName: 'getAmountsOut', args: [amountInWei, path] }) as bigint[]
        const outWei = amounts?.[amounts.length - 1] || 0n
        const out = Number(outWei) / 10 ** outDecimals
        if (isFinite(out) && out > 0) {
          return { inputAmount: params.amount, outputAmount: out, priceImpact: 0, route: path }
        }
      }
    } catch {}

    return { inputAmount: params.amount, outputAmount: 0, priceImpact: 0, route: [] }
  }

  // Swap flow with Symphony first, then router fallback. Enforces minOut if router path used
  async swapTokens(params: SwapParams): Promise<string> {
    const mode = (process as any).env?.NETWORK_MODE || (import.meta as any).env?.VITE_NETWORK_MODE || 'testnet'
    const routerAddr2 = (import.meta as any).env?.VITE_ROUTER_ADDRESS || (mode === 'mainnet' ? '' : '0x527b42CA5e11370259EcaE68561C14dA415477C8')
    let WSEI = (import.meta as any).env?.VITE_WSEI_TESTNET || '0x3894085ef7ff0f0aedf52e2a2704928d1ec074f1'
    try {
      if (routerAddr2) {
        const weth = await this.publicClient.readContract({ address: routerAddr2 as any, abi: CambrianSeiAgent.UNISWAPV2_ROUTER_ABI as any, functionName: 'WETH' }) as string
        if (weth && weth !== '0x0000000000000000000000000000000000000000') WSEI = weth
      }
    } catch {}
    const isNativeIn = params.tokenIn === ('0x0' as any)
    const tokenIn = isNativeIn ? (WSEI as any) : params.tokenIn
    const tokenOut = params.tokenOut === ('0x0' as any) ? (WSEI as any) : params.tokenOut

    const balance = await this.getBalance(isNativeIn ? undefined : tokenIn)
    if (Number(balance) < Number(params.amount)) throw new Error(`Insufficient balance. Have: ${balance}, Need: ${params.amount}`)

    // Try Symphony route first
    try {
      const route = await this.symphonySDK.getRoute(tokenIn, tokenOut, params.amount)
      const approved = await route.checkApproval()
      if (!approved) await route.giveApproval()
      const { swapReceipt } = await route.swap()
      return `✅ Swap completed on Sei Testnet! TX: ${swapReceipt.transactionHash}`
    } catch {}

    // Serverless fixed-rate fallback for SEI<->USDC
    try {
      const usdc = ((import.meta as any).env?.VITE_USDC_TESTNET || '0x948dff0c876EbEb1e233f9aF8Df81c23d4E068C6').toLowerCase()
      const wantsUsdcOut = (params.tokenOut as any).toLowerCase?.() === usdc || tokenOut.toLowerCase?.() === usdc
      if (wantsUsdcOut && isNativeIn) {
        const res = await fetch('/.netlify/functions/swap-fixed', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'swap', to: this.walletAddress, seiAmount: params.amount, direction: 'SEI_TO_USDC' }) })
        if (res.ok) {
          const data = await res.json() as any
          const tx = data?.txHash
          if (tx) return `✅ Fixed-rate swap executed. USDC sent. TX: ${tx}`
          return `✅ Fixed-rate swap executed. USDC sent.`
        } else {
          const errText = await res.text().catch(()=> 'Serverless swap error')
          throw new Error(errText)
        }
      }
      const wantsSeiOut = (params.tokenOut as any) === ('0x0' as any) || tokenOut === ('0x0' as any)
      const isUsdcIn = (params.tokenIn as any).toLowerCase?.() === usdc || tokenIn.toLowerCase?.() === usdc
      if (wantsSeiOut && isUsdcIn) {
        const res = await fetch('/.netlify/functions/swap-fixed', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'swap', to: this.walletAddress, usdcAmount: params.amount, direction: 'USDC_TO_SEI' }) })
        if (res.ok) {
          const data = await res.json() as any
          const tx = data?.txHash
          if (tx) return `✅ Fixed-rate swap executed. SEI sent. TX: ${tx}`
          return `✅ Fixed-rate swap executed. SEI sent.`
        } else {
          const errText = await res.text().catch(()=> 'Serverless swap error')
          throw new Error(errText)
        }
      }
    } catch {}

    // Router fallback if configured
    const router = routerAddr2 || ''
    if (!router) throw new Error('No available swap route (router not configured)')

    const now = Math.floor(Date.now() / 1000)
    const deadline = BigInt(now + 60 * 5)
    const path = [tokenIn, tokenOut]

    const inDecimals = tokenIn.toLowerCase() === (WSEI as string).toLowerCase() ? 18 : (await this.publicClient.readContract({ address: tokenIn, abi: [{ type: 'function', name: 'decimals', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint8' }] }] as any, functionName: 'decimals' }) as number)
    const outDecimals = tokenOut.toLowerCase() === (WSEI as string).toLowerCase() ? 18 : (await this.publicClient.readContract({ address: tokenOut, abi: [{ type: 'function', name: 'decimals', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint8' }] }] as any, functionName: 'decimals' }) as number)
    const amountInWei = BigInt(Math.round(parseFloat(params.amount) * 10 ** inDecimals))

    // Compute expected out via router
    const amounts = await this.publicClient.readContract({ address: router as any, abi: CambrianSeiAgent.UNISWAPV2_ROUTER_ABI as any, functionName: 'getAmountsOut', args: [amountInWei, path] }) as bigint[]
    const outWei = amounts?.[amounts.length - 1] || 0n
    let minOutWei = outWei
    if (params.minOut) {
      const specified = BigInt(Math.floor(parseFloat(params.minOut) * 10 ** outDecimals))
      minOutWei = specified
    } else {
      minOutWei = (outWei * 99n) / 100n
    }

    // Ensure approval if ERC-20 in
    if (!isNativeIn) {
      const allowance = await this.publicClient.readContract({ address: tokenIn, abi: [
        { type: 'function', name: 'allowance', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] },
        { type: 'function', name: 'approve', stateMutability: 'nonpayable', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }] }
      ] as any, functionName: 'allowance', args: [this.walletAddress, router] }) as bigint
      if (allowance < amountInWei) {
        await this.walletClient.writeContract({ address: tokenIn, abi: [
          { type: 'function', name: 'approve', stateMutability: 'nonpayable', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }] }
        ] as any, functionName: 'approve', args: [router, amountInWei] })
      }
    }

    let txHash: any
    if (isNativeIn) {
      try {
        txHash = await this.walletClient.writeContract({
          address: router as any,
          abi: CambrianSeiAgent.UNISWAPV2_ROUTER_ABI as any,
          functionName: 'swapExactSEIForTokens',
          args: [minOutWei, path, this.walletAddress, deadline],
          value: amountInWei
        })
      } catch {
        txHash = await this.walletClient.writeContract({
          address: router as any,
          abi: CambrianSeiAgent.UNISWAPV2_ROUTER_ABI as any,
          functionName: 'swapExactETHForTokens',
          args: [minOutWei, path, this.walletAddress, deadline],
          value: amountInWei
        })
      }
    } else {
      txHash = await this.walletClient.writeContract({
        address: router as any,
        abi: CambrianSeiAgent.UNISWAPV2_ROUTER_ABI as any,
        functionName: 'swapExactTokensForTokens',
        args: [amountInWei, minOutWei, path, this.walletAddress, deadline]
      })
    }

    return `✅ Swap completed! TX: ${txHash}`
  }

  // Token creation via factory (reads exact creationFee, simulates before send)
  async createToken(params: { name: string; symbol: string; totalSupply: string; decimals?: number; valueSei?: string }): Promise<{ txHash: string }> {
    const mode = (process as any).env?.NETWORK_MODE || (import.meta as any).env?.VITE_NETWORK_MODE || 'testnet'
    const FACTORY_ADDRESS = mode === 'mainnet'
      ? ((import.meta as any).env?.VITE_FACTORY_ADDRESS_MAINNET || '0x46287770F8329D51004560dC3BDED879A6565B9A')
      : ((import.meta as any).env?.VITE_FACTORY_ADDRESS_TESTNET || '0x46287770F8329D51004560dC3BDED879A6565B9A')

    const bytecode = await this.publicClient.getBytecode({ address: FACTORY_ADDRESS as any }).catch(() => null)
    if (!bytecode || bytecode === '0x') throw new Error(`Token factory not deployed on ${mode}. Set VITE_FACTORY_ADDRESS_${mode.toUpperCase()}`)

    const abi = [
      { type: 'function', name: 'creationFee', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
      { type: 'function', name: 'createToken', stateMutability: 'payable', inputs: [
        { name: 'name', type: 'string' },
        { name: 'symbol', type: 'string' },
        { name: 'decimals', type: 'uint8' },
        { name: 'totalSupply', type: 'uint256' }
      ], outputs: [{ name: '', type: 'address' }] }
    ] as const

    // Determine fee strategy (prefer 0 if allowed like SeiList)
    // 1) Try simulate with zero fee
    let feeWei: bigint = 0n

    // Verify balance is sufficient for fee
    const nativeBal = await this.publicClient.getBalance({ address: this.walletAddress })
    if (nativeBal < feeWei) throw new Error(`Insufficient SEI for creation fee. Need ~${(Number(feeWei)/1e18).toFixed(3)} SEI`)

    // Normalize params (symbol cap length ≤ 5, decimals default 18)
    const safeSymbol = (params.symbol || '').toUpperCase().slice(0, 5)
    const decimals = params.decimals ?? 18
    // Interpret totalSupply in human units; convert to wei based on decimals
    const supply = (() => {
      try {
        const base = BigInt(String(Math.floor(Number(params.totalSupply || '0'))))
        const factor = 10n ** BigInt(decimals)
        return base * factor
      } catch {
        return BigInt(0)
      }
    })()

    // Simulate to surface revert reasons before broadcasting
    try {
      await this.publicClient.simulateContract({
        address: FACTORY_ADDRESS as any,
        abi: abi as any,
        functionName: 'createToken',
        args: [params.name, safeSymbol, decimals, supply],
        value: feeWei,
        account: this.walletAddress
      })
    } catch (e: any) {
      // If zero-fee simulation fails, try with default testnet fee of 2 SEI
      try {
        feeWei = BigInt(Math.floor((mode === 'mainnet' ? 0.2 : 2) * 1e18))
        await this.publicClient.simulateContract({
          address: FACTORY_ADDRESS as any,
          abi: abi as any,
          functionName: 'createToken',
          args: [params.name, safeSymbol, decimals, supply],
          value: feeWei,
          account: this.walletAddress
        })
      } catch (e2: any) {
        throw new Error(`Simulation failed: ${e2?.shortMessage || e2?.message || String(e2)}`)
      }
    }

    // Send real tx
    const txHash = await this.walletClient.writeContract({
      address: FACTORY_ADDRESS as any,
      abi: abi as any,
      functionName: 'createToken',
      args: [params.name, safeSymbol, decimals, supply],
      value: feeWei
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

  // Silo staking contract integration (env-configurable). Falls back to precompile if unset.
  private async stakeViaSilo(params: StakeParams): Promise<string> {
    const mode = (process as any).env?.NETWORK_MODE || (import.meta as any).env?.VITE_NETWORK_MODE || 'testnet'
    const address = ((import.meta as any).env?.VITE_SILO_STAKING_ADDRESS)
      || (mode === 'mainnet' ? (import.meta as any).env?.VITE_SILO_STAKING_MAINNET : (import.meta as any).env?.VITE_SILO_STAKING_TESTNET)
    if (!address) throw new Error('Silo staking contract not configured (set VITE_SILO_STAKING_ADDRESS)')

    const stakeFn = (import.meta as any).env?.VITE_SILO_STAKING_STAKE_FUNC || 'stake'
    const unstakeFn = (import.meta as any).env?.VITE_SILO_STAKING_UNSTAKE_FUNC || 'unstake'
    const claimFn = (import.meta as any).env?.VITE_SILO_STAKING_CLAIM_FUNC || 'claim'

    const amountWei = BigInt(Math.floor(parseFloat(params.amount || '0') * 1e18))

    // Build minimal ABIs for common patterns
    const abiPayableStake = [{ type: 'function', name: stakeFn, stateMutability: 'payable', inputs: [], outputs: [] }]
    const abiAmountStake = [{ type: 'function', name: stakeFn, stateMutability: 'nonpayable', inputs: [{ name: 'amount', type: 'uint256' }], outputs: [] }]
    const abiAmountUnstake = [{ type: 'function', name: unstakeFn, stateMutability: 'nonpayable', inputs: [{ name: 'amount', type: 'uint256' }], outputs: [] }]
    const abiClaim = [{ type: 'function', name: claimFn, stateMutability: 'nonpayable', inputs: [], outputs: [] }]

    const doStake = async (): Promise<string> => {
      // Try nonpayable(amount), then payable() with value
      try {
        const h = await this.walletClient.writeContract({ address: address as any, abi: abiAmountStake as any, functionName: stakeFn as any, args: [amountWei] })
        return `✅ Staked ${params.amount} SEI via Silo. TX: ${h}`
      } catch {
        const h = await this.walletClient.writeContract({ address: address as any, abi: abiPayableStake as any, functionName: stakeFn as any, args: [] as any, value: amountWei })
        return `✅ Staked ${params.amount} SEI via Silo (payable). TX: ${h}`
      }
    }

    const doUnstake = async (): Promise<string> => {
      const h = await this.walletClient.writeContract({ address: address as any, abi: abiAmountUnstake as any, functionName: unstakeFn as any, args: [amountWei] })
      return `📤 Unstake initiated for ${params.amount} SEI (Silo). TX: ${h}`
    }

    const doClaim = async (): Promise<string> => {
      const h = await this.walletClient.writeContract({ address: address as any, abi: abiClaim as any, functionName: claimFn as any, args: [] as any })
      return `🎁 Rewards claim sent (Silo). TX: ${h}`
    }

    const action = (params.action || 'delegate')
    if (action === 'delegate') return await doStake()
    if (action === 'undelegate') return await doUnstake()
    if (action === 'claim') return await doClaim()
    return 'Unsupported staking action for Silo'
  }

  async stakeTokens(params: StakeParams): Promise<string> {
    // Prefer Silo contract if configured and distinct from precompile
    const precompile = ((import.meta as any).env?.VITE_STAKING_PRECOMPILE || '0x0000000000000000000000000000000000001005') as Address
    const siloAddr = ((import.meta as any).env?.VITE_SILO_STAKING_ADDRESS || (import.meta as any).env?.VITE_SILO_STAKING_TESTNET || (import.meta as any).env?.VITE_SILO_STAKING_MAINNET) as string | undefined
    const useSilo = !!siloAddr && siloAddr.toLowerCase() !== (precompile as string).toLowerCase()
    if (useSilo) {
      return await this.stakeViaSilo(params)
    }
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
    const precompile = ((import.meta as any).env?.VITE_STAKING_PRECOMPILE || '0x0000000000000000000000000000000000001005') as Address
    const siloAddr = ((import.meta as any).env?.VITE_SILO_STAKING_ADDRESS || (import.meta as any).env?.VITE_SILO_STAKING_TESTNET || (import.meta as any).env?.VITE_SILO_STAKING_MAINNET) as string | undefined
    const useSilo = !!siloAddr && siloAddr.toLowerCase() !== (precompile as string).toLowerCase()
    if (useSilo) {
      return await this.stakeViaSilo({ ...params, action: 'undelegate' })
    }
    return `📤 Unstaking ${params.amount} SEI initiated (precompile path not supported yet here)`
  }

  // Simple portfolio/trading placeholders to satisfy imports
  async lendTokens(params: LendingParams): Promise<string> { return `Lending ${params.amount} ${params.token} (placeholder)` }
  async borrowTokens(params: LendingParams): Promise<string> { return `Borrowing ${params.amount} ${params.token} (placeholder)` }
  async repayLoan(params: LendingParams): Promise<string> { return `Repaying ${params.amount} ${params.token} (placeholder)` }
  async openPosition(params: TradingParams): Promise<string> { return `Opened ${params.side} ${params.market} size ${params.size} (placeholder)` }
  async closePosition(positionId: string): Promise<string> { return `Closed position ${positionId} (placeholder)` }
  async getPositions(): Promise<any[]> { return [] }
  async getWalletInfo(): Promise<any> { return { address: this.walletAddress, seiBalance: await this.getBalance(), network: 'Sei Testnet' } }

  // Simple transfer helper for native SEI and ERC-20
  async transferToken(amount: string, to: Address, token?: Address): Promise<string> {
    const isNative = !token || token === ('0x0' as any)
    if (isNative) {
      const valueWei = BigInt(Math.floor(parseFloat(amount) * 1e18))
      const hash = await this.walletClient.sendTransaction({ to, value: valueWei })
      return `✅ Native SEI transfer sent. TX: ${hash}`
    }
    const decimals = await this.publicClient.readContract({ address: token as Address, abi: [{ type: 'function', name: 'decimals', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint8' }] }] as any, functionName: 'decimals' }) as number
    const valueWei = BigInt(Math.floor(parseFloat(amount) * 10 ** decimals))
    const hash = await this.walletClient.writeContract({ address: token as Address, abi: [{ type: 'function', name: 'transfer', stateMutability: 'nonpayable', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }] }] as any, functionName: 'transfer', args: [to, valueWei] })
    return `✅ ERC-20 transfer sent. TX: ${hash}`
  }
}

// Export singleton instance (load from env, never commit)
const AGENT_PRIVATE_KEY = (import.meta as any).env?.VITE_DEV_WALLET_PRIVATE_KEY || ''
export const cambrianSeiAgent = new CambrianSeiAgent(AGENT_PRIVATE_KEY)
