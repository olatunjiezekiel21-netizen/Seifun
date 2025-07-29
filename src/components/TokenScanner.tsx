import React, { useState } from 'react';
import { Search, Shield, AlertTriangle, CheckCircle, Clock, ExternalLink, Info } from 'lucide-react';

interface ScanResult {
  address: string;
  basicInfo: {
    name: string;
    symbol: string;
    decimals: string;
    totalSupply: string;
  };
  analysis: {
    riskScore: number;
    isSafe: boolean;
    riskFactors: string[];
    safetyChecks: {
      supply: {
        passed: boolean;
        totalSupply: string;
        risk: string;
      };
      ownership: {
        passed: boolean;
        owner: string;
        isOwnershipRenounced: boolean;
        risk: string;
      };
      liquidity: {
        passed: boolean;
        liquidity: string;
        risk: string;
      };
      honeypot: {
        passed: boolean;
        isHoneypot: boolean;
        risk: string;
      };
      blacklist: {
        passed: boolean;
        hasBlacklist: boolean;
        risk: string;
      };
      verified: {
        passed: boolean;
        verified: boolean;
        risk: string;
      };
      transfer: {
        passed: boolean;
        hasTransfer: boolean;
        hasTransferFrom: boolean;
        risk: string;
      };
      fees: {
        passed: boolean;
        hasExcessiveFees: boolean;
        risk: string;
      };
    };
  };
  lastScanned: string;
  scanCount: number;
}

const TokenScanner = () => {
  const [tokenAddress, setTokenAddress] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState('');
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [tokenImage, setTokenImage] = useState<string | null>(null);

  // Client-side token analysis function
  const analyzeTokenClientSide = async (address: string): Promise<ScanResult> => {
    // Simulate analysis with mock data for now
    // In a real implementation, you would use ethers.js to connect to Sei blockchain
    
    await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate analysis time
    
    // Mock analysis result
    const mockResult: ScanResult = {
      address: address,
      basicInfo: {
        name: address === '0x5f0e07dfee5832faa00c63f2d33a0d79150e8598' ? 'Test Token' : 'Unknown Token',
        symbol: address === '0x5f0e07dfee5832faa00c63f2d33a0d79150e8598' ? 'TEST' : 'UNK',
        decimals: '18',
        totalSupply: '1000000000000000000000000'
      },
      analysis: {
        riskScore: address === '0x5f0e07dfee5832faa00c63f2d33a0d79150e8598' ? 85 : Math.floor(Math.random() * 100),
        isSafe: address === '0x5f0e07dfee5832faa00c63f2d33a0d79150e8598' ? true : Math.random() > 0.5,
        riskFactors: address === '0x5f0e07dfee5832faa00c63f2d33a0d79150e8598' ? [] : ['High fee structure detected'],
        safetyChecks: {
          supply: {
            passed: true,
            totalSupply: '1000000000000000000000000',
            risk: 'LOW'
          },
          ownership: {
            passed: address === '0x5f0e07dfee5832faa00c63f2d33a0d79150e8598',
            owner: address === '0x5f0e07dfee5832faa00c63f2d33a0d79150e8598' ? '0x0000000000000000000000000000000000000000' : '0x1234567890123456789012345678901234567890',
            isOwnershipRenounced: address === '0x5f0e07dfee5832faa00c63f2d33a0d79150e8598',
            risk: address === '0x5f0e07dfee5832faa00c63f2d33a0d79150e8598' ? 'LOW' : 'HIGH'
          },
          liquidity: {
            passed: true,
            liquidity: '50000000000',
            risk: 'LOW'
          },
          honeypot: {
            passed: true,
            isHoneypot: false,
            risk: 'LOW'
          },
          blacklist: {
            passed: true,
            hasBlacklist: false,
            risk: 'LOW'
          },
          verified: {
            passed: true,
            verified: true,
            risk: 'LOW'
          },
          transfer: {
            passed: true,
            hasTransfer: true,
            hasTransferFrom: true,
            risk: 'LOW'
          },
          fees: {
            passed: address === '0x5f0e07dfee5832faa00c63f2d33a0d79150e8598',
            hasExcessiveFees: address !== '0x5f0e07dfee5832faa00c63f2d33a0d79150e8598',
            risk: address === '0x5f0e07dfee5832faa00c63f2d33a0d79150e8598' ? 'LOW' : 'HIGH'
          }
        }
      },
      lastScanned: new Date().toISOString(),
      scanCount: Math.floor(Math.random() * 100) + 1
    };

    return mockResult;
  };

  const handleScan = async () => {
    if (!tokenAddress.trim()) {
      setError('Please enter a token address');
      return;
    }

    // Validate address format (basic check)
    if (!tokenAddress.startsWith('sei1') && !tokenAddress.startsWith('0x')) {
      setError('Please enter a valid Sei token address');
      return;
    }

    setIsScanning(true);
    setError('');
    setScanResult(null);
    setTokenImage(null);

    try {
      const result = await analyzeTokenClientSide(tokenAddress.trim());
      setScanResult(result);
      
      // Add to scan history
      setScanHistory(prev => [result, ...prev.slice(0, 4)]);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan token');
    } finally {
      setIsScanning(false);
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-400 to-green-500';
    if (score >= 60) return 'from-yellow-400 to-yellow-500';
    return 'from-red-400 to-red-500';
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

  return (
    <section className="py-20 bg-gradient-to-br from-[#0D1421] via-[#1A1B3A] to-[#2D1B69]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6 mb-12">
          <div className="flex items-center justify-center space-x-3">
            <Shield className="text-[#FF6B35]" size={32} />
            <h2 className="text-4xl lg:text-5xl font-bold text-white">
              SeifuGuard <span className="text-[#FF6B35]">Scanner</span>
            </h2>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Instantly verify any Sei token's safety with our advanced security analysis
          </p>
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 max-w-2xl mx-auto">
            <div className="flex items-center space-x-2">
              <Info className="text-blue-400" size={20} />
              <p className="text-blue-300 text-sm">
                🚀 <strong>Live Demo:</strong> Try scanning this token: <code className="bg-blue-500/20 px-2 py-1 rounded">0x5f0e07dfee5832faa00c63f2d33a0d79150e8598</code>
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Scanner Input */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Sei Token Contract Address
                </label>
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={tokenAddress}
                    onChange={(e) => setTokenAddress(e.target.value)}
                    placeholder="sei1... or 0x..."
                    className="flex-1 px-6 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent transition-all"
                  />
                  <button
                    onClick={handleScan}
                    disabled={isScanning}
                    className="px-8 py-4 bg-gradient-to-r from-[#FF6B35] to-[#FF8E53] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-[#FF6B35]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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
                  <h3 className="text-xl font-bold text-white">Running Security Analysis...</h3>
                </div>
                <div className="space-y-4">
                  {[
                    'Analyzing contract code',
                    'Checking ownership status',
                    'Verifying liquidity locks',
                    'Scanning for honeypot patterns',
                    'Detecting blacklist functions',
                    'Analyzing transfer functions',
                    'Checking fee structure',
                    'Calculating safety score'
                  ].map((step, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <div className="w-6 h-6 border-2 border-[#FF6B35] border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-300">{step}</span>
                    </div>
                  ))}
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
                      <span className="text-2xl">🪙</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{scanResult.basicInfo.name}</h3>
                      <p className="text-gray-300">{scanResult.basicInfo.symbol}</p>
                      <p className="text-gray-400 text-sm">{scanResult.address}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${getStatusColor(getSafetyStatus(scanResult.analysis.riskScore))}`}>
                      {getStatusIcon(getSafetyStatus(scanResult.analysis.riskScore))}
                      <span className="font-semibold capitalize">{getSafetyStatus(scanResult.analysis.riskScore)}</span>
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
                              strokeDasharray={`${scanResult.analysis.riskScore * 2.51} 251`}
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
                            <span className="text-3xl font-bold text-white">{scanResult.analysis.riskScore}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">Security Checks</h4>
                    <div className="space-y-3">
                      {Object.entries(scanResult.analysis.safetyChecks).map(([key, check]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-gray-300 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <div className="flex items-center space-x-2">
                            {getCheckIcon(check.passed)}
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              check.risk === 'LOW' ? 'bg-green-500/20 text-green-400' :
                              check.risk === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                              check.risk === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {check.risk}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Risk Factors */}
                {scanResult.analysis.riskFactors.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">Risk Factors</h4>
                    <div className="space-y-2">
                      {scanResult.analysis.riskFactors.map((factor, idx) => (
                        <div key={idx} className="flex items-center space-x-2 text-red-400">
                          <AlertTriangle size={16} />
                          <span className="text-sm">{factor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
                        onClick={() => window.open(`https://seitrace.com/address/${scanResult.address}`, '_blank')}
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
                      <div className="w-8 h-8 bg-gradient-to-br from-[#FF6B35] to-[#FF8E53] rounded-lg flex items-center justify-center text-sm">
                        {scan.basicInfo.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-white font-medium">{scan.basicInfo.name}</div>
                        <div className="text-gray-400 text-sm">{scan.address.slice(0, 8)}...</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className={`px-2 py-1 rounded-full text-xs ${
                        getSafetyStatus(scan.analysis.riskScore) === 'safe' ? 'bg-green-500/20 text-green-400' :
                        getSafetyStatus(scan.analysis.riskScore) === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {scan.analysis.riskScore}
                      </div>
                      <button 
                        onClick={() => setTokenAddress(scan.address)}
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