import { useState, useEffect } from 'react';

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  isConnecting: boolean;
  error: string | null;
}

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: null,
    isConnecting: false,
    error: null
  });

  const connectWallet = async () => {
    setWalletState(prev => ({ ...prev, isConnecting: true, error: null }));
    
    try {
      // Check if window.sei is available (Sei wallet extension)
      if (typeof window !== 'undefined' && (window as any).sei) {
        const seiWallet = (window as any).sei;
        
        // Request connection
        const accounts = await seiWallet.request({
          method: 'sei_requestAccounts'
        });
        
        if (accounts && accounts.length > 0) {
          const address = accounts[0];
          
          // Get balance
          const balance = await seiWallet.request({
            method: 'sei_getBalance',
            params: [address]
          });
          
          setWalletState({
            isConnected: true,
            address,
            balance: balance ? (parseInt(balance) / 1e18).toFixed(4) : '0',
            isConnecting: false,
            error: null
          });
        }
      } else {
        throw new Error('Sei wallet not found. Please install Sei wallet extension.');
      }
    } catch (error) {
      setWalletState(prev => ({
        ...prev,
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Failed to connect wallet'
      }));
    }
  };

  const disconnectWallet = () => {
    setWalletState({
      isConnected: false,
      address: null,
      balance: null,
      isConnecting: false,
      error: null
    });
  };

  // Check if wallet is already connected on component mount
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && (window as any).sei) {
        try {
          const seiWallet = (window as any).sei;
          const accounts = await seiWallet.request({
            method: 'sei_accounts'
          });
          
          if (accounts && accounts.length > 0) {
            const address = accounts[0];
            const balance = await seiWallet.request({
              method: 'sei_getBalance',
              params: [address]
            });
            
            setWalletState({
              isConnected: true,
              address,
              balance: balance ? (parseInt(balance) / 1e18).toFixed(4) : '0',
              isConnecting: false,
              error: null
            });
          }
        } catch (error) {
          // Wallet not connected or available
          console.log('Wallet not connected:', error);
        }
      }
    };

    checkConnection();
  }, []);

  return {
    ...walletState,
    connectWallet,
    disconnectWallet
  };
};