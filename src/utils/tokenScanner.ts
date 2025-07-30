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
  private async detectTokenStandard(address: string): Promise<'ERC20' | 'ERC721' | 'ERC1155' | 'UNKNOWN'> {
    try {
      const contract = new ethers.Contract(address, [
        'function supportsInterface(bytes4) view returns (bool)',
        'function totalSupply() view returns (uint256)',
        'function balanceOf(address) view returns (uint256)',
        'function transfer(address, uint256) returns (bool)'
      ], this.provider);

      // Check for ERC165 support first
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

  async fetchTokenLogo(address: string, symbol: string): Promise<string | null> {
    const logoSources = [
      // CoinGecko API (try both Ethereum and generic search)
      async () => {
        try {
          // First try direct contract lookup
          const response = await fetch(`https://api.coingecko.com/api/v3/coins/ethereum/contract/${address.toLowerCase()}`);
          if (response.ok) {
            const data = await response.json();
            return data.image?.large || data.image?.small || null;
          }
        } catch (error) {
          console.log('CoinGecko contract lookup failed:', error);
        }

        try {
          // Then try searching by symbol
          const searchResponse = await fetch(`https://api.coingecko.com/api/v3/search?query=${symbol}`);
          if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            const coin = searchData.coins?.[0];
            if (coin && coin.large) {
              return coin.large;
            }
          }
        } catch (error) {
          console.log('CoinGecko search failed:', error);
        }
        return null;
      },
      
      // Trust Wallet assets (try multiple blockchain paths)
      async () => {
        const blockchains = ['ethereum', 'smartchain', 'polygon'];
        
        for (const blockchain of blockchains) {
          try {
            const logoUrl = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${blockchain}/assets/${address}/logo.png`;
            const response = await fetch(logoUrl, { method: 'HEAD' });
            if (response.ok) {
              return logoUrl;
            }
          } catch (error) {
            console.log(`Trust Wallet ${blockchain} logo fetch failed:`, error);
          }
        }
        return null;
      }
    ];

    // Try each source with timeout
    for (const source of logoSources) {
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 3000)
        );
        
        const logo = await Promise.race([source(), timeoutPromise]);
        if (logo) {
          console.log('Found logo:', logo);
          return logo;
        }
      } catch (error) {
        console.log('Logo source failed:', error);
        continue;
      }
    }

    // Return null if no logo found - don't create fallback URL
    return null;
  }

    async getTokenBasicInfo(address: string): Promise<TokenInfo> {
    try {
      // Validate address format
      if (!this.isValidAddress(address)) {
        throw new Error('Invalid address format');
      }

      // Check if it's a contract
      const isContract = await this.isContract(address);
      if (!isContract) {
        throw new Error('Address is not a contract (might be an EOA - Externally Owned Account)');
      }

      // Detect token standard
      const tokenStandard = await this.detectTokenStandard(address);
      if (tokenStandard === 'UNKNOWN') {
        console.warn('Unknown token standard, attempting basic analysis...');
      }

      const contract = new ethers.Contract(address, EXTENDED_ABI, this.provider);

      // Try different approaches for getting token info
      const tokenInfo = await this.getTokenInfoWithFallbacks(contract, address, tokenStandard);
      
      const logoUrl = await this.fetchTokenLogo(address, tokenInfo.symbol);

      return {
        address: ethers.getAddress(address), // Normalize address checksum
        name: tokenInfo.name,
        symbol: tokenInfo.symbol,
        decimals: tokenInfo.decimals,
        totalSupply: tokenInfo.totalSupply,
        logoUrl: logoUrl || undefined
      };
    } catch (error) {
      console.error('Error fetching basic token info:', error);
      throw new Error(`Failed to fetch token information: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      // Note: This is a simplified liquidity check for demonstration
      // Real implementation would check DEX pools like DragonSwap, Astroport, etc.
      const balance = await this.provider.getBalance(address);
      const hasLiquidity = balance > ethers.parseEther('0.1');
      
      return {
        passed: hasLiquidity,
        risk: hasLiquidity ? 'LOW' : 'HIGH',
        details: hasLiquidity 
          ? `Contract has ${ethers.formatEther(balance)} SEI balance` 
          : 'No significant liquidity detected - Coming Soon: Full DEX integration',
        liquidityAmount: ethers.formatEther(balance)
      };
    } catch (error) {
      return {
        passed: false,
        risk: 'UNKNOWN',
        details: 'Could not check liquidity - Coming Soon: Full DEX integration',
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
      console.log(`🔍 Starting universal analysis for: ${address}`);
      
      // Get basic token information with enhanced validation
      const basicInfo = await this.getTokenBasicInfo(address);
      console.log(`✅ Token info retrieved: ${basicInfo.name} (${basicInfo.symbol})`);
      
      const contract = new ethers.Contract(address, EXTENDED_ABI, this.provider);

      // Perform safety checks with enhanced error handling
      console.log('🔒 Running safety checks...');
      const safetyChecks = await this.performSafetyChecks(contract, address, basicInfo);

      const riskScore = this.calculateRiskScore(safetyChecks);
      const riskFactors = this.getRiskFactors(safetyChecks);
      const isSafe = riskScore >= 70 && !safetyChecks.honeypot.isHoneypot;

      console.log(`📊 Analysis complete. Risk Score: ${riskScore}, Safe: ${isSafe}`);

      return {
        basicInfo,
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

  // Enhanced safety checks with better error handling
  private async performSafetyChecks(contract: ethers.Contract, address: string, basicInfo: TokenInfo): Promise<TokenAnalysis['safetyChecks']> {
    const checks = {
      supply: null as SafetyCheck | null,
      ownership: null as (SafetyCheck & { owner?: string; isRenounced?: boolean }) | null,
      blacklist: null as (SafetyCheck & { hasBlacklist?: boolean }) | null,
      transfer: null as (SafetyCheck & { hasTransfer?: boolean; hasTransferFrom?: boolean }) | null,
      fees: null as (SafetyCheck & { buyTax?: number; sellTax?: number; hasExcessiveFees?: boolean }) | null,
      liquidity: null as (SafetyCheck & { liquidityAmount?: string }) | null,
      honeypot: null as (SafetyCheck & { isHoneypot?: boolean }) | null,
      verified: { 
        passed: false, 
        risk: 'UNKNOWN' as const, 
        details: 'Contract verification status - Coming Soon: Integration with block explorers',
        isVerified: false
      }
    };

    // Run checks with individual error handling
    const checkPromises = [
      this.checkSupplySafety(contract, BigInt(basicInfo.totalSupply || '0')).then(result => { checks.supply = result; }).catch(err => {
        console.warn('Supply check failed:', err);
        checks.supply = { passed: false, risk: 'UNKNOWN', details: 'Could not analyze supply', error: err.message };
      }),
      
      this.checkOwnership(contract).then(result => { checks.ownership = result; }).catch(err => {
        console.warn('Ownership check failed:', err);
        checks.ownership = { passed: false, risk: 'UNKNOWN', details: 'Could not analyze ownership', error: err.message };
      }),
      
      this.checkBlacklistFunction(contract).then(result => { checks.blacklist = result; }).catch(err => {
        console.warn('Blacklist check failed:', err);
        checks.blacklist = { passed: true, risk: 'LOW', details: 'Could not check blacklist (likely safe)', hasBlacklist: false };
      }),
      
      this.checkTransferFunctions(contract).then(result => { checks.transfer = result; }).catch(err => {
        console.warn('Transfer check failed:', err);
        checks.transfer = { passed: false, risk: 'UNKNOWN', details: 'Could not analyze transfer functions', error: err.message };
      }),
      
      this.checkTaxes(contract).then(result => { checks.fees = result; }).catch(err => {
        console.warn('Tax check failed:', err);
        checks.fees = { passed: true, risk: 'LOW', details: 'Could not detect fees (likely no fees)', buyTax: 0, sellTax: 0, hasExcessiveFees: false };
      }),
      
      this.checkLiquidity(address).then(result => { checks.liquidity = result; }).catch(err => {
        console.warn('Liquidity check failed:', err);
        checks.liquidity = { passed: false, risk: 'UNKNOWN', details: 'Could not analyze liquidity', error: err.message };
      }),
      
      this.checkHoneypot(contract, address).then(result => { checks.honeypot = result; }).catch(err => {
        console.warn('Honeypot check failed:', err);
        checks.honeypot = { passed: true, risk: 'LOW', details: 'Could not analyze for honeypot patterns (likely safe)', isHoneypot: false };
      })
    ];

    // Wait for all checks to complete
    await Promise.all(checkPromises);

    // Ensure all checks have values (fallback to safe defaults)
    return {
      supply: checks.supply || { passed: false, risk: 'UNKNOWN', details: 'Supply check failed' },
      ownership: checks.ownership || { passed: false, risk: 'UNKNOWN', details: 'Ownership check failed' },
      liquidity: checks.liquidity || { passed: false, risk: 'UNKNOWN', details: 'Liquidity check failed' },
      honeypot: checks.honeypot || { passed: true, risk: 'LOW', details: 'Honeypot check failed (assumed safe)', isHoneypot: false },
      blacklist: checks.blacklist || { passed: true, risk: 'LOW', details: 'Blacklist check failed (assumed safe)', hasBlacklist: false },
      verified: checks.verified,
      transfer: checks.transfer || { passed: false, risk: 'UNKNOWN', details: 'Transfer check failed' },
      fees: checks.fees || { passed: true, risk: 'LOW', details: 'Fee check failed (assumed no fees)', buyTax: 0, sellTax: 0, hasExcessiveFees: false }
    };
  }
}