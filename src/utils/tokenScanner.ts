import { ethers } from 'ethers';

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

export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  logoUrl?: string;
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
  };
  riskScore: number;
  isSafe: boolean;
  riskFactors: string[];
  lastScanned: string;
  scanCount: number;
}

export class TokenScanner {
  private provider: ethers.JsonRpcProvider;
  private readonly SEI_RPC_URL = 'https://evm-rpc-testnet.sei-apis.com';

  constructor() {
    this.provider = new ethers.JsonRpcProvider(this.SEI_RPC_URL);
  }

  async fetchTokenLogo(address: string, symbol: string): Promise<string | null> {
    const logoSources = [
      // CoinGecko API
      async () => {
        try {
          const response = await fetch(`https://api.coingecko.com/api/v3/coins/ethereum/contract/${address.toLowerCase()}`);
          if (response.ok) {
            const data = await response.json();
            return data.image?.large || data.image?.small || null;
          }
        } catch (error) {
          console.log('CoinGecko logo fetch failed:', error);
        }
        return null;
      },
      
      // Trust Wallet assets
      async () => {
        try {
          const logoUrl = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${ethers.getAddress(address)}/logo.png`;
          const response = await fetch(logoUrl, { method: 'HEAD' });
          return response.ok ? logoUrl : null;
        } catch (error) {
          console.log('Trust Wallet logo fetch failed:', error);
        }
        return null;
      },

      // TokenLists
      async () => {
        try {
          const response = await fetch('https://tokens.coingecko.com/uniswap/all.json');
          if (response.ok) {
            const data = await response.json();
            const token = data.tokens.find((t: any) => 
              t.address.toLowerCase() === address.toLowerCase() || 
              t.symbol.toLowerCase() === symbol.toLowerCase()
            );
            return token?.logoURI || null;
          }
        } catch (error) {
          console.log('TokenLists logo fetch failed:', error);
        }
        return null;
      },

      // Fallback to generic token icon
      async () => {
        return `https://via.placeholder.com/64x64/FF6B35/FFFFFF?text=${symbol.slice(0, 2).toUpperCase()}`;
      }
    ];

    for (const source of logoSources) {
      try {
        const logo = await source();
        if (logo) return logo;
      } catch (error) {
        console.log('Logo source failed:', error);
        continue;
      }
    }

    return null;
  }

  async getTokenBasicInfo(address: string): Promise<TokenInfo> {
    try {
      const contract = new ethers.Contract(address, EXTENDED_ABI, this.provider);
      
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        contract.name().catch(() => 'Unknown Token'),
        contract.symbol().catch(() => 'UNKNOWN'),
        contract.decimals().catch(() => 18),
        contract.totalSupply().catch(() => ethers.parseUnits('0', 18))
      ]);

      const logoUrl = await this.fetchTokenLogo(address, symbol);

      return {
        address,
        name,
        symbol,
        decimals: Number(decimals),
        totalSupply: totalSupply.toString(),
        logoUrl: logoUrl || undefined
      };
    } catch (error) {
      console.error('Error fetching basic token info:', error);
      throw new Error('Failed to fetch token information');
    }
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
      // This is a simplified liquidity check
      // In a real implementation, you would check DEX pools
      const balance = await this.provider.getBalance(address);
      const hasLiquidity = balance > ethers.parseEther('0.1');
      
      return {
        passed: hasLiquidity,
        risk: hasLiquidity ? 'LOW' : 'HIGH',
        details: hasLiquidity ? 'Contract has some ETH balance' : 'No significant liquidity detected',
        liquidityAmount: ethers.formatEther(balance)
      };
    } catch (error) {
      return {
        passed: false,
        risk: 'UNKNOWN',
        details: 'Could not check liquidity',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async checkHoneypot(contract: ethers.Contract, address: string): Promise<SafetyCheck & { isHoneypot?: boolean }> {
    try {
      // Basic honeypot detection by checking contract code patterns
      const code = await this.provider.getCode(address);
      
      // Look for suspicious patterns in bytecode
      const suspiciousPatterns = [
        '6360fe47', // Common revert pattern
        'fe', // Invalid opcode at the end
        '60006000fd', // Revert with no message
      ];

      const isHoneypot = suspiciousPatterns.some(pattern => code.includes(pattern));
      
      return {
        passed: !isHoneypot,
        risk: isHoneypot ? 'CRITICAL' : 'LOW',
        details: isHoneypot ? 'Potential honeypot patterns detected in contract code' : 'No honeypot patterns detected',
        isHoneypot
      };
    } catch (error) {
      return {
        passed: false,
        risk: 'UNKNOWN',
        details: 'Could not analyze contract for honeypot patterns',
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
      // Get basic token information
      const basicInfo = await this.getTokenBasicInfo(address);
      const contract = new ethers.Contract(address, EXTENDED_ABI, this.provider);
      
      // Perform all safety checks
      const [supply, ownership, blacklist, transfer, fees, liquidity, honeypot] = await Promise.all([
        this.checkSupplySafety(contract, BigInt(basicInfo.totalSupply)),
        this.checkOwnership(contract),
        this.checkBlacklistFunction(contract),
        this.checkTransferFunctions(contract),
        this.checkTaxes(contract),
        this.checkLiquidity(address),
        this.checkHoneypot(contract, address)
      ]);

      const safetyChecks = {
        supply,
        ownership,
        liquidity,
        honeypot,
        blacklist,
        verified: { passed: true, risk: 'LOW' as const, details: 'Contract verification status unknown' },
        transfer,
        fees
      };

      const riskScore = this.calculateRiskScore(safetyChecks);
      const riskFactors = this.getRiskFactors(safetyChecks);
      const isSafe = riskScore >= 70 && !safetyChecks.honeypot.isHoneypot;

      return {
        basicInfo,
        safetyChecks,
        riskScore,
        isSafe,
        riskFactors,
        lastScanned: new Date().toISOString(),
        scanCount: Math.floor(Math.random() * 100) + 1 // Mock scan count
      };
    } catch (error) {
      console.error('Token analysis failed:', error);
      throw new Error(`Failed to analyze token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}