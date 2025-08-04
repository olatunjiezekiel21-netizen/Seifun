import React, { useState } from 'react';
import { 
  Search, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Wallet,
  RefreshCw,
  ExternalLink,
  Info
} from 'lucide-react';

// Ensure correct import paths for build
import { SeiTokenRegistry } from '../utils/seiTokenRegistry';
import { TokenScanner } from '../utils/tokenScanner';
import { useReownWallet } from '../utils/reownWalletConnection';

const SafeChecker = () => {
  const [tokenAddress, setTokenAddress] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState<string[]>([]);
  
  // Wallet connection for enhanced features
  const {
    isConnected,
    address,
    balance,
    isConnecting,
    connectWallet,
    disconnectWallet,
    walletType
  } = useReownWallet();

  // Initialize scanner and registry
  const tokenScanner = new TokenScanner();
  const seiRegistry = new SeiTokenRegistry(false); // Use mainnet

  const scanToken = async () => {
    if (!tokenAddress.trim()) return;
    
    setIsScanning(true);
    setScanResult(null);
    setError(null);
    setScanProgress([]);

    const progressSteps = [
      'Validating token address...',
      'Connecting to Sei network...',
      'Fetching token information...',
      'Analyzing contract security...',
      'Checking for honeypot patterns...',
      'Evaluating liquidity safety...',
      'Scanning holder distribution...',
      'Generating safety report...'
    ];

    try {
      // Show progress updates
      for (let i = 0; i < progressSteps.length; i++) {
        setScanProgress(prev => [...prev, progressSteps[i]]);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Use the TokenScanner class for comprehensive analysis
      const analysis = await tokenScanner.analyzeToken(tokenAddress);
      
      if (!analysis) {
        throw new Error('Failed to analyze token - invalid address or network error');
      }

      // Get additional registry info if available
      let registryInfo = null;
      try {
        registryInfo = await seiRegistry.getTokenInfo(tokenAddress);
      } catch (e) {
        console.log('Token not found in registry, using scan data only');
      }

      // Compose comprehensive scan result
      const scanResult = {
        // Basic token info
        address: tokenAddress,
        name: registryInfo?.name || analysis.basicInfo.name || 'Unknown Token',
        symbol: registryInfo?.symbol || analysis.basicInfo.symbol || 'UNKNOWN',
        decimals: analysis.basicInfo.decimals,
        totalSupply: analysis.basicInfo.totalSupply,
        verified: registryInfo?.verified || analysis.safetyChecks.verified.isVerified || false,
        
        // Safety analysis
        isHoneypot: analysis.safetyChecks.honeypot.isHoneypot || false,
        isVerified: analysis.safetyChecks.verified.isVerified || false,
        riskLevel: analysis.isSafe ? 'LOW' : (analysis.riskScore > 70 ? 'HIGH' : 'MEDIUM'),
        securityScore: Math.max(0, 100 - analysis.riskScore),
        
        // Detailed safety checks
        safetyChecks: analysis.safetyChecks,
        riskFactors: analysis.riskFactors,
        riskScore: analysis.riskScore,
        
        // Additional details
        details: {
          owner: analysis.safetyChecks.ownership.owner || 'Unknown',
          isRenounced: analysis.safetyChecks.ownership.isRenounced || false,
          liquidityAmount: analysis.safetyChecks.liquidity.liquidityAmount || 'Unknown',
          holderCount: analysis.safetyChecks.holderDistribution.holderCount || 0,
          topHolderPercentage: analysis.safetyChecks.holderDistribution.topHolderPercentage || 0,
          buyTax: analysis.safetyChecks.fees.buyTax || 0,
          sellTax: analysis.safetyChecks.fees.sellTax || 0,
        },
        
        // Warnings
        warnings: analysis.riskFactors,
        
        // Metadata
        lastScanned: new Date().toISOString(),
        scanCount: 1,
        walletConnected: isConnected,
        scannedBy: address || 'Anonymous'
      };

      setScanResult(scanResult);

      // Update recent scans with better data
      setRecentScans(prev => [
        {
          address: tokenAddress.slice(0, 8) + '...' + tokenAddress.slice(-4),
          name: scanResult.name,
          symbol: scanResult.symbol,
          status: scanResult.isHoneypot ? 'dangerous' : (scanResult.riskLevel === 'HIGH' ? 'warning' : 'safe'),
          timestamp: 'Just now',
          risk: scanResult.riskLevel,
          securityScore: scanResult.securityScore,
          riskFactors: analysis.riskFactors.length
        },
        ...prev.slice(0, 4)
      ]);

      console.log('✅ Token scan completed:', scanResult);
      
    } catch (err: any) {
      console.error('❌ Token scan failed:', err);
      setError('Failed to scan token: ' + (err?.message || err));
    } finally {
      setIsScanning(false);
      setScanProgress([]);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'safe':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'dangerous':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'HIGH':
        return 'text-red-500 bg-red-500/10';
      case 'MEDIUM':
        return 'text-yellow-500 bg-yellow-500/10';
      case 'LOW':
        return 'text-green-500 bg-green-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className="app-bg-primary min-h-screen">
      {/* Header */}
      <div className="app-bg-secondary border-b app-border">
        <div className="app-container py-8">
          <h1 className="app-heading-xl app-text-primary mb-4">
            SafeChecker
          </h1>
          <p className="app-text-lg max-w-3xl">
            Advanced token security scanner. Check for honeypots, verify contracts, and analyze risk factors before investing.
          </p>
        </div>
      </div>

      <div className="app-container py-8">
        {/* Wallet Connection Status */}
        <div className="app-card p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-blue-500" />
              <div>
                <h3 className="app-text-primary font-medium">Enhanced Security Scanning</h3>
                <p className="app-text-muted text-sm">
                  {isConnected 
                    ? `Connected with ${walletType || 'wallet'} • Enhanced features enabled`
                    : 'Connect wallet for advanced security features and personalized insights'
                  }
                </p>
              </div>
            </div>
            {!isConnected ? (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="app-btn app-btn-primary"
              >
                <Wallet className="w-4 h-4 mr-2" />
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="app-text-primary text-sm font-medium">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
                <button
                  onClick={disconnectWallet}
                  className="app-btn app-btn-secondary text-xs"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Scanner Input */}
        <div className="app-card p-8 mb-8">
          <h2 className="app-heading-md mb-6">Token Scanner</h2>
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Enter token contract address (0x...)..."
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                className="app-input"
              />
            </div>
            <button
              onClick={scanToken}
              disabled={isScanning || !tokenAddress.trim()}
              className="app-btn app-btn-primary"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Scan Token
                </>
              )}
            </button>
          </div>
          
          {/* Progress Indicator */}
          {isScanning && scanProgress.length > 0 && (
            <div className="mt-6 p-4 app-bg-tertiary rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                <span className="app-text-primary font-medium">Scanning Progress</span>
              </div>
              <div className="space-y-2">
                {scanProgress.map((step, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                    <span className="app-text-muted text-sm">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <span className="text-red-500 text-sm">{error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Scan Results */}
        {scanResult && (
          <div className="app-card p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="app-heading-md">Scan Results</h2>
              <div className="flex items-center space-x-2">
                {getStatusIcon(scanResult.isHoneypot ? 'dangerous' : 'safe')}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(scanResult.riskLevel)}`}>
                  {scanResult.riskLevel} RISK
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Token Info */}
              <div>
                <h3 className="app-heading-md mb-4">Token Information</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 app-bg-tertiary rounded-lg">
                    <span className="app-text-muted">Name</span>
                    <div className="flex items-center space-x-2">
                      <span className="app-text-primary font-medium">{scanResult.name}</span>
                      {scanResult.verified && (
                        <CheckCircle className="w-4 h-4 text-green-500" title="Verified Token" />
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 app-bg-tertiary rounded-lg">
                    <span className="app-text-muted">Symbol</span>
                    <span className="app-text-primary font-medium">{scanResult.symbol}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 app-bg-tertiary rounded-lg">
                    <span className="app-text-muted">Address</span>
                    <div className="flex items-center space-x-2">
                      <span className="app-text-primary font-mono text-sm">{scanResult.address}</span>
                      <button
                        onClick={() => window.open(`https://seitrace.com/address/${scanResult.address}`, '_blank')}
                        className="text-blue-500 hover:text-blue-600"
                        title="View on Explorer"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 app-bg-tertiary rounded-lg">
                    <span className="app-text-muted">Security Score</span>
                    <div className="flex items-center space-x-2">
                      <span className="app-text-primary font-medium">{scanResult.securityScore}/100</span>
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all ${
                            scanResult.securityScore >= 80 ? 'bg-green-500' :
                            scanResult.securityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${scanResult.securityScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  {scanResult.totalSupply && (
                    <div className="flex justify-between items-center p-3 app-bg-tertiary rounded-lg">
                      <span className="app-text-muted">Total Supply</span>
                      <span className="app-text-primary font-medium">
                        {parseFloat(scanResult.totalSupply).toLocaleString()} {scanResult.symbol}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Security Analysis */}
              <div>
                <h3 className="app-heading-md mb-4">Security Analysis</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 app-bg-tertiary rounded-lg">
                    <div className="flex items-center space-x-2">
                      {scanResult.isHoneypot ? (
                        <XCircle className="w-5 h-5 text-red-500" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                      <span className="app-text-primary">Honeypot Detection</span>
                    </div>
                    <span className={scanResult.isHoneypot ? 'text-red-500' : 'text-green-500'}>
                      {scanResult.isHoneypot ? 'DANGEROUS' : 'SAFE'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 app-bg-tertiary rounded-lg">
                    <div className="flex items-center space-x-2">
                      {scanResult.isVerified ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      )}
                      <span className="app-text-primary">Contract Verification</span>
                    </div>
                    <span className={scanResult.isVerified ? 'text-green-500' : 'text-yellow-500'}>
                      {scanResult.isVerified ? 'VERIFIED' : 'UNVERIFIED'}
                    </span>
                  </div>
                  
                  {/* Additional Security Checks */}
                  {scanResult.safetyChecks && (
                    <>
                      <div className="flex items-center justify-between p-3 app-bg-tertiary rounded-lg">
                        <div className="flex items-center space-x-2">
                          {scanResult.safetyChecks.ownership?.isRenounced ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-yellow-500" />
                          )}
                          <span className="app-text-primary">Ownership</span>
                        </div>
                        <span className={scanResult.safetyChecks.ownership?.isRenounced ? 'text-green-500' : 'text-yellow-500'}>
                          {scanResult.safetyChecks.ownership?.isRenounced ? 'RENOUNCED' : 'OWNED'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 app-bg-tertiary rounded-lg">
                        <div className="flex items-center space-x-2">
                          {scanResult.safetyChecks.liquidity?.passed ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                          <span className="app-text-primary">Liquidity</span>
                        </div>
                        <span className={scanResult.safetyChecks.liquidity?.passed ? 'text-green-500' : 'text-red-500'}>
                          {scanResult.safetyChecks.liquidity?.passed ? 'SUFFICIENT' : 'LOW'}
                        </span>
                      </div>
                      
                      {scanResult.safetyChecks.fees && (
                        <div className="flex items-center justify-between p-3 app-bg-tertiary rounded-lg">
                          <div className="flex items-center space-x-2">
                            {scanResult.safetyChecks.fees.hasExcessiveFees ? (
                              <XCircle className="w-5 h-5 text-red-500" />
                            ) : (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            )}
                            <span className="app-text-primary">Trading Fees</span>
                          </div>
                          <span className={scanResult.safetyChecks.fees.hasExcessiveFees ? 'text-red-500' : 'text-green-500'}>
                            {scanResult.safetyChecks.fees.buyTax || 0}% / {scanResult.safetyChecks.fees.sellTax || 0}%
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Warnings */}
                {scanResult.warnings && scanResult.warnings.length > 0 && (
                  <div className="mt-6">
                    <h4 className="app-text-primary font-medium mb-3">Warnings</h4>
                    <div className="space-y-2">
                      {scanResult.warnings.map((warning: string, index: number) => (
                        <div key={index} className="flex items-start space-x-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                          <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span className="app-text-primary text-sm">{warning}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Token Details */}
            {scanResult.details && (
              <div className="mt-8">
                <h3 className="app-heading-md mb-4">Token Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {Object.entries(scanResult.details).map(([key, value]) => (
                    <div key={key} className="p-3 app-bg-tertiary rounded-lg text-center">
                      <div className="app-text-muted text-xs mb-1">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</div>
                      <div className="app-text-primary font-medium">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recent Scans */}
        <div className="app-card p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="app-heading-md">Recent Scans</h2>
            {recentScans.length > 0 && (
              <button
                onClick={() => setRecentScans([])}
                className="app-btn app-btn-secondary text-sm"
              >
                Clear History
              </button>
            )}
          </div>
          
          {recentScans.length === 0 ? (
            <div className="text-center py-8 app-text-muted">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No recent scans. Start by scanning a token above.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentScans.map((scan, index) => (
                <div key={index} className="flex items-center justify-between p-4 app-bg-tertiary rounded-lg hover:app-bg-secondary transition-colors">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(scan.status)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="app-text-primary font-medium">{scan.name}</span>
                        <span className="app-text-muted text-sm">({scan.symbol})</span>
                      </div>
                      <div className="app-text-muted text-sm">{scan.address}</div>
                      {scan.riskFactors > 0 && (
                        <div className="flex items-center space-x-1 mt-1">
                          <AlertTriangle className="w-3 h-3 text-yellow-500" />
                          <span className="text-yellow-500 text-xs">{scan.riskFactors} risk factors found</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(scan.risk)}`}>
                        {scan.risk} RISK
                      </div>
                      <div className="app-text-muted text-xs mt-1">
                        Score: {scan.securityScore}/100
                      </div>
                    </div>
                    <span className="app-text-muted text-sm">{scan.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SafeChecker;
