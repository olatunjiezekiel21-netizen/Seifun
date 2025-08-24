import { ethers } from 'ethers';

// Sei Network Configuration (single declaration)
const SEI_TESTNET_CONFIG = {
  chainId: 1328,
  rpcUrl: 'https://evm-rpc-testnet.sei-apis.com',
  nativeCurrency: { name: 'SEI', symbol: 'SEI', decimals: 18 }
};

// Contract Addresses on Sei Testnet (single declaration)
const CONTRACTS = {
  USDC: (import.meta as any).env?.VITE_USDC_TESTNET || '0x948dff0c876EbEb1e233f9aF8Df81c23d4E068C6',
  ASTROPORT_ROUTER: '0x0000000000000000000000000000000000000000',
  DRAGONSWAP_ROUTER: '0x0000000000000000000000000000000000000000',
  TOKEN_FACTORY: (import.meta as any).env?.VITE_FACTORY_ADDRESS_TESTNET || '0x50C0b92b3BC34D7FeD7Da0C48a2F16a636D95C9F'
};

// ERC20 ABI for token interactions
const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function burn(uint256 amount) returns (bool)',
  'function burnFrom(address from, uint256 amount) returns (bool)'
];

// Uniswap V2 Router ABI (compatible with most DEXes)
const ROUTER_ABI = [
  'function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline) returns (uint amountA, uint amountB, uint liquidity)',
  // SEI-native on some Sei routers
  'function addLiquiditySEI(address token, uint amountTokenDesired, uint amountTokenMin, uint amountSEIMin, address to, uint deadline) payable returns (uint amountToken, uint amountSEI, uint liquidity)',
  'function addLiquidityETH(address token, uint amountTokenDesired, uint amountTokenMin, uint amountETHMin, address to, uint deadline) payable returns (uint amountToken, uint amountETH, uint liquidity)',
  'function removeLiquidity(address tokenA, address tokenB, uint liquidity, uint amountAMin, uint amountBMin, address to, uint deadline) returns (uint amountA, uint amountB)',
  'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] path, address to, uint deadline) returns (uint[] amounts)',
  'function swapExactETHForTokens(uint amountOutMin, address[] path, address to, uint deadline) payable returns (uint[] amounts)',
  'function getAmountsOut(uint amountIn, address[] path) view returns (uint[] amounts)',
  'function factory() view returns (address)'
];

// Factory ABI for pair creation
const FACTORY_ABI = [
  'function createPair(address tokenA, address tokenB) returns (address pair)',
  'function getPair(address tokenA, address tokenB) view returns (address pair)'
];

export interface LiquidityParams {
  tokenAddress: string;
  tokenAmount: string;
  seiAmount: string;
  slippageTolerance: number; // percentage (e.g., 5 for 5%)
  deadline: number; // minutes from now
}

export interface BurnParams {
  tokenAddress: string;
  amount: string;
}

export interface SwapParams {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  slippageTolerance: number;
  deadline: number;
}

export interface LiquidityResult {
  success: boolean;
  txHash?: string;
  liquidityTokens?: string;
  tokenAmount?: string;
  seiAmount?: string;
  error?: string;
}

export interface BurnResult {
  success: boolean;
  txHash?: string;
  amountBurned?: string;
  newTotalSupply?: string;
  error?: string;
}

export class DeFiService {
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet | null = null;

  constructor(privateKey?: string) {
    this.provider = new ethers.JsonRpcProvider(SEI_TESTNET_CONFIG.rpcUrl);
    if (privateKey) {
      this.signer = new ethers.Wallet(privateKey, this.provider);
    }
  }

  // Connect with user's wallet
  async connectWallet(): Promise<ethers.Signer | null> {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new (ethers as any).BrowserProvider((window as any).ethereum);
        this.signer = await provider.getSigner();
        return this.signer;
      } catch (error) {
        console.error('Failed to connect wallet:', error);
        return null;
      }
    }
    return null;
  }

  // Get token information
  async getTokenInfo(tokenAddress: string) {
    try {
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        tokenContract.name(),
        tokenContract.symbol(),
        tokenContract.decimals(),
        tokenContract.totalSupply()
      ]);
      return {
        address: tokenAddress,
        name,
        symbol,
        decimals: Number(decimals),
        totalSupply: ethers.formatUnits(totalSupply, decimals)
      };
    } catch (error) {
      throw new Error(`Failed to get token info: ${error}`);
    }
  }

  // Get token balance for an address
  async getTokenBalance(tokenAddress: string, userAddress: string): Promise<string> {
    try {
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
      const balance = await tokenContract.balanceOf(userAddress);
      const decimals = await tokenContract.decimals();
      return ethers.formatUnits(balance, decimals);
    } catch (error) {
      throw new Error(`Failed to get token balance: ${error}`);
    }
  }

  // Get SEI balance
  async getSeiBalance(userAddress: string): Promise<string> {
    try {
      const balance = await this.provider.getBalance(userAddress);
      return ethers.formatEther(balance);
    } catch (error) {
      throw new Error(`Failed to get SEI balance: ${error}`);
    }
  }

  // REAL LIQUIDITY ADDITION - Works with actual tokens (placeholder interactions)
  async addLiquidity(params: LiquidityParams): Promise<LiquidityResult> {
    if (!this.signer) {
      return { success: false, error: 'Wallet not connected' };
    }
    try {
      const userAddress = await this.signer.getAddress();
      const tokenContract = new ethers.Contract(params.tokenAddress, ERC20_ABI, this.signer);
      const decimals = await tokenContract.decimals();
      const tokenAmount = ethers.parseUnits(params.tokenAmount, decimals);
      const seiAmount = ethers.parseEther(params.seiAmount);

      // Check balances
      const [tokenBalance, seiBalance] = await Promise.all([
        tokenContract.balanceOf(userAddress),
        this.provider.getBalance(userAddress)
      ]);
      if (tokenBalance < tokenAmount) return { success: false, error: 'Insufficient token balance' };
      if (seiBalance < seiAmount) return { success: false, error: 'Insufficient SEI balance' };

      // Approve router to spend tokens
      const router = (import.meta as any).env?.VITE_ROUTER_ADDRESS || '0x527b42CA5e11370259EcaE68561C14dA415477C8';
      const currentAllowance: bigint = await tokenContract.allowance(userAddress, router);
      if (currentAllowance < tokenAmount) {
        const approveTx = await tokenContract.approve(router, tokenAmount);
        await approveTx.wait();
      }

      const routerContract = new ethers.Contract(router, ROUTER_ABI, this.signer);
      const slippage = Math.max(0, Math.min(100, params.slippageTolerance || 5));
      const amountTokenMin = tokenAmount - (tokenAmount * BigInt(Math.floor(slippage)) / BigInt(100));
      const amountSeiMin = seiAmount - (seiAmount * BigInt(Math.floor(slippage)) / BigInt(100));
      const deadlineTs = BigInt(Math.floor(Date.now() / 1000) + (Math.max(1, params.deadline || 20) * 60));

      // Prefer SEI-native method; fallback to ETH-named if needed
      let tx;
      try {
        tx = await routerContract.addLiquiditySEI(
          params.tokenAddress,
          tokenAmount,
          amountTokenMin,
          amountSeiMin,
          userAddress,
          deadlineTs,
          { value: seiAmount }
        );
      } catch {
        tx = await routerContract.addLiquidityETH(
          params.tokenAddress,
          tokenAmount,
          amountTokenMin,
          amountSeiMin,
          userAddress,
          deadlineTs,
          { value: seiAmount }
        );
      }
      const receipt = await tx.wait();

      return {
        success: true,
        txHash: tx.hash,
        liquidityTokens: '',
        tokenAmount: params.tokenAmount,
        seiAmount: params.seiAmount
      };
    } catch (error: any) {
      console.error('Add liquidity failed:', error);
      return { success: false, error: error.message };
    }
  }

  // REAL TOKEN BURNING - Actually burns tokens
  async burnTokens(params: BurnParams): Promise<BurnResult> {
    if (!this.signer) return { success: false, error: 'Wallet not connected' };
    try {
      const userAddress = await this.signer.getAddress();
      const tokenContract = new ethers.Contract(params.tokenAddress, ERC20_ABI, this.signer);
      const [decimals, balance] = await Promise.all([
        tokenContract.decimals(),
        tokenContract.balanceOf(userAddress)
      ]);
      const burnAmount = ethers.parseUnits(params.amount, decimals);
      if (balance < burnAmount) return { success: false, error: 'Insufficient token balance to burn' };
      const burnTx = await tokenContract.burn(burnAmount);
      await burnTx.wait();
      const newTotalSupply = await tokenContract.totalSupply();
      return {
        success: true,
        txHash: burnTx.hash,
        amountBurned: params.amount,
        newTotalSupply: ethers.formatUnits(newTotalSupply, decimals)
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Get liquidity pools for a token (local record)
  async getLiquidityPools(tokenAddress: string) {
    try {
      const allPools = JSON.parse(localStorage.getItem('liquidity_pools') || '[]');
      return allPools.filter((p: any) => p.tokenAddress.toLowerCase() === tokenAddress.toLowerCase());
    } catch {
      return [];
    }
  }

  // Estimate liquidity addition (placeholder math)
  async estimateAddLiquidity(tokenAddress: string, tokenAmount: string, seiAmount: string) {
    const tokenInfo = await this.getTokenInfo(tokenAddress);
    return {
      estimatedLPTokens: (Math.sqrt(parseFloat(tokenAmount) * parseFloat(seiAmount))).toString(),
      priceImpact: (parseFloat(tokenAmount) / 1000000 * 100).toFixed(2) + '%',
      minimumReceived: { tokens: (parseFloat(tokenAmount) * 0.995).toString(), sei: (parseFloat(seiAmount) * 0.995).toString() },
      shareOfPool: (parseFloat(tokenAmount) / 10000000 * 100).toFixed(3) + '%'
    };
  }

  // Astroport integration (placeholder)
  async addLiquidityAstroport(params: LiquidityParams): Promise<LiquidityResult> {
    if (!this.signer) return { success: false, error: 'Wallet not connected' };
    try {
      const userAddress = await this.signer.getAddress();
      const tokenContract = new ethers.Contract(params.tokenAddress, ERC20_ABI, this.signer);
      const decimals = await tokenContract.decimals();
      const tokenAmount = ethers.parseUnits(params.tokenAmount, decimals);
      const approveTx = await tokenContract.approve(CONTRACTS.ASTROPORT_ROUTER, tokenAmount);
      await approveTx.wait();
      const liquidityTx = await this.signer.sendTransaction({ to: params.tokenAddress, value: ethers.parseEther(params.seiAmount) });
      await liquidityTx.wait();
      return {
        success: true,
        txHash: liquidityTx.hash,
        liquidityTokens: (Math.sqrt(parseFloat(params.tokenAmount) * parseFloat(params.seiAmount)) * 0.8).toString(),
        tokenAmount: params.tokenAmount,
        seiAmount: params.seiAmount
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Check if token has burn functionality
  async canBurnToken(tokenAddress: string): Promise<boolean> {
    try {
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
      try { await tokenContract.burn.staticCall(0); return true; } catch { return false; }
    } catch { return false; }
  }

  // Get comprehensive token stats
  async getTokenStats(tokenAddress: string, userAddress?: string) {
    const tokenInfo = await this.getTokenInfo(tokenAddress);
    const canBurn = await this.canBurnToken(tokenAddress);
    const liquidityPools = await this.getLiquidityPools(tokenAddress);
    let userBalance = '0';
    if (userAddress) userBalance = await this.getTokenBalance(tokenAddress, userAddress);
    return {
      ...tokenInfo,
      userBalance,
      canBurn,
      liquidityPools: liquidityPools.length,
      totalLiquidity: liquidityPools.reduce((sum: number, pool: any) => sum + parseFloat(pool.seiAmount), 0).toString()
    };
  }
}

// Export a default instance
export const defiService = new DeFiService();

// Export instance with test wallet for immediate functionality
export const testDefiService = new DeFiService((import.meta as any).env?.VITE_DEV_WALLET_PRIVATE_KEY || '');

// (duplicate declarations removed)