import React, { useState, useEffect } from 'react';
import { useUnifiedWallet } from '../utils/unifiedWalletConnection';
import { 
  Wallet, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  LogOut, 
  AlertTriangle,
  Info,
  Zap
} from 'lucide-react';

const WalletConnectionTest: React.FC = () => {
  const {
    isConnected,
    address,
    balance,
    isConnecting,
    error,
    walletType,
    chainId,
    availableWallets,
    connectWallet,
    disconnectWallet,
    refreshBalance,
    clearError,
    switchWallet
  } = useUnifiedWallet();

  const [testResults, setTestResults] = useState<{[key: string]: 'pass' | 'fail' | 'pending'}>({});
  const [selectedWallet, setSelectedWallet] = useState<string>('');

  // Run tests when wallet state changes
  useEffect(() => {
    runTests();
  }, [isConnected, address, balance, walletType, availableWallets]);

  const runTests = () => {
    const results: {[key: string]: 'pass' | 'fail' | 'pending'} = {};

    // Test 1: Wallet Detection
    results['wallet_detection'] = availableWallets.length > 0 ? 'pass' : 'fail';

    // Test 2: Connection State
    if (isConnected && address) {
      results['connection_state'] = 'pass';
    } else if (!isConnected && !address) {
      results['connection_state'] = 'pass';
    } else {
      results['connection_state'] = 'fail';
    }

    // Test 3: Address Format
    if (address) {
      const isValidAddress = address.startsWith('0x') && address.length === 42;
      results['address_format'] = isValidAddress ? 'pass' : 'fail';
    } else {
      results['address_format'] = 'pending';
    }

    // Test 4: Balance Fetch
    if (isConnected && balance !== null) {
      results['balance_fetch'] = 'pass';
    } else if (!isConnected) {
      results['balance_fetch'] = 'pending';
    } else {
      results['balance_fetch'] = 'fail';
    }

    // Test 5: Wallet Type
    if (isConnected && walletType) {
      results['wallet_type'] = 'pass';
    } else if (!isConnected) {
      results['wallet_type'] = 'pending';
    } else {
      results['wallet_type'] = 'fail';
    }

    // Test 6: Chain ID
    if (isConnected && chainId) {
      results['chain_id'] = 'pass';
    } else if (!isConnected) {
      results['chain_id'] = 'pending';
    } else {
      results['chain_id'] = 'fail';
    }

    setTestResults(results);
  };

  const handleConnect = async (walletId?: string) => {
    try {
      await connectWallet(walletId);
    } catch (error) {
      console.error('Connection test failed:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
    } catch (error) {
      console.error('Disconnection test failed:', error);
    }
  };

  const handleRefreshBalance = async () => {
    try {
      await refreshBalance();
    } catch (error) {
      console.error('Balance refresh test failed:', error);
    }
  };

  const handleSwitchWallet = async () => {
    if (selectedWallet) {
      try {
        await switchWallet(selectedWallet);
      } catch (error) {
        console.error('Wallet switch test failed:', error);
      }
    }
  };

  const getTestIcon = (result: 'pass' | 'fail' | 'pending') => {
    switch (result) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Info className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getTestColor = (result: 'pass' | 'fail' | 'pending') => {
    switch (result) {
      case 'pass':
        return 'border-green-500 bg-green-50';
      case 'fail':
        return 'border-red-500 bg-red-50';
      case 'pending':
        return 'border-yellow-500 bg-yellow-50';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Zap className="w-8 h-8 text-blue-500" />
          <h1 className="text-2xl font-bold text-gray-900">Wallet Connection Test Suite</h1>
        </div>

        {/* Connection Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Connection Status</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Connected:</span>
                <span className={`font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {isConnected ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Address:</span>
                <span className="font-mono text-sm text-gray-800">
                  {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'None'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Balance:</span>
                <span className="font-medium text-gray-800">
                  {balance ? `${balance} SEI` : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Wallet Type:</span>
                <span className="font-medium text-gray-800">
                  {walletType || 'None'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Chain ID:</span>
                <span className="font-medium text-gray-800">
                  {chainId || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Available Wallets</h2>
            <div className="space-y-2">
              {availableWallets.length > 0 ? (
                availableWallets.map((wallet) => (
                  <div key={wallet.id} className="flex items-center justify-between p-2 bg-white rounded border">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {wallet.name.charAt(0)}
                        </span>
                      </div>
                      <span className="font-medium text-gray-800">{wallet.name}</span>
                    </div>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-center py-4">
                  No wallets detected
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-red-800 font-medium mb-1">Connection Error</h3>
                <p className="text-red-700 text-sm whitespace-pre-line">{error}</p>
                <button
                  onClick={clearError}
                  className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Clear Error
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Test Results */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Test Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(testResults).map(([test, result]) => (
              <div key={test} className={`border-2 rounded-lg p-3 ${getTestColor(result)}`}>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800 capitalize">
                    {test.replace('_', ' ')}
                  </span>
                  {getTestIcon(result)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {!isConnected ? (
            <>
              <button
                onClick={() => handleConnect()}
                disabled={isConnecting || availableWallets.length === 0}
                className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Wallet className="w-4 h-4" />
                <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
              </button>
              
              {availableWallets.map((wallet) => (
                <button
                  key={wallet.id}
                  onClick={() => handleConnect(wallet.id)}
                  disabled={isConnecting}
                  className="flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <span>Connect {wallet.name}</span>
                </button>
              ))}
            </>
          ) : (
            <>
              <button
                onClick={handleDisconnect}
                className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Disconnect</span>
              </button>

              <button
                onClick={handleRefreshBalance}
                className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh Balance</span>
              </button>

              <div className="flex space-x-2">
                <select
                  value={selectedWallet}
                  onChange={(e) => setSelectedWallet(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Select wallet...</option>
                  {availableWallets.filter(w => w.id !== walletType?.toLowerCase()).map((wallet) => (
                    <option key={wallet.id} value={wallet.id}>
                      {wallet.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleSwitchWallet}
                  disabled={!selectedWallet}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Switch
                </button>
              </div>
            </>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-blue-800 font-medium mb-2">Testing Instructions</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Install wallet extensions (Sei, Compass, Keplr, MetaMask, or Fin)</li>
            <li>• Click "Connect Wallet" to test the connection</li>
            <li>• Verify all test results show green checkmarks</li>
            <li>• Test disconnect and reconnect functionality</li>
            <li>• Try switching between different wallet types</li>
            <li>• Check balance refresh functionality</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WalletConnectionTest;