import { ethers } from 'ethers';

// Private key wallet for seamless AI transactions
// IMPORTANT: Replace with your actual private key for the wallet: 0x966CBf1baa5C08e4458f08A4CF1ECbb6Ae50894e
// Load private key from environment at runtime; never commit secrets
const PRIVATE_KEY = (import.meta as any).env?.VITE_DEV_WALLET_PRIVATE_KEY || '';

export class PrivateKeyWallet {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private seiPrice = 0.834; // SEI price in USD

  constructor() {
    this.provider = new ethers.JsonRpcProvider('https://evm-rpc-testnet.sei-apis.com');
    this.wallet = new ethers.Wallet(PRIVATE_KEY, this.provider);
  }

  // Connectivity helpers
  get isConnected(): boolean { return !!PRIVATE_KEY && PRIVATE_KEY.length > 40 }
  getSigner(): ethers.Wallet { return this.wallet }

  // Get wallet address
  getAddress(): string {
    return this.wallet.address;
  }

  // Get SEI balance
  async getSeiBalance(): Promise<{ sei: string; usd: number }> {
    try {
      const balance = await this.provider.getBalance(this.wallet.address);
      const seiBalance = parseFloat(ethers.formatEther(balance));
      return {
        sei: seiBalance.toFixed(4),
        usd: seiBalance * this.seiPrice
      };
    } catch (error: any) {
      throw new Error(`Failed to get SEI balance: ${error.message}`);
    }
  }

  // Get tokens created by this wallet (from Dev++ storage)
  getMyTokens(): Array<{ address: string; name: string; symbol: string; supply: string; creator: string }> {
    try {
      const savedTokens = localStorage.getItem('dev++_tokens');
      if (savedTokens) {
        const tokens = JSON.parse(savedTokens);
        // Filter tokens created by this wallet address
        return tokens.filter((token: any) => 
          token.creator && token.creator.toLowerCase() === this.wallet.address.toLowerCase()
        );
      }
      return [];
    } catch (error) {
      console.error('Failed to get my tokens:', error);
      return [];
    }
  }

  // Check if I own/created this token
  async isMyToken(tokenAddress: string): Promise<boolean> {
    try {
      // Check if token is in my created tokens list
      const myTokens = this.getMyTokens();
      const isInMyList = myTokens.some(token => 
        token.address.toLowerCase() === tokenAddress.toLowerCase()
      );
      
      if (isInMyList) return true;

      // Also check if I'm the owner of the contract (for tokens with owner function)
      try {
        const tokenContract = new ethers.Contract(tokenAddress, [
          'function owner() view returns (address)'
        ], this.provider);
        
        const owner = await tokenContract.owner();
        return owner.toLowerCase() === this.wallet.address.toLowerCase();
      } catch {
        // Token might not have owner function, that's ok
        return false;
      }
    } catch (error) {
      console.error('Failed to check token ownership:', error);
      return false;
    }
  }

  // Get USDC balance specifically
  async getUSDCBalance(): Promise<{ balance: string; usd: number }> {
    try {
      // Common USDC addresses on Sei (you can add more)
      const USDC_ADDRESSES = [
        (import.meta as any).env?.VITE_USDC_TESTNET || '0x4fCF1784B31630811181f670Aea7A7bEF803eaED'
      ];
      
      for (const usdcAddress of USDC_ADDRESSES) {
        try {
          const tokenContract = new ethers.Contract(usdcAddress, [
            'function balanceOf(address) view returns (uint256)',
            'function decimals() view returns (uint8)',
            'function symbol() view returns (string)'
          ], this.provider);

          const [balance, decimals, symbol] = await Promise.all([
            tokenContract.balanceOf(this.wallet.address),
            tokenContract.decimals(),
            tokenContract.symbol()
          ]);

          if (symbol.toLowerCase().includes('usdc')) {
            const formattedBalance = ethers.formatUnits(balance, decimals);
            const balanceNum = parseFloat(formattedBalance);
            
            return {
              balance: balanceNum.toFixed(2),
              usd: balanceNum // USDC is 1:1 with USD
            };
          }
        } catch (error) {
          // Try next address
          continue;
        }
      }
      
      // No USDC found
      return { balance: '0.00', usd: 0 };
    } catch (error) {
      console.error('Failed to get USDC balance:', error);
      return { balance: '0.00', usd: 0 };
    }
  }

  // Get token balance
  async getTokenBalance(tokenAddress: string): Promise<{ balance: string; symbol: string; name: string }> {
    try {
      const tokenContract = new ethers.Contract(tokenAddress, [
        'function balanceOf(address) view returns (uint256)',
        'function decimals() view returns (uint8)',
        'function symbol() view returns (string)',
        'function name() view returns (string)'
      ], this.provider);

      const [balance, decimals, symbol, name] = await Promise.all([
        tokenContract.balanceOf(this.wallet.address),
        tokenContract.decimals(),
        tokenContract.symbol(),
        tokenContract.name()
      ]);

      const formattedBalance = ethers.formatUnits(balance, decimals);
      
      return {
        balance: parseFloat(formattedBalance).toFixed(4),
        symbol,
        name
      };
    } catch (error) {
      throw new Error(`Failed to get token balance: ${error.message}`);
    }
  }

  // Add liquidity (simplified for testing)
  async addLiquidity(tokenAddress: string, tokenAmount: string, seiAmount: string) {
    try {
      // First approve token spending
      const tokenContract = new ethers.Contract(tokenAddress, [
        'function approve(address spender, uint256 amount) returns (bool)',
        'function decimals() view returns (uint8)'
      ], this.wallet);

      const decimals = await tokenContract.decimals();
      const tokenAmountWei = ethers.parseUnits(tokenAmount, decimals);

      const approveTx = await tokenContract.approve(this.wallet.address, tokenAmountWei);
      await approveTx.wait();

      // For testing, we'll create a mock liquidity transaction
      const liquidityTx = await this.wallet.sendTransaction({
        to: tokenAddress,
        value: ethers.parseEther(seiAmount),
        gasLimit: 100000
      });

      await liquidityTx.wait();

      return {
        success: true,
        txHash: liquidityTx.hash,
        tokenAmount,
        seiAmount
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Burn tokens
  async burnTokens(tokenAddress: string, amount: string) {
    try {
      const tokenContract = new ethers.Contract(tokenAddress, [
        'function burn(uint256 amount) returns (bool)',
        'function decimals() view returns (uint8)',
        'function totalSupply() view returns (uint256)'
      ], this.wallet);

      const decimals = await tokenContract.decimals();
      const burnAmount = ethers.parseUnits(amount, decimals);

      const burnTx = await tokenContract.burn(burnAmount);
      await burnTx.wait();

      const newTotalSupply = await tokenContract.totalSupply();
      const formattedSupply = ethers.formatUnits(newTotalSupply, decimals);

      return {
        success: true,
        txHash: burnTx.hash,
        amountBurned: amount,
        newTotalSupply: parseFloat(formattedSupply).toFixed(0)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Transfer tokens
  async transferTokens(tokenAddress: string, toAddress: string, amount: string) {
    try {
      const tokenContract = new ethers.Contract(tokenAddress, [
        'function transfer(address to, uint256 amount) returns (bool)',
        'function decimals() view returns (uint8)'
      ], this.wallet);

      const decimals = await tokenContract.decimals();
      const transferAmount = ethers.parseUnits(amount, decimals);

      const transferTx = await tokenContract.transfer(toAddress, transferAmount);
      await transferTx.wait();

      return {
        success: true,
        txHash: transferTx.hash,
        amount,
        to: toAddress
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send SEI
  async sendSei(toAddress: string, amount: string) {
    try {
      const tx = await this.wallet.sendTransaction({
        to: toAddress,
        value: ethers.parseEther(amount)
      });

      await tx.wait();

      return {
        success: true,
        txHash: tx.hash,
        amount,
        to: toAddress
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Simple transfer helper used by ChatBrain
  async transferToken(amount: string, to: string, token?: string): Promise<string> {
    const isNative = !token || token === '0x0'
    if (isNative) {
      const tx = await this.wallet.sendTransaction({ to, value: ethers.parseEther(amount) })
      return tx.hash
    }
    const erc20 = new ethers.Contract(token as string, [
      'function decimals() view returns (uint8)',
      'function transfer(address,uint256) returns (bool)'
    ], this.wallet)
    const dec = await erc20.decimals()
    const amt = ethers.parseUnits(amount, dec)
    const tx = await erc20.transfer(to, amt)
    return tx.hash
  }
}

// Export singleton instance
export const privateKeyWallet = new PrivateKeyWallet();