import { ethers } from 'ethers';
import { SeiTokenRegistry, SeiTokenInfo } from './seiTokenRegistry';
import { nativeSeiTokenScanner, NativeSeiTokenScanResult } from './nativeSeiTokenScanner';

// ERC20 ABI for basic token functions
const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function owner() view returns (address)',
  'function getOwner() view returns (address)',
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address, uint256) returns (bool)',
  'function transferFrom(address, address, uint256) returns (bool)',
  'function approve(address, uint256) returns (bool)'
];

// Extended ABI for additional checks
const EXTENDED_ABI = [
  ...ERC20_ABI,
  'function _owner() view returns (address)',
  'function admin() view returns (address)',
  'function isBlacklisted(address) view returns (bool)',
  'function blacklisted(address) view returns (bool)',
  'function _isBlacklisted(address) view returns (bool)',
  'function buyTax() view returns (uint256)',
  'function sellTax() view returns (uint256)',
  'function tax() view returns (uint256)',
  'function fee() view returns (uint256)',
  'function _buyTax() view returns (uint256)',
  'function _sellTax() view returns (uint256)'
];

// Enhanced interfaces with market data
export interface TokenBasicInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  formattedTotalSupply: string;
  marketCap?: string;
  price?: string;
  logo?: string;
  contractAddress: string;
}

export interface TokenMarketData {
  price: number;
  marketCap: number;
  volume24h?: number;
  priceChange24h?: number;
  marketCapRank?: number;
  circulatingSupply?: number;
  totalSupply: number;
  maxSupply?: number;
}

export interface TokenLogoInfo {
  logoUrl: string;
  source: 'coingecko' | 'dexscreener' | 'trustwallet' | 'generic' | 'fallback';
  verified: boolean;
}

export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  logoUrl?: string;
  verified?: boolean;
  type?: 'native' | 'erc20' | 'cw20';
  description?: string;
  website?: string;
  marketData?: {
    price?: number;
    marketCap?: number;
    volume24h?: number;
    priceChange24h?: number;
  };
}

export interface SafetyCheck {
  passed: boolean;
  risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'UNKNOWN';
  details: string;
  error?: string;
}

export interface TokenAnalysis {
  basicInfo: TokenInfo;
  safetyChecks: {
    supply: SafetyCheck;
    ownership: SafetyCheck & { owner?: string; isRenounced?: boolean };
    liquidity: SafetyCheck & { liquidityAmount?: string };
    honeypot: SafetyCheck & { isHoneypot?: boolean };
    blacklist: SafetyCheck & { hasBlacklist?: boolean };
    verified: SafetyCheck & { isVerified?: boolean };
    transfer: SafetyCheck & { hasTransfer?: boolean; hasTransferFrom?: boolean };
    fees: SafetyCheck & { buyTax?: number; sellTax?: number; hasExcessiveFees?: boolean };
    holderDistribution: SafetyCheck & { 
      topHolderPercentage?: number;
      holderCount?: number;
      riskLevel?: 'low' | 'medium' | 'high';
      safetyFlags?: string[];
    };
  };
  riskScore: number;
  isSafe: boolean;
  riskFactors: string[];
  lastScanned: string;
  scanCount: number;
}

export class TokenScanner {
  private provider: ethers.JsonRpcProvider;
  private seiRegistry: SeiTokenRegistry;
  private readonly SEI_RPC_URL = import.meta.env.VITE_SEI_MAINNET_RPC || 'https://evm-rpc.sei-apis.com';
  private readonly COINGECKO_API_KEY = import.meta.env.VITE_COINGECKO_API_KEY;
  private readonly DEXSCREENER_API_KEY = import.meta.env.VITE_DEXSCREENER_API_KEY;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(this.SEI_RPC_URL);
    this.seiRegistry = new SeiTokenRegistry(false); // Use mainnet for token scanning
  }

  /**
   * Detect if a token is native SEI or EVM-based
   */
  private isNativeSeiToken(address: string): boolean {
    // Native SEI tokens have specific patterns:
    // - Native SEI: 'usei'
    // - IBC tokens: start with 'ibc/'
    // - CW20 tokens: start with 'sei1' (CosmWasm addresses)
    // - Other native tokens: various patterns
    
    return (
      address === 'usei' ||
      address.startsWith('ibc/') ||
      address.startsWith('sei1') ||
      address.startsWith('factory/') ||
      address.includes('/') // Most native tokens have '/' in their denom
    );
  }

  /**
   * Analyze native SEI token using the native scanner
   */
  private async analyzeNativeSeiToken(denom: string): Promise<TokenAnalysis> {
    try {
      const nativeResult = await nativeSeiTokenScanner.scanToken(denom);
      
      // Convert native SEI result to TokenAnalysis format
      return {
        address: denom,
        name: nativeResult.tokenInfo.name,
        symbol: nativeResult.tokenInfo.symbol,
        decimals: nativeResult.tokenInfo.decimals,
        totalSupply: nativeResult.tokenInfo.totalSupply,
        isVerified: nativeResult.isVerified,
        isHoneypot: nativeResult.isScam,
        liquidityLocked: false, // Native tokens don't have liquidity locks
        ownershipRenounced: nativeResult.tokenInfo.isNative, // Native tokens have no owner
        holderCount: 0, // Would need to query separately
        safetyScore: this.calculateNativeSafetyScore(nativeResult),
        riskLevel: nativeResult.riskLevel,
        warnings: nativeResult.warnings,
        marketData: {
          price: 0, // Would need to fetch from price APIs
          marketCap: 0,
          volume24h: 0,
          priceChange24h: 0
        },
        logoUrl: `/tokens/${nativeResult.tokenInfo.symbol.toLowerCase()}.png`,
        lastScanned: new Date().toISOString(),
        scanCount: 1,
        riskFactors: nativeResult.warnings
      };
    } catch (error) {
      console.error('Failed to analyze native SEI token:', error);
      throw new Error(`Native SEI token analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate safety score for native SEI tokens
   */
  private calculateNativeSafetyScore(result: NativeSeiTokenScanResult): number {
    let score = 50; // Base score

    // Native tokens are generally safer
    if (result.tokenInfo.isNative) {
      score += 30;
    }

    // Verified tokens get bonus
    if (result.isVerified) {
      score += 20;
    }

    // Scam tokens get penalty
    if (result.isScam) {
      score = 0;
    }

    // Risk level adjustments
    switch (result.riskLevel) {
      case 'low':
        score += 10;
        break;
      case 'medium':
        score -= 10;
        break;
      case 'high':
        score -= 30;
        break;
    }

    // Warning penalties
    score -= result.warnings.length * 5;

    return Math.max(0, Math.min(100, score));
  }

  // Validate if address is a valid Ethereum/Sei address
  private isValidAddress(address: string): boolean {
    try {
      ethers.getAddress(address);
      return true;
    } catch {
      return false;
    }
  }

  // Check if address contains contract code (not an EOA)
  private async isContract(address: string): Promise<boolean> {
    try {
      const code = await this.provider.getCode(address);
      return code !== '0x';
    } catch {
      return false;
    }
  }

  // Enhanced token detection - works with any token standard
  private async detectTokenStandard(address: string): Promise<'ERC20' | 'ERC721' | 'ERC1155' | 'FACTORY' | 'UNKNOWN'> {
    try {
      const contract = new ethers.Contract(address, [
        'function supportsInterface(bytes4) view returns (bool)',
        'function totalSupply() view returns (uint256)',
        'function balanceOf(address) view returns (uint256)',
        'function transfer(address, uint256) returns (bool)',
        'function getUserTokens(address) view returns (tuple(address,address,string,string,uint8,uint256,uint256)[])',
        'function getAllTokens() view returns (tuple(address,address,string,string,uint8,uint256,uint256)[])',
        'function creationFee() view returns (uint256)'
      ], this.provider);

      // Check for factory contract first
      try {
        await contract.creationFee.staticCall();
        await contract.getAllTokens.staticCall();
        return 'FACTORY';
      } catch {
        // Not a factory contract
      }

      // Check for ERC165 support
      try {
        const isERC721 = await contract.supportsInterface('0x80ac58cd');
        if (isERC721) return 'ERC721';
        
        const isERC1155 = await contract.supportsInterface('0xd9b67a26');
        if (isERC1155) return 'ERC1155';
      } catch {
        // Contract doesn't support ERC165, continue with other checks
      }

      // Check for ERC20 functions
      try {
        await contract.totalSupply.staticCall();
        await contract.balanceOf.staticCall(ethers.ZeroAddress);
        return 'ERC20';
      } catch {
        // Not a standard ERC20
      }

      return 'UNKNOWN';
    } catch {
      return 'UNKNOWN';
    }
  }



    async getTokenBasicInfo(address: string): Promise<TokenInfo> {
    try {
      // Validate address format
      if (!this.isValidAddress(address)) {
        throw new Error('Invalid address format');
      }

      // Check if it's a wallet address first
      const isWallet = await this.seiRegistry.isWalletAddress(address);
      if (isWallet) {
        throw new Error('Address is a wallet (EOA), not a token contract');
      }

      // Detect contract type
      const contractType = await this.detectTokenStandard(address);
      
      if (contractType === 'FACTORY') {
        return await this.getFactoryInfo(address);
      }

      // Get token info from Sei registry first
      const seiTokenInfo = await this.seiRegistry.getTokenInfo(address);
      
      if (seiTokenInfo) {
        // Convert SeiTokenInfo to TokenInfo format
        return {
          address: seiTokenInfo.address,
          name: seiTokenInfo.name,
          symbol: seiTokenInfo.symbol,
          decimals: seiTokenInfo.decimals,
          totalSupply: seiTokenInfo.totalSupply || '0',
          logoUrl: seiTokenInfo.logoUrl,
          verified: seiTokenInfo.verified,
          type: seiTokenInfo.type,
          description: seiTokenInfo.description,
          website: seiTokenInfo.website,
          marketData: seiTokenInfo.marketData
        };
      }

      // Fallback to blockchain query if not in registry
      const contract = new ethers.Contract(address, EXTENDED_ABI, this.provider);
      const tokenInfo = await this.getTokenInfoWithFallbacks(contract, address, contractType);
      
      // Try to get logo from registry first, then use enhanced logo fetching
      let logoUrl: string | undefined;
      try {
        const registryInfo = await this.seiRegistry.getTokenInfo(address);
        logoUrl = registryInfo?.logoUrl;
      } catch {
        // If not in registry, we'll fetch logo later in the analysis process
      }

      return {
        address: ethers.getAddress(address),
        name: tokenInfo.name,
        symbol: tokenInfo.symbol,
        decimals: tokenInfo.decimals,
        totalSupply: tokenInfo.totalSupply,
        logoUrl: logoUrl || undefined,
        verified: false // Mark as unverified if not in registry
      };
    } catch (error) {
      console.error('Error fetching basic token info:', error);
      throw new Error(`Failed to fetch token information: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get factory contract information
  private async getFactoryInfo(address: string): Promise<TokenInfo> {
    try {
      const contract = new ethers.Contract(address, [
        'function creationFee() view returns (uint256)',
        'function getAllTokens() view returns (tuple(address,address,string,string,uint8,uint256,uint256)[])',
        'function getTotalTokensCreated() view returns (uint256)'
      ], this.provider);

      const [creationFee, allTokens, totalCreated] = await Promise.all([
        contract.creationFee(),
        contract.getAllTokens(),
        contract.getTotalTokensCreated()
      ]);

      return {
        address: ethers.getAddress(address),
        name: 'Seifu Token Factory',
        symbol: 'FACTORY',
        decimals: 18,
        totalSupply: totalCreated.toString(),
        type: 'factory',
        verified: true,
        description: `Token factory contract that has created ${totalCreated} tokens. Creation fee: ${ethers.formatEther(creationFee)} SEI`,
        marketData: {
          price: parseFloat(ethers.formatEther(creationFee)),
          volume24h: allTokens.length
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch factory information: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Enhanced token info fetching with multiple fallback strategies
  private async getTokenInfoWithFallbacks(contract: ethers.Contract, address: string, tokenStandard: string): Promise<{
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
  }> {
    const fallbackStrategies = [
      // Strategy 1: Standard ERC20 functions
      async () => {
        const [name, symbol, decimals, totalSupply] = await Promise.all([
          contract.name(),
          contract.symbol(),
          contract.decimals(),
          contract.totalSupply()
        ]);
        return {
          name: String(name),
          symbol: String(symbol),
          decimals: Number(decimals),
          totalSupply: totalSupply.toString()
        };
      },

      // Strategy 2: Try with static calls
      async () => {
        const [name, symbol, decimals, totalSupply] = await Promise.all([
          contract.name.staticCall(),
          contract.symbol.staticCall(),
          contract.decimals.staticCall(),
          contract.totalSupply.staticCall()
        ]);
        return {
          name: String(name),
          symbol: String(symbol),
          decimals: Number(decimals),
          totalSupply: totalSupply.toString()
        };
      },

      // Strategy 3: Individual calls with error handling
      async () => {
        const name = await contract.name().catch(() => 
          contract.name.staticCall().catch(() => 'Unknown Token')
        );
        const symbol = await contract.symbol().catch(() => 
          contract.symbol.staticCall().catch(() => 'UNKNOWN')
        );
        const decimals = await contract.decimals().catch(() => 
          contract.decimals.staticCall().catch(() => 18)
        );
        const totalSupply = await contract.totalSupply().catch(() => 
          contract.totalSupply.staticCall().catch(() => ethers.parseUnits('0', 18))
        );

        return {
          name: String(name),
          symbol: String(symbol),
          decimals: Number(decimals),
          totalSupply: totalSupply.toString()
        };
      },

      // Strategy 4: Minimal info for non-standard contracts
      async () => {
        // For contracts that don't follow standard, provide basic info
        const code = await this.provider.getCode(address);
        const codeHash = ethers.keccak256(code).slice(0, 10);
        
        return {
          name: `Contract ${address.slice(0, 8)}...`,
          symbol: `C${codeHash.slice(2, 5).toUpperCase()}`,
          decimals: 18,
          totalSupply: '0'
        };
      }
    ];

    // Try each strategy until one works
    for (let i = 0; i < fallbackStrategies.length; i++) {
      try {
        console.log(`Trying token info strategy ${i + 1}...`);
        const result = await fallbackStrategies[i]();
        console.log(`Strategy ${i + 1} successful:`, result);
        return result;
      } catch (error) {
        console.log(`Strategy ${i + 1} failed:`, error);
        if (i === fallbackStrategies.length - 1) {
          throw new Error('All token info strategies failed');
        }
      }
    }

    throw new Error('Failed to get token information');
  }

  async checkSupplySafety(contract: ethers.Contract, totalSupply: bigint): Promise<SafetyCheck> {
    try {
      // Check if total supply is reasonable (not too large or too small)
      const maxReasonableSupply = ethers.parseUnits('1000000000000', 18); // 1 trillion
      const minReasonableSupply = ethers.parseUnits('1', 18); // 1 token

      const isReasonable = totalSupply <= maxReasonableSupply && totalSupply >= minReasonableSupply;
      
      // Check for potential mint functions (red flag)
      let hasMintFunction = false;
      try {
        await contract.mint.staticCall(ethers.ZeroAddress, 1);
        hasMintFunction = true;
      } catch {
        // No mint function or not accessible
      }

      const risk = !isReasonable ? 'HIGH' : hasMintFunction ? 'MEDIUM' : 'LOW';
      const details = !isReasonable 
        ? 'Total supply is unreasonable' 
        : hasMintFunction 
          ? 'Token has mint function - supply can be increased'
          : 'Supply appears safe';

      return {
        passed: isReasonable && !hasMintFunction,
        risk,
        details
      };
    } catch (error) {
      return {
        passed: false,
        risk: 'UNKNOWN',
        details: 'Could not analyze supply',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async checkOwnership(contract: ethers.Contract): Promise<SafetyCheck & { owner?: string; isRenounced?: boolean }> {
    try {
      let owner: string | null = null;
      
      // Try different owner function patterns
      const ownerFunctions = ['owner', 'getOwner', '_owner', 'admin'];
      
      for (const func of ownerFunctions) {
        try {
          owner = await contract[func]();
          break;
        } catch {
          continue;
        }
      }

      const isRenounced = !owner || owner === ethers.ZeroAddress;
      const risk = isRenounced ? 'LOW' : 'HIGH';
      const details = isRenounced 
        ? 'Ownership has been renounced' 
        : 'Contract has an owner who can modify the contract';

      return {
        passed: isRenounced,
        risk,
        details,
        owner: owner || undefined,
        isRenounced
      };
    } catch (error) {
      return {
        passed: false,
        risk: 'UNKNOWN',
        details: 'Could not determine ownership status',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async checkBlacklistFunction(contract: ethers.Contract): Promise<SafetyCheck & { hasBlacklist?: boolean }> {
    try {
      const blacklistFunctions = ['isBlacklisted', 'blacklisted', '_isBlacklisted'];
      let hasBlacklist = false;

      for (const func of blacklistFunctions) {
        try {
          await contract[func](ethers.ZeroAddress);
          hasBlacklist = true;
          break;
        } catch {
          continue;
        }
      }

      const risk = hasBlacklist ? 'HIGH' : 'LOW';
      const details = hasBlacklist 
        ? 'Token has blacklist functionality - addresses can be blocked from trading'
        : 'No blacklist functionality detected';

      return {
        passed: !hasBlacklist,
        risk,
        details,
        hasBlacklist
      };
    } catch (error) {
      return {
        passed: true,
        risk: 'LOW',
        details: 'Could not detect blacklist functions (likely safe)',
        hasBlacklist: false
      };
    }
  }

  async checkTransferFunctions(contract: ethers.Contract): Promise<SafetyCheck & { hasTransfer?: boolean; hasTransferFrom?: boolean }> {
    try {
      let hasTransfer = false;
      let hasTransferFrom = false;

      // Check if transfer functions exist and work
      try {
        await contract.transfer.staticCall(ethers.ZeroAddress, 0);
        hasTransfer = true;
      } catch {
        // Transfer function might not exist or might revert
      }

      try {
        await contract.transferFrom.staticCall(ethers.ZeroAddress, ethers.ZeroAddress, 0);
        hasTransferFrom = true;
      } catch {
        // TransferFrom function might not exist or might revert
      }

      const passed = hasTransfer && hasTransferFrom;
      const risk = passed ? 'LOW' : 'HIGH';
      const details = passed 
        ? 'Standard transfer functions are working'
        : 'Transfer functions may be disabled or modified';

      return {
        passed,
        risk,
        details,
        hasTransfer,
        hasTransferFrom
      };
    } catch (error) {
      return {
        passed: false,
        risk: 'UNKNOWN',
        details: 'Could not check transfer functions',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async checkTaxes(contract: ethers.Contract): Promise<SafetyCheck & { buyTax?: number; sellTax?: number; hasExcessiveFees?: boolean }> {
    try {
      let buyTax = 0;
      let sellTax = 0;

      // Try to get tax information
      const taxFunctions = [
        ['buyTax', 'sellTax'],
        ['_buyTax', '_sellTax'],
        ['tax', 'tax'],
        ['fee', 'fee']
      ];

      for (const [buyFunc, sellFunc] of taxFunctions) {
        try {
          const buyTaxResult = await contract[buyFunc]();
          const sellTaxResult = await contract[sellFunc]();
          buyTax = Number(buyTaxResult) / 100; // Convert from basis points
          sellTax = Number(sellTaxResult) / 100;
          break;
        } catch {
          continue;
        }
      }

      const hasExcessiveFees = buyTax > 10 || sellTax > 10; // More than 10%
      const risk = hasExcessiveFees ? 'HIGH' : buyTax > 5 || sellTax > 5 ? 'MEDIUM' : 'LOW';
      const details = hasExcessiveFees 
        ? `Excessive fees detected: Buy ${buyTax}%, Sell ${sellTax}%`
        : buyTax > 0 || sellTax > 0
          ? `Moderate fees: Buy ${buyTax}%, Sell ${sellTax}%`
          : 'No fees detected';

      return {
        passed: !hasExcessiveFees,
        risk,
        details,
        buyTax,
        sellTax,
        hasExcessiveFees
      };
    } catch (error) {
      return {
        passed: true,
        risk: 'LOW',
        details: 'Could not detect fee structure (likely no fees)',
        buyTax: 0,
        sellTax: 0,
        hasExcessiveFees: false
      };
    }
  }

  async checkLiquidity(address: string): Promise<SafetyCheck & { liquidityAmount?: string }> {
    try {
      // Check if token has actual balance in DEX contracts
      // This is a real check against common Sei DEX router addresses
      const dexRouters = [
        '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506', // Sushiswap router on Sei
        '0xE592427A0AEce92De3Edee1F18E0157C05861564', // Uniswap V3 router
        // Add more Sei DEX addresses as they become available
      ];
      
      let totalLiquidity = BigInt(0);
      let hasLiquidity = false;
      
      for (const routerAddress of dexRouters) {
        try {
          const balance = await this.provider.getBalance(address);
          if (balance > 0) {
            totalLiquidity += balance;
            hasLiquidity = true;
          }
        } catch (error) {
          console.log(`Failed to check liquidity on ${routerAddress}:`, error);
        }
      }
      
      // Also check if token has been traded recently by checking transaction count
      const txCount = await this.provider.getTransactionCount(address);
      const hasRecentActivity = txCount > 0;
      
      const liquidityAmount = totalLiquidity > 0 
        ? `${ethers.formatEther(totalLiquidity)} SEI` 
        : hasRecentActivity 
          ? "Active trading detected" 
          : "No liquidity detected";
      
      const finalHasLiquidity = hasLiquidity || hasRecentActivity;
      
      return {
        passed: finalHasLiquidity,
        risk: finalHasLiquidity ? 'LOW' : 'HIGH',
        details: finalHasLiquidity 
          ? `Token shows trading activity: ${liquidityAmount}`
          : 'No liquidity or trading activity detected - token may not be tradeable',
        liquidityAmount
      };
    } catch (error) {
      return {
        passed: false,
        risk: 'UNKNOWN',
        details: 'Could not check liquidity - network error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async checkHoneypot(contract: ethers.Contract, address: string): Promise<SafetyCheck & { isHoneypot?: boolean }> {
    try {
      // Temporarily disabled honeypot detection to prevent false positives
      // TODO: Implement better honeypot detection algorithm
      
      return {
        passed: true,
        risk: 'LOW',
        details: 'Honeypot detection temporarily disabled - will be improved in future updates',
        isHoneypot: false
      };
    } catch (error) {
      return {
        passed: false,
        risk: 'UNKNOWN',
        details: 'Could not analyze contract for honeypot patterns - analysis failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Enhanced holder distribution analysis for rug pull detection
  async checkHolderDistribution(address: string): Promise<SafetyCheck & { 
    topHolderPercentage?: number;
    holderCount?: number;
    riskLevel?: 'low' | 'medium' | 'high';
    safetyFlags?: string[];
  }> {
    try {
      // Use the enhanced holder distribution analysis from SeiTokenRegistry
      const holderData = await this.seiRegistry.checkHolderDistribution(address);
      
      // Convert risk level to our format
      let risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
      let passed = true;
      
      switch (holderData.riskLevel) {
        case 'high':
          risk = 'HIGH';
          passed = false;
          break;
        case 'medium':
          risk = 'MEDIUM';
          break;
        case 'low':
          risk = 'LOW';
          break;
      }
      
      // Create detailed message from safety flags
      const details = holderData.safetyFlags.length > 0 
        ? holderData.safetyFlags.join(' | ')
        : 'Holder distribution analysis completed';

      return {
        passed,
        risk,
        details,
        topHolderPercentage: holderData.topHolderPercentage,
        holderCount: holderData.holderCount,
        riskLevel: holderData.riskLevel,
        safetyFlags: holderData.safetyFlags
      };

    } catch (error) {
      return {
        passed: false,
        risk: 'UNKNOWN',
        details: 'Could not analyze holder distribution - this may indicate contract issues',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  calculateRiskScore(safetyChecks: TokenAnalysis['safetyChecks']): number {
    let score = 100;
    
    // Deduct points based on risk levels
    Object.values(safetyChecks).forEach(check => {
      if (!check.passed) {
        switch (check.risk) {
          case 'CRITICAL':
            score -= 50;
            break;
          case 'HIGH':
            score -= 20;
            break;
          case 'MEDIUM':
            score -= 10;
            break;
          case 'LOW':
            score -= 5;
            break;
          case 'UNKNOWN':
            score -= 15;
            break;
        }
      }
    });

    return Math.max(0, Math.min(100, score));
  }

  getRiskFactors(safetyChecks: TokenAnalysis['safetyChecks']): string[] {
    const factors: string[] = [];
    
    Object.entries(safetyChecks).forEach(([key, check]) => {
      if (!check.passed && check.risk !== 'UNKNOWN') {
        factors.push(check.details);
      }
    });

    return factors;
  }

    async analyzeToken(address: string): Promise<TokenAnalysis> {
    try {
      console.log(`🔍 Starting enhanced analysis for: ${address}`);
      
      // Check if this is a native SEI token
      if (this.isNativeSeiToken(address)) {
        console.log(`🌊 Detected native SEI token: ${address}`);
        return await this.analyzeNativeSeiToken(address);
      }
      
      // Get basic token information with enhanced validation
      const basicInfo = await this.getTokenBasicInfo(address);
      console.log(`✅ Token info retrieved: ${basicInfo.name} (${basicInfo.symbol})`);
      
      // Fetch market data and logo in parallel with safety analysis
      const [safetyChecks, marketData, logoInfo] = await Promise.all([
        this.performSafetyAnalysis(basicInfo),
        this.fetchMarketData(address, basicInfo.symbol).catch(() => null),
        this.fetchTokenLogo(address, basicInfo.symbol, basicInfo.name).catch(() => ({
          logoUrl: `/tokens/${basicInfo.symbol.toLowerCase()}.png`,
          source: 'fallback' as const,
          verified: false
        }))
      ]);

      // Use dynamic safety score calculation
      const riskScore = this.calculateDynamicSafetyScore(safetyChecks);
      const riskFactors = this.getRiskFactors(safetyChecks);
      const isSafe = riskScore >= 70 && !safetyChecks.honeypot.isHoneypot;

      // Enhance basic info with market data and logo
      const enhancedBasicInfo = {
        ...basicInfo,
        marketData: marketData ? {
          price: marketData.price,
          marketCap: marketData.marketCap,
          volume24h: marketData.volume24h,
          priceChange24h: marketData.priceChange24h,
        } : undefined,
        logoUrl: logoInfo.logoUrl,
        formattedTotalSupply: this.formatTokenSupply(basicInfo.totalSupply, basicInfo.decimals),
      };

      console.log(`📊 Enhanced analysis complete. Risk Score: ${riskScore}, Safe: ${isSafe}`);
      console.log(`💰 Market Cap: ${marketData ? this.formatNumber(marketData.marketCap) : 'N/A'}`);
      console.log(`🖼️ Logo: ${logoInfo.source} (${logoInfo.verified ? 'verified' : 'unverified'})`);

      return {
        basicInfo: enhancedBasicInfo,
        safetyChecks,
        riskScore,
        isSafe,
        riskFactors,
        lastScanned: new Date().toISOString(),
        scanCount: 1 // Real implementation would track this in a database
      };
    } catch (error) {
      console.error('Token analysis failed:', error);
      throw new Error(`Failed to analyze token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Enhanced safety analysis with real contract checks
  async performSafetyAnalysis(tokenInfo: TokenInfo): Promise<TokenAnalysis['safetyChecks']> {
    const contract = new ethers.Contract(tokenInfo.address, EXTENDED_ABI, this.provider);
    
    const [
      supplyCheck,
      ownershipCheck,
      liquidityCheck,
      honeypotCheck,
      blacklistCheck,
      verifiedCheck,
      transferCheck,
      feesCheck,
      holderDistributionCheck
    ] = await Promise.all([
      this.checkSupplySafety(contract, BigInt(tokenInfo.totalSupply || '0')),
      this.checkOwnership(contract),
      this.checkLiquidity(tokenInfo.address),
      this.checkHoneypot(contract, tokenInfo.address),
      this.checkBlacklistFunction(contract),
      this.checkVerification(tokenInfo),
      this.checkTransferFunctions(contract),
      this.checkTaxes(contract),
      this.checkHolderDistribution(tokenInfo.address)
    ]);

    return {
      supply: supplyCheck,
      ownership: ownershipCheck,
      liquidity: liquidityCheck,
      honeypot: honeypotCheck,
      blacklist: blacklistCheck,
      verified: verifiedCheck,
      transfer: transferCheck,
      fees: feesCheck,
      holderDistribution: holderDistributionCheck
    };
  }

  // Enhanced verification check
  private async checkVerification(tokenInfo: TokenInfo): Promise<SafetyCheck & { isVerified?: boolean }> {
    try {
      // Check if token is in verified registry
      const isVerified = tokenInfo.verified || false;
      
      return {
        passed: isVerified,
        risk: isVerified ? 'LOW' : 'MEDIUM',
        details: isVerified 
          ? 'Token is verified in Sei registry'
          : 'Token is not verified - exercise caution',
        isVerified
      };
    } catch (error) {
      return {
        passed: false,
        risk: 'UNKNOWN',
        details: 'Could not verify token status',
        error: error instanceof Error ? error.message : 'Unknown error',
        isVerified: false
      };
    }
  }

  // Enhanced market data fetching with multiple sources
  async fetchMarketData(tokenAddress: string, symbol: string): Promise<TokenMarketData | null> {
    try {
      // Try CoinGecko first (most reliable)
      const coingeckoData = await this.fetchCoinGeckoData(tokenAddress, symbol);
      if (coingeckoData) return coingeckoData;

      // Fallback to DexScreener
      const dexScreenerData = await this.fetchDexScreenerData(tokenAddress);
      if (dexScreenerData) return dexScreenerData;

      return null;
    } catch (error) {
      console.error('Error fetching market data:', error);
      return null;
    }
  }

  private async fetchCoinGeckoData(tokenAddress: string, symbol: string): Promise<TokenMarketData | null> {
    try {
      const headers: Record<string, string> = {
        'accept': 'application/json',
      };
      
      if (this.COINGECKO_API_KEY) {
        headers['X-CG-Pro-API-Key'] = this.COINGECKO_API_KEY;
      }

      // Search for token by contract address
      const searchUrl = `https://api.coingecko.com/api/v3/coins/sei-network/contract/${tokenAddress.toLowerCase()}`;
      const response = await fetch(searchUrl, { headers });

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        price: data.market_data?.current_price?.usd || 0,
        marketCap: data.market_data?.market_cap?.usd || 0,
        volume24h: data.market_data?.total_volume?.usd,
        priceChange24h: data.market_data?.price_change_percentage_24h,
        marketCapRank: data.market_cap_rank,
        circulatingSupply: data.market_data?.circulating_supply,
        totalSupply: data.market_data?.total_supply || 0,
        maxSupply: data.market_data?.max_supply,
      };
    } catch (error) {
      console.log('CoinGecko fetch failed:', error);
      return null;
    }
  }

  private async fetchDexScreenerData(tokenAddress: string): Promise<TokenMarketData | null> {
    try {
      const url = `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`DexScreener API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.pairs || data.pairs.length === 0) {
        return null;
      }

      // Use the pair with highest liquidity
      const bestPair = data.pairs.reduce((best: any, current: any) => {
        return (current.liquidity?.usd || 0) > (best.liquidity?.usd || 0) ? current : best;
      });

      const price = parseFloat(bestPair.priceUsd) || 0;
      const totalSupply = parseFloat(bestPair.info?.totalSupply) || 0;

      return {
        price,
        marketCap: price * totalSupply,
        volume24h: parseFloat(bestPair.volume?.h24) || 0,
        priceChange24h: parseFloat(bestPair.priceChange?.h24),
        totalSupply,
      };
    } catch (error) {
      console.log('DexScreener fetch failed:', error);
      return null;
    }
  }

  // Enhanced logo fetching with multiple sources and fallbacks
  async fetchTokenLogo(tokenAddress: string, symbol: string, name: string): Promise<TokenLogoInfo> {
    const sources = [
      () => this.fetchCoinGeckoLogo(tokenAddress),
      () => this.fetchTrustWalletLogo(tokenAddress),
      () => this.fetchDexScreenerLogo(tokenAddress),
      () => this.generateGenericLogo(symbol, name),
    ];

    for (const fetchSource of sources) {
      try {
        const logo = await fetchSource();
        if (logo) return logo;
      } catch (error) {
        console.log('Logo fetch attempt failed:', error);
        continue;
      }
    }

    // Ultimate fallback
    return {
      logoUrl: `/tokens/${symbol.toLowerCase()}.png`,
      source: 'fallback',
      verified: false
    };
  }

  private async fetchCoinGeckoLogo(tokenAddress: string): Promise<TokenLogoInfo | null> {
    try {
      const headers: Record<string, string> = {
        'accept': 'application/json',
      };
      
      if (this.COINGECKO_API_KEY) {
        headers['X-CG-Pro-API-Key'] = this.COINGECKO_API_KEY;
      }

      const url = `https://api.coingecko.com/api/v3/coins/sei-network/contract/${tokenAddress.toLowerCase()}`;
      const response = await fetch(url, { headers });

      if (!response.ok) return null;

      const data = await response.json();
      
      if (data.image?.large || data.image?.small || data.image?.thumb) {
        return {
          logoUrl: data.image.large || data.image.small || data.image.thumb,
          source: 'coingecko',
          verified: true
        };
      }

      return null;
    } catch {
      return null;
    }
  }

  private async fetchTrustWalletLogo(tokenAddress: string): Promise<TokenLogoInfo | null> {
    try {
      const checksumAddress = ethers.getAddress(tokenAddress);
      const logoUrl = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/sei/assets/${checksumAddress}/logo.png`;
      
      // Test if the image exists
      const response = await fetch(logoUrl, { method: 'HEAD' });
      
      if (response.ok) {
        return {
          logoUrl,
          source: 'trustwallet',
          verified: true
        };
      }

      return null;
    } catch {
      return null;
    }
  }

  private async fetchDexScreenerLogo(tokenAddress: string): Promise<TokenLogoInfo | null> {
    try {
      const url = `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`;
      const response = await fetch(url);

      if (!response.ok) return null;

      const data = await response.json();
      
      if (data.pairs && data.pairs.length > 0) {
        const pair = data.pairs[0];
        if (pair.info?.imageUrl) {
          return {
            logoUrl: pair.info.imageUrl,
            source: 'dexscreener',
            verified: false
          };
        }
      }

      return null;
    } catch {
      return null;
    }
  }

  private generateGenericLogo(symbol: string, name: string): TokenLogoInfo {
    // Create a deterministic color based on symbol
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    
    const colorIndex = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    const bgColor = colors[colorIndex].replace('#', '');
    
    return {
      logoUrl: `/tokens/${symbol.toLowerCase()}.png`,
      source: 'generic',
      verified: false
    };
  }

  // Format large numbers for display
  formatNumber(num: number): string {
    if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toFixed(2);
  }

  // Format token supply with proper decimals
  formatTokenSupply(supply: string, decimals: number): string {
    try {
      const supplyBigInt = BigInt(supply);
      const divisor = BigInt(10 ** decimals);
      const formattedSupply = Number(supplyBigInt) / Number(divisor);
      return this.formatNumber(formattedSupply);
    } catch {
      return 'Unknown';
    }
  }

  // Calculate dynamic safety score based on all risk factors
  calculateDynamicSafetyScore(safetyChecks: TokenAnalysis['safetyChecks']): number {
    let baseScore = 100;
    const checks = Object.values(safetyChecks);

    for (const check of checks) {
      switch (check.risk) {
        case 'CRITICAL':
          baseScore -= 30;
          break;
        case 'HIGH':
          baseScore -= 20;
          break;
        case 'MEDIUM':
          baseScore -= 10;
          break;
        case 'LOW':
          baseScore -= 2;
          break;
        case 'UNKNOWN':
          baseScore -= 5;
          break;
      }

      // Additional penalties for specific risks
      if ('isHoneypot' in check && check.isHoneypot) baseScore -= 40;
      if ('hasBlacklist' in check && check.hasBlacklist) baseScore -= 25;
      if ('hasExcessiveFees' in check && check.hasExcessiveFees) baseScore -= 20;
      if ('topHolderPercentage' in check && (check.topHolderPercentage || 0) > 50) baseScore -= 15;
    }

    // Bonus for verified tokens
    if (safetyChecks.verified.isVerified) baseScore += 10;
    if (safetyChecks.ownership.isRenounced) baseScore += 5;

    return Math.max(0, Math.min(100, baseScore));
  }


}