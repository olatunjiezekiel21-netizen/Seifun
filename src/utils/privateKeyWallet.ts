import { ethers } from 'ethers';

export class PrivateKeyWallet {
  private wallet: ethers.Wallet;
  private provider: ethers.JsonRpcProvider;

  constructor(privateKey: string, rpcUrl: string) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
  }

  get address(): string {
    return this.wallet.address;
  }

  async getBalance(): Promise<string> {
    try {
      const balance = await this.provider.getBalance(this.wallet.address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Failed to get balance:', error);
      return '0';
    }
  }

  async signTransaction(transaction: any): Promise<string> {
    try {
      const signedTx = await this.wallet.signTransaction(transaction);
      return signedTx;
    } catch (error) {
      console.error('Failed to sign transaction:', error);
      throw error;
    }
  }

  async sendTransaction(transaction: any): Promise<string> {
    try {
      const tx = await this.wallet.sendTransaction(transaction);
      return tx.hash;
    } catch (error) {
      console.error('Failed to send transaction:', error);
      throw error;
    }
  }

  getSigner(): ethers.Wallet {
    return this.wallet;
  }
}

// Test private key wallet hook
export const usePrivateKeyWallet = () => {
  const privateKey = '0x7c5e4b6198276efe786d05f2e3f3ef8f91409066a5de3f1ca58e630c3445c684';
  const rpcUrl = 'https://evm-rpc-testnet.sei-apis.com'; // Sei testnet

  const wallet = new PrivateKeyWallet(privateKey, rpcUrl);

  return {
    address: wallet.address,
    getBalance: () => wallet.getBalance(),
    signTransaction: (tx: any) => wallet.signTransaction(tx),
    sendTransaction: (tx: any) => wallet.sendTransaction(tx),
    getSigner: () => wallet.getSigner(),
    isConnected: true,
    walletType: 'Private Key (Test)'
  };
};