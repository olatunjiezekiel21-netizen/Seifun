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
      // Check if any Sei wallet is available
      if (typeof window !== 'undefined') {
        let seiWallet = null;
        let walletType = '';

        // Try different wallet detection methods
        if ((window as any).sei) {
          seiWallet = (window as any).sei;
          walletType = 'Sei Wallet Extension';
        } else if ((window as any).compass) {
          seiWallet = (window as any).compass;
          walletType = 'Compass Wallet';
        } else if ((window as any).keplr) {
          // Keplr with Sei support
          const keplr = (window as any).keplr;
          try {
            await keplr.enable('sei-devnet-3');
            seiWallet = keplr;
            walletType = 'Keplr Wallet';
          } catch (error) {
            console.log('Keplr Sei chain not available:', error);
          }
        }

        if (!seiWallet) {
          throw new Error('No Sei-compatible wallet found. Please install Sei Wallet, Compass, or Keplr with Sei support.');
        }

        let accounts = [];
        let address = '';

        // Handle different wallet APIs
        if (walletType === 'Sei Wallet Extension') {
          accounts = await seiWallet.request({
            method: 'sei_requestAccounts'
          });
          address = accounts[0];
        } else if (walletType === 'Compass Wallet') {
          accounts = await seiWallet.request({
            method: 'sei_requestAccounts'
          });
          address = accounts[0];
        } else if (walletType === 'Keplr Wallet') {
          const key = await seiWallet.getKey('sei-devnet-3');
          address = key.bech32Address;
          // Convert to EVM format if needed
          if (!address.startsWith('0x')) {
            // For now, use the bech32 address
            address = key.bech32Address;
          }
        }

        if (!address) {
          throw new Error('No wallet address found. Please make sure your wallet is unlocked.');
        }

        // Get balance - try different methods
        let balance = '0';
        try {
          if (walletType === 'Keplr Wallet') {
            // For Keplr, we might need to use a different approach
            balance = '0.0000'; // Placeholder for now
          } else {
            const balanceResult = await seiWallet.request({
              method: 'sei_getBalance',
              params: [address]
            });
            balance = balanceResult ? (parseInt(balanceResult) / 1e18).toFixed(4) : '0.0000';
          }
        } catch (balanceError) {
          console.log('Could not fetch balance:', balanceError);
          balance = '0.0000';
        }

        setWalletState({
          isConnected: true,
          address,
          balance,
          isConnecting: false,
          error: null
        });

        console.log(`✅ Connected to ${walletType}:`, address);

      } else {
        throw new Error('Window object not available. Please try again.');
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
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
    console.log('👋 Wallet disconnected');
  };

  // Check if wallet is already connected on component mount
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== 'undefined') {
        try {
          // Check for existing connections
          let seiWallet = null;
          let walletType = '';

          if ((window as any).sei) {
            seiWallet = (window as any).sei;
            walletType = 'Sei Wallet Extension';
          } else if ((window as any).compass) {
            seiWallet = (window as any).compass;
            walletType = 'Compass Wallet';
          }

          if (seiWallet) {
            const accounts = await seiWallet.request({
              method: 'sei_accounts'
            });
            
            if (accounts && accounts.length > 0) {
              const address = accounts[0];
              let balance = '0.0000';
              
              try {
                const balanceResult = await seiWallet.request({
                  method: 'sei_getBalance',
                  params: [address]
                });
                balance = balanceResult ? (parseInt(balanceResult) / 1e18).toFixed(4) : '0.0000';
              } catch (balanceError) {
                console.log('Could not fetch balance on reconnect:', balanceError);
              }
              
              setWalletState({
                isConnected: true,
                address,
                balance,
                isConnecting: false,
                error: null
              });

              console.log(`🔄 Reconnected to ${walletType}:`, address);
            }
          }
        } catch (error) {
          // Wallet not connected or available
          console.log('No existing wallet connection found:', error);
        }
      }
    };

    // Add a small delay to ensure window is fully loaded
    const timer = setTimeout(checkConnection, 500);
    return () => clearTimeout(timer);
  }, []);

  return {
    ...walletState,
    connectWallet,
    disconnectWallet
  };
};