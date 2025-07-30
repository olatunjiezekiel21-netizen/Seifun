import React, { useState } from 'react';
import { Search, Shield, AlertTriangle, CheckCircle, Clock, ExternalLink, Info, Wallet } from 'lucide-react';
import { TokenScanner as TokenScannerClass, TokenAnalysis } from '../utils/tokenScanner';
import { ethers } from 'ethers';

const TokenScanner = () => {
  const [tokenAddress, setTokenAddress] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<TokenAnalysis | null>(null);
  const [error, setError] = useState('');
  const [isWalletAddress, setIsWalletAddress] = useState(false);
  const [walletInfo, setWalletInfo] = useState<{address: string, balance: string} | null>(null);
  const [scanHistory, setScanHistory] = useState<TokenAnalysis[]>([]);
  const [scanProgress, setScanProgress] = useState<string[]>([]);
  const [isLoadingLogo, setIsLoadingLogo] = useState(false);

  const scanner = new TokenScannerClass();

  const handleScan = async () => {
    if (!tokenAddress.trim()) {
      setError('Please enter a token address');
      return;
    }

    // Enhanced address validation for universal token support
    const address = tokenAddress.trim();
    
    // Support both Sei native and EVM addresses
    if (!address.startsWith('0x')) {
      setError('Please enter a valid EVM address (42 characters starting with 0x)');
      return;
    }

    // Validate EVM address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      setError('Please enter a valid EVM address (42 characters starting with 0x)');
      return;
    }

    // Check for common mistakes
    if (address === '0x0000000000000000000000000000000000000000') {
      setError('Zero address is not a valid token address');
      return;
    }

    // Warn about potential issues but don't block scanning
    if (address.toLowerCase() === address || address.toUpperCase() === address) {
      console.warn('Address may not be checksummed, but proceeding with scan...');
    }

    setIsScanning(true);
    setError('');
    setScanResult(null);
    setIsWalletAddress(false);
    setWalletInfo(null);
    setScanProgress([]);

    const progressSteps = [
      'Connecting to Sei network...',
      'Checking address type...',
      'Analyzing address...'
    ];

    try {
      // Show initial progress
      for (let i = 0; i < progressSteps.length; i++) {
        setScanProgress(prev => [...prev, progressSteps[i]]);
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // First, check if it's a contract or wallet address
      const provider = scanner['provider']; // Access the provider from scanner
      const code = await provider.getCode(address);
      const isContract = code !== '0x';

      if (!isContract) {
        // This is a wallet address (EOA), not a token contract
        setScanProgress(prev => [...prev, 'Fetching wallet balance...']);
        
        try {
          const balance = await provider.getBalance(address);
          const balanceInSei = parseFloat(ethers.formatEther(balance)).toFixed(4);
          
          setIsWalletAddress(true);
          setWalletInfo({
            address: ethers.getAddress(address),
            balance: balanceInSei
          });
        } catch (balanceError) {
          setIsWalletAddress(true);
          setWalletInfo({
            address: ethers.getAddress(address),
            balance: '0.0000'
          });
        }
      } else {
        // This is a contract, proceed with token analysis
        const tokenProgressSteps = [
          'Fetching token information...',
          'Loading token logo...',
          'Analyzing contract code...',
          'Checking ownership status...',
          'Verifying liquidity locks...',
          'Scanning for honeypot patterns...',
          'Detecting blacklist functions...',
          'Analyzing transfer functions...',
          'Checking fee structure...',
          'Calculating safety score...'
        ];

        for (let i = 0; i < tokenProgressSteps.length; i++) {
          setScanProgress(prev => [...prev, tokenProgressSteps[i]]);
          
          // Set logo loading state when we reach the logo step
          if (tokenProgressSteps[i].includes('logo')) {
            setIsLoadingLogo(true);
          }
          
          if (i < tokenProgressSteps.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 400));
          }
        }

        const result = await scanner.analyzeToken(address);
        setIsLoadingLogo(false);
        setScanResult(result);
        
        // Add to scan history
        setScanHistory(prev => [result, ...prev.slice(0, 4)]);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to scan address';
      
      // Check if it's specifically about EOA
      if (errorMessage.includes('EOA') || errorMessage.includes('Externally Owned Account')) {
        setError('This appears to be a wallet address, not a token contract. Wallet addresses cannot be scanned for token information.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsScanning(false);
      setScanProgress([]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'danger': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'safe': return <CheckCircle className="text-green-600" size={20} />;
      case 'warning': return <AlertTriangle className="text-yellow-600" size={20} />;
      case 'danger': return <AlertTriangle className="text-red-600" size={20} />;
      default: return <Shield className="text-gray-600" size={20} />;
    }
  };

  const getSafetyStatus = (score: number) => {
    if (score >= 80) return 'safe';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  const formatNumber = (num: string) => {
    const number = parseFloat(num);
    if (number >= 1e9) return (number / 1e9).toFixed(2) + 'B';
    if (number >= 1e6) return (number / 1e6).toFixed(2) + 'M';
    if (number >= 1e3) return (number / 1e3).toFixed(2) + 'K';
    return number.toFixed(2);
  };

  const getCheckIcon = (passed: boolean) => {
    return passed ? 
      <CheckCircle className="text-green-500" size={16} /> : 
      <AlertTriangle className="text-red-500" size={16} />;
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'bg-green-500/20 text-green-400';
      case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-400';
      case 'HIGH': return 'bg-red-500/20 text-red-400';
      case 'CRITICAL': return 'bg-red-600/30 text-red-300';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <section className="py-12 sm:py-20 bg-gradient-to-br from-[#0D1421] via-[#1A1B3A] to-[#2D1B69]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 sm:space-y-6 mb-8 sm:mb-12">
          <div className="flex items-center justify-center space-x-3">
            <Shield className="text-[#FF6B35]" size={28} />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
              SeifuGuard <span className="text-[#FF6B35]">Scanner</span>
            </h2>
          </div>
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto px-4">
            Instantly verify any Sei token's safety with our advanced blockchain analysis
          </p>
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 sm:p-4 max-w-2xl mx-auto">
            <div className="flex items-start sm:items-center space-x-2">
              <Info className="text-blue-400 mt-0.5 sm:mt-0 flex-shrink-0" size={18} />
              <p className="text-blue-300 text-xs sm:text-sm text-left">
                🌐 <strong>Universal Sei Token Scanner:</strong> Works with ANY token on Sei network!
              </p>
            </div>
            <div className="mt-3 text-xs text-blue-200">
              <p><strong>Supported:</strong> ERC20, ERC721, ERC1155, Custom tokens, Factory contracts</p>
              <p><strong>Try these examples:</strong></p>
              <div className="mt-2 space-y-1">
                <p className="break-all">• Token Contract: <code className="bg-blue-500/20 px-1 rounded">0x5f0e07dfee5832faa00c63f2d33a0d79150e8598</code></p>
                <p className="break-all">• Wallet Address: <code className="bg-blue-500/20 px-1 rounded">0x742d35Cc6635C0532925a3b8D41c4e9E4532D3eE</code> (will show wallet info)</p>
                <p className="text-blue-300">💡 <strong>Note:</strong> Wallet addresses show balance info, token contracts show safety analysis</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Scanner Input */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-8 border border-white/20 mb-6 sm:mb-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Sei Token Contract Address
                </label>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                  <input
                    type="text"
                    value={tokenAddress}
                    onChange={(e) => setTokenAddress(e.target.value)}
                    placeholder="0x... (Token contract address)"
                    className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-all text-sm sm:text-base"
                  />
                  <button
                    onClick={handleScan}
                    disabled={isScanning}
                    className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#FF6B35] to-[#FF8E53] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-[#FF6B35]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 whitespace-nowrap"
                  >
                    {isScanning ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Scanning...</span>
                      </>
                    ) : (
                      <>
                        <Search size={20} />
                        <span>Scan Token</span>
                      </>
                    )}
                  </button>
                </div>
                {error && (
                  <p className="text-red-400 text-sm mt-2">{error}</p>
                )}
              </div>
            </div>
          </div>

          {/* Scanning Progress */}
          {isScanning && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Clock className="text-[#FF6B35] animate-spin" size={24} />
                  <h3 className="text-xl font-bold text-white">Running Blockchain Analysis...</h3>
                </div>
                <div className="space-y-4">
                  {scanProgress.map((step, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <div className="w-6 h-6 border-2 border-[#FF6B35] border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-300">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Wallet Address Results */}
          {isWalletAddress && walletInfo && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                      <Wallet className="text-white" size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Wallet Address</h3>
                      <p className="text-gray-300">Externally Owned Account (EOA)</p>
                      <p className="text-gray-400 text-sm font-mono">{walletInfo.address}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-500/20 text-blue-300">
                      <Wallet size={20} />
                      <span className="font-semibold">Wallet</span>
                    </div>
                  </div>
                </div>

                {/* Wallet Information */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">Address Information</h4>
                    <div className="bg-white/5 rounded-xl p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Address Type:</span>
                          <span className="text-white font-medium">Externally Owned Account</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">SEI Balance:</span>
                          <span className="text-white font-medium">{walletInfo.balance} SEI</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Contract Code:</span>
                          <span className="text-gray-400">None (Wallet Address)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">What This Means</h4>
                    <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                      <div className="space-y-3 text-sm">
                        <p className="text-blue-200">
                          <strong>This is a wallet address, not a token contract.</strong>
                        </p>
                        <p className="text-gray-300">
                          • Wallet addresses hold SEI and tokens but don't have smart contract code
                        </p>
                        <p className="text-gray-300">
                          • Cannot be analyzed for token safety features
                        </p>
                        <p className="text-gray-300">
                          • To scan a token, you need the token's contract address
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-6 border-t border-white/20">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      onClick={() => window.open(`https://seitrace.com/address/${walletInfo.address}`, '_blank')}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                    >
                      <ExternalLink size={16} />
                      <span>View on Seitrace</span>
                    </button>
                    <button 
                      onClick={() => {
                        setTokenAddress('');
                        setIsWalletAddress(false);
                        setWalletInfo(null);
                      }}
                      className="flex-1 border border-blue-500 text-blue-400 py-3 px-4 rounded-xl font-semibold hover:bg-blue-500/10 transition-all"
                    >
                      Scan Another Address
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Scan Results */}
          {scanResult && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#FF6B35] to-[#FF8E53] rounded-2xl flex items-center justify-center overflow-hidden">
                      {scanResult.basicInfo.logoUrl ? (
                        <img
                          src={scanResult.basicInfo.logoUrl}
                          alt={scanResult.basicInfo.symbol}
                          className="w-16 h-16 object-contain rounded-2xl"
                          onError={(e) => { 
                            const target = e.currentTarget;
                            const parent = target.parentElement;
                            if (parent) {
                              // Hide the image and show empty space
                              target.style.display = 'none';
                              parent.style.background = 'transparent';
                              parent.style.border = '2px dashed rgba(255, 255, 255, 0.3)';
                            }
                          }}
                          onLoad={(e) => {
                            // Ensure proper display when image loads successfully
                            const target = e.currentTarget;
                            const parent = target.parentElement;
                            if (parent) {
                              parent.style.background = '';
                              parent.style.border = '';
                            }
                          }}
                        />
                      ) : (
                        // Show empty space with dashed border when no logo
                        <div className="w-16 h-16 border-2 border-dashed border-white/30 rounded-2xl bg-transparent"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{scanResult.basicInfo.name}</h3>
                      <p className="text-gray-300">{scanResult.basicInfo.symbol}</p>
                      <p className="text-gray-400 text-sm">{scanResult.basicInfo.address}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${getStatusColor(getSafetyStatus(scanResult.riskScore))}`}>
                      {getStatusIcon(getSafetyStatus(scanResult.riskScore))}
                      <span className="font-semibold capitalize">{getSafetyStatus(scanResult.riskScore)}</span>
                    </div>
                  </div>
                </div>

                {/* Score Display */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">SeifuScore</h4>
                    <div className="relative">
                      <div className="flex items-center justify-center">
                        <div className="relative w-32 h-32">
                          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              stroke="rgba(255,255,255,0.1)"
                              strokeWidth="8"
                              fill="none"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              stroke="url(#scoreGradient)"
                              strokeWidth="8"
                              fill="none"
                              strokeLinecap="round"
                              strokeDasharray={`${scanResult.riskScore * 2.51} 251`}
                              className="transition-all duration-1000"
                            />
                            <defs>
                              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#FF6B35" />
                                <stop offset="100%" stopColor="#FF8E53" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl font-bold text-white">{scanResult.riskScore}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">Security Checks</h4>
                    <div className="space-y-3">
                      {Object.entries(scanResult.safetyChecks).map(([key, check]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-gray-300 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <div className="flex items-center space-x-2">
                            {getCheckIcon(check.passed)}
                            <span className={`text-xs px-2 py-1 rounded-full ${getRiskColor(check.risk)}`}>
                              {check.risk}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Risk Factors */}
                {scanResult.riskFactors.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">Risk Factors</h4>
                    <div className="space-y-2">
                      {scanResult.riskFactors.map((factor, idx) => (
                        <div key={idx} className="flex items-center space-x-2 text-red-400">
                          <AlertTriangle size={16} />
                          <span className="text-sm">{factor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Detailed Analysis */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">Detailed Analysis</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {Object.entries(scanResult.safetyChecks).map(([key, check]) => (
                      <div key={key} className="bg-white/5 rounded-xl p-4 relative">
                        {/* Coming Soon Badge for specific features */}
                        {(key === 'liquidity' || key === 'verified') && (
                          <div className="absolute top-2 right-2 bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded-full border border-blue-500/30">
                            Coming Soon
                          </div>
                        )}
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-white capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </h5>
                          <span className={`text-xs px-2 py-1 rounded-full ${getRiskColor(check.risk)}`}>
                            {check.risk}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300">{check.details}</p>
                        {check.error && (
                          <p className="text-xs text-red-400 mt-1">Error: {check.error}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Token Details */}
                <div className="grid md:grid-cols-2 gap-8 pt-6 border-t border-white/20">
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-white">Token Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Total Supply:</span>
                        <span className="text-white font-medium">{formatNumber(scanResult.basicInfo.totalSupply)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Decimals:</span>
                        <span className="text-white font-medium">{scanResult.basicInfo.decimals}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Last Scanned:</span>
                        <span className="text-white font-medium">
                          {new Date(scanResult.lastScanned).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Scan Count:</span>
                        <span className="text-white font-medium">{scanResult.scanCount}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">Actions</h4>
                    <div className="space-y-3">
                      <button 
                        onClick={() => window.open(`https://seitrace.com/address/${scanResult.basicInfo.address}`, '_blank')}
                        className="w-full bg-gradient-to-r from-[#FF6B35] to-[#FF8E53] text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                      >
                        <ExternalLink size={16} />
                        <span>View on Seitrace</span>
                      </button>
                      <button className="w-full border border-[#FF6B35] text-[#FF6B35] py-3 px-4 rounded-xl font-semibold hover:bg-[#FF6B35] hover:text-white transition-all">
                        Report Token
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Scan History */}
          {scanHistory.length > 0 && (
            <div className="mt-8 bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h4 className="text-lg font-semibold text-white mb-4">Recent Scans</h4>
              <div className="space-y-3">
                {scanHistory.map((scan, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#FF6B35] to-[#FF8E53] rounded-lg flex items-center justify-center text-sm overflow-hidden">
                        {scan.basicInfo.logoUrl ? (
                          <img
                            src={scan.basicInfo.logoUrl}
                            alt={scan.basicInfo.symbol}
                            className="w-8 h-8 object-contain rounded-lg"
                            onError={(e) => { 
                              const target = e.currentTarget;
                              const parent = target.parentElement;
                              if (parent) {
                                target.style.display = 'none';
                                parent.style.background = 'transparent';
                                parent.style.border = '1px dashed rgba(255, 255, 255, 0.3)';
                              }
                            }}
                            onLoad={(e) => {
                              const target = e.currentTarget;
                              const parent = target.parentElement;
                              if (parent) {
                                parent.style.background = '';
                                parent.style.border = '';
                              }
                            }}
                          />
                        ) : (
                          // Show empty space with dashed border when no logo
                          <div className="w-8 h-8 border border-dashed border-white/30 rounded-lg bg-transparent"></div>
                        )}
                      </div>
                      <div>
                        <div className="text-white font-medium">{scan.basicInfo.name}</div>
                        <div className="text-gray-400 text-sm">{scan.basicInfo.address.slice(0, 8)}...</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className={`px-2 py-1 rounded-full text-xs ${
                        getSafetyStatus(scan.riskScore) === 'safe' ? 'bg-green-500/20 text-green-400' :
                        getSafetyStatus(scan.riskScore) === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {scan.riskScore}
                      </div>
                      <button 
                        onClick={() => setTokenAddress(scan.basicInfo.address)}
                        className="text-[#FF6B35] hover:text-[#FF8E53] transition-colors"
                      >
                        <Search size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TokenScanner;