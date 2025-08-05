import React, { useState, useEffect, Suspense } from 'react';
import { 
  Search, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Wallet,
  RefreshCw,
  ExternalLink,
  Info,
  BarChart3
} from 'lucide-react';

// Lazy load heavy dependencies
const TokenScanner = React.lazy(() => 
  import('../utils/tokenScanner').then(module => ({ default: module.TokenScanner }))
);

const SeiTokenRegistry = React.lazy(() => 
  import('../utils/seiTokenRegistry').then(module => ({ default: module.SeiTokenRegistry }))
);

// Import wallet hook normally to prevent lazy loading issues
import { useWalletConnect as useReownWallet } from '../utils/walletConnect';

// Error Boundary Component
class SafeCheckerErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('SafeChecker Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                <h2 className="text-xl font-semibold text-red-400">SafeChecker Error</h2>
              </div>
              <p className="text-red-300 mb-4">
                There was an error loading the token scanner. This might be due to:
              </p>
              <ul className="text-red-300 space-y-1 mb-4">
                <li>• Network connectivity issues</li>
                <li>• Browser compatibility problems</li>
                <li>• Wallet connection errors</li>
              </ul>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Safe Wallet Connection Hook
const SafeWalletProvider: React.FC<{ children: (walletData: any) => React.ReactNode }> = ({ children }) => {
  // Use the wallet hook directly - no more async loading
  const walletData = useReownWallet();

  return <>{children(walletData)}</>;
};

const SafeCheckerSafe = () => {
  const [tokenAddress, setTokenAddress] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState<string[]>([]);
  const [recentScans, setRecentScans] = useState<any[]>([]);

  // Safe token scanning with error handling
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
      'Loading market data...',
      'Analyzing contract security...',
      'Checking for honeypot patterns...',
      'Evaluating liquidity safety...',
      'Scanning holder distribution...',
      'Calculating dynamic safety score...',
      'Generating comprehensive report...'
    ];

    try {
      // Show progress updates
      for (let i = 0; i < progressSteps.length; i++) {
        setScanProgress(prev => [...prev, progressSteps[i]]);
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // Try to load and use the TokenScanner
      try {
        const { TokenScanner } = await import('../utils/tokenScanner');
        const tokenScanner = new TokenScanner();
        
        const analysis = await tokenScanner.analyzeToken(tokenAddress);
        
        // Create scan result
        const scanResult = {
          address: tokenAddress,
          name: analysis.basicInfo.name || 'Unknown Token',
          symbol: analysis.basicInfo.symbol || 'UNKNOWN',
          decimals: analysis.basicInfo.decimals,
          totalSupply: analysis.basicInfo.totalSupply,
          verified: analysis.safetyChecks.verified.isVerified || false,
          logo: analysis.basicInfo.logoUrl,
          
          isHoneypot: analysis.safetyChecks.honeypot.isHoneypot || false,
          isVerified: analysis.safetyChecks.verified.isVerified || false,
          riskLevel: analysis.isSafe ? 'LOW' : (analysis.riskScore > 70 ? 'HIGH' : 'MEDIUM'),
          securityScore: analysis.riskScore,
          
          safetyChecks: analysis.safetyChecks,
          riskFactors: analysis.riskFactors,
          riskScore: analysis.riskScore,
          
          details: {
            owner: analysis.safetyChecks.ownership.owner || 'Unknown',
            isRenounced: analysis.safetyChecks.ownership.isRenounced || false,
            liquidityAmount: analysis.safetyChecks.liquidity.liquidityAmount || 'Unknown',
            holderCount: analysis.safetyChecks.holderDistribution.holderCount || 0,
            topHolderPercentage: analysis.safetyChecks.holderDistribution.topHolderPercentage || 0,
            buyTax: analysis.safetyChecks.fees.buyTax || 0,
            sellTax: analysis.safetyChecks.fees.sellTax || 0,
            formattedTotalSupply: analysis.basicInfo.formattedTotalSupply,
            
            price: analysis.basicInfo.marketData?.price ? 
              (await import('../utils/tokenScanner')).TokenScanner.prototype.formatNumber?.call(null, analysis.basicInfo.marketData.price) : undefined,
            marketCap: analysis.basicInfo.marketData?.marketCap ? 
              (await import('../utils/tokenScanner')).TokenScanner.prototype.formatNumber?.call(null, analysis.basicInfo.marketData.marketCap) : undefined,
            volume24h: analysis.basicInfo.marketData?.volume24h ? 
              (await import('../utils/tokenScanner')).TokenScanner.prototype.formatNumber?.call(null, analysis.basicInfo.marketData.volume24h) : undefined,
            priceChange24h: analysis.basicInfo.marketData?.priceChange24h ? 
              Number(analysis.basicInfo.marketData.priceChange24h.toFixed(2)) : undefined,
          },
          
          warnings: analysis.riskFactors,
          lastScanned: new Date().toISOString(),
          scanCount: 1,
          walletConnected: false,
          scannedBy: 'Anonymous'
        };

        setScanResult(scanResult);

        // Update recent scans
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

      } catch (scannerError) {
        console.error('TokenScanner error:', scannerError);
        
        // Fallback to basic token info
        const basicResult = {
          address: tokenAddress,
          name: 'Unknown Token',
          symbol: 'UNKNOWN',
          decimals: 18,
          totalSupply: '0',
          verified: false,
          logo: `https://via.placeholder.com/64/4F46E5/FFFFFF?text=?`,
          
          isHoneypot: false,
          isVerified: false,
          riskLevel: 'UNKNOWN',
          securityScore: 50,
          
          details: {
            owner: 'Unknown',
            isRenounced: false,
            liquidityAmount: 'Unknown',
            holderCount: 0,
            topHolderPercentage: 0,
            buyTax: 0,
            sellTax: 0,
            formattedTotalSupply: 'Unknown'
          },
          
          warnings: ['Unable to perform full security analysis'],
          lastScanned: new Date().toISOString(),
          scanCount: 1,
          walletConnected: false,
          scannedBy: 'Anonymous'
        };
        
        setScanResult(basicResult);
      }
      
    } catch (err: any) {
      console.error('Token scan failed:', err);
      setError('Failed to scan token: ' + (err?.message || 'Unknown error'));
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
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LOW':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'HIGH':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <SafeCheckerErrorBoundary>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-12 h-12 text-blue-500" />
            </div>
            <h1 className="app-heading-xl mb-4">SafeChecker</h1>
            <p className="app-text-muted text-lg max-w-2xl mx-auto">
              Advanced token security analysis for the Sei ecosystem. Scan any token contract for potential risks, honeypots, and safety issues.
            </p>
          </div>

          {/* Wallet Connection Status */}
          <SafeWalletProvider>
            {(walletData) => (
              <div className="app-card p-6 mb-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-blue-500" />
                    <div>
                      <h3 className="app-text-primary font-medium">Enhanced Security Scanning</h3>
                      <p className="app-text-muted text-sm">
                        {walletData.isConnected 
                          ? `Connected with ${walletData.walletType || 'wallet'} • Enhanced features enabled`
                          : 'Connect wallet for advanced security features and personalized insights'
                        }
                      </p>
                    </div>
                  </div>
                  {!walletData.isConnected ? (
                    <button
                      onClick={walletData.connectWallet}
                      disabled={walletData.isConnecting}
                      className="app-btn app-btn-primary"
                    >
                      <Wallet className="w-4 h-4 mr-2" />
                      {walletData.isConnecting ? 'Connecting...' : 'Connect Wallet'}
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="app-text-primary text-sm font-medium">
                        {walletData.address?.slice(0, 6)}...{walletData.address?.slice(-4)}
                      </span>
                      <button
                        onClick={walletData.disconnectWallet}
                        className="app-btn app-btn-secondary text-xs"
                      >
                        Disconnect
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </SafeWalletProvider>

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

          {/* Enhanced Scan Results with Detailed Breakdown */}
          {scanResult && (
            <>
              {/* Token Header with Logo and Basic Info */}
              <div className="app-card p-8 mb-8">
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <img 
                        src={scanResult.logo || `https://via.placeholder.com/64/4F46E5/FFFFFF?text=${scanResult.symbol.slice(0, 3)}`}
                        alt={`${scanResult.name} logo`}
                        className="w-16 h-16 rounded-full border-2 border-gray-200 bg-white"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://via.placeholder.com/64/4F46E5/FFFFFF?text=${scanResult.symbol.slice(0, 3)}`;
                        }}
                      />
                      {scanResult.verified && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h2 className="app-heading-lg mb-1">{scanResult.name}</h2>
                      <div className="flex items-center space-x-2">
                        <span className="app-text-muted">{scanResult.symbol}</span>
                        {scanResult.verified && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Verified</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(scanResult.isHoneypot ? 'dangerous' : 'safe')}
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${getRiskColor(scanResult.riskLevel)}`}>
                      {scanResult.riskLevel} RISK
                    </span>
                  </div>
                </div>

                {/* Market Data Banner */}
                {(scanResult.details?.marketCap || scanResult.details?.price) && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                    {scanResult.details?.price && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-800">${scanResult.details.price}</div>
                        <div className="text-sm text-gray-600">Price</div>
                      </div>
                    )}
                    {scanResult.details?.marketCap && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-800">${scanResult.details.marketCap}</div>
                        <div className="text-sm text-gray-600">Market Cap</div>
                      </div>
                    )}
                    {scanResult.details?.formattedTotalSupply && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-800">{scanResult.details.formattedTotalSupply}</div>
                        <div className="text-sm text-gray-600">Total Supply</div>
                      </div>
                    )}
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-800">{scanResult.securityScore}/100</div>
                      <div className="text-sm text-gray-600">Safety Score</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Detailed Safety Score Breakdown */}
              <div className="app-card p-8 mb-8">
                <h3 className="app-heading-md mb-6">Safety Score Breakdown</h3>
                <p className="app-text-muted mb-6">
                  Our dynamic scoring system analyzes multiple risk factors to provide a comprehensive safety assessment. Here's how we calculated this token's score:
                </p>

                {/* Overall Score Display */}
                <div className="mb-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-2xl font-bold text-gray-800">{scanResult.securityScore}/100</h4>
                      <p className="text-gray-600">Overall Safety Score</p>
                    </div>
                    <div className="w-32 h-4 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${
                          scanResult.securityScore >= 80 ? 'bg-green-500' :
                          scanResult.securityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${scanResult.securityScore}%` }}
                      ></div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">
                    {scanResult.securityScore >= 80 ? '✅ This token appears to be safe based on our analysis' :
                     scanResult.securityScore >= 60 ? '⚠️ This token has some risk factors to consider' :
                     '🚨 This token has significant risk factors - proceed with caution'}
                  </p>
                </div>

                {/* Individual Risk Factors */}
                <div className="space-y-4">
                  <h4 className="app-heading-sm mb-4">Risk Factor Analysis</h4>
                  
                  {/* Honeypot Check */}
                  <div className="flex items-center justify-between p-4 app-bg-tertiary rounded-lg border border-gray-100">
                    <div className="flex items-center space-x-3">
                      {scanResult.isHoneypot ? (
                        <XCircle className="w-5 h-5 text-red-500" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                      <div>
                        <div className="app-text-primary font-medium">Honeypot Detection</div>
                        <div className="text-xs app-text-muted">
                          {scanResult.isHoneypot ? 'Token may be a honeypot (-40 points)' : 'No honeypot patterns detected (+0 points)'}
                        </div>
                      </div>
                    </div>
                    <span className={scanResult.isHoneypot ? 'text-red-500 font-medium' : 'text-green-500 font-medium'}>
                      {scanResult.isHoneypot ? 'DANGEROUS' : 'SAFE'}
                    </span>
                  </div>

                  {/* Contract Verification */}
                  <div className="flex items-center justify-between p-4 app-bg-tertiary rounded-lg border border-gray-100">
                    <div className="flex items-center space-x-3">
                      {scanResult.isVerified ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      )}
                      <div>
                        <div className="app-text-primary font-medium">Contract Verification</div>
                        <div className="text-xs app-text-muted">
                          {scanResult.isVerified ? 'Contract is verified (+10 points)' : 'Contract not verified (-5 points)'}
                        </div>
                      </div>
                    </div>
                    <span className={scanResult.isVerified ? 'text-green-500 font-medium' : 'text-yellow-500 font-medium'}>
                      {scanResult.isVerified ? 'VERIFIED' : 'UNVERIFIED'}
                    </span>
                  </div>

                  {/* Ownership Analysis */}
                  {scanResult.details && (
                    <div className="flex items-center justify-between p-4 app-bg-tertiary rounded-lg border border-gray-100">
                      <div className="flex items-center space-x-3">
                        {scanResult.details.isRenounced ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        )}
                        <div>
                          <div className="app-text-primary font-medium">Ownership Status</div>
                          <div className="text-xs app-text-muted">
                            {scanResult.details.isRenounced ? 'Ownership renounced (+5 points)' : 'Owner can modify contract (-10 points)'}
                          </div>
                        </div>
                      </div>
                      <span className={scanResult.details.isRenounced ? 'text-green-500 font-medium' : 'text-yellow-500 font-medium'}>
                        {scanResult.details.isRenounced ? 'RENOUNCED' : 'OWNED'}
                      </span>
                    </div>
                  )}

                  {/* Trading Fees */}
                  {scanResult.details && (scanResult.details.buyTax > 0 || scanResult.details.sellTax > 0) && (
                    <div className="flex items-center justify-between p-4 app-bg-tertiary rounded-lg border border-gray-100">
                      <div className="flex items-center space-x-3">
                        {(scanResult.details.buyTax > 10 || scanResult.details.sellTax > 10) ? (
                          <XCircle className="w-5 h-5 text-red-500" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        )}
                        <div>
                          <div className="app-text-primary font-medium">Trading Fees</div>
                          <div className="text-xs app-text-muted">
                            Buy: {scanResult.details.buyTax}% | Sell: {scanResult.details.sellTax}%
                            {(scanResult.details.buyTax > 10 || scanResult.details.sellTax > 10) ? ' (Excessive fees -20 points)' : ' (Moderate fees -5 points)'}
                          </div>
                        </div>
                      </div>
                      <span className={(scanResult.details.buyTax > 10 || scanResult.details.sellTax > 10) ? 'text-red-500 font-medium' : 'text-yellow-500 font-medium'}>
                        {(scanResult.details.buyTax > 10 || scanResult.details.sellTax > 10) ? 'HIGH' : 'MODERATE'}
                      </span>
                    </div>
                  )}

                  {/* Holder Distribution */}
                  {scanResult.details && scanResult.details.topHolderPercentage > 0 && (
                    <div className="flex items-center justify-between p-4 app-bg-tertiary rounded-lg border border-gray-100">
                      <div className="flex items-center space-x-3">
                        {scanResult.details.topHolderPercentage > 50 ? (
                          <XCircle className="w-5 h-5 text-red-500" />
                        ) : scanResult.details.topHolderPercentage > 20 ? (
                          <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        ) : (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                        <div>
                          <div className="app-text-primary font-medium">Holder Distribution</div>
                          <div className="text-xs app-text-muted">
                            Top holder owns {scanResult.details.topHolderPercentage}% of supply
                            {scanResult.details.topHolderPercentage > 50 ? ' (High concentration -15 points)' : 
                             scanResult.details.topHolderPercentage > 20 ? ' (Moderate concentration -5 points)' : 
                             ' (Good distribution +0 points)'}
                          </div>
                        </div>
                      </div>
                      <span className={
                        scanResult.details.topHolderPercentage > 50 ? 'text-red-500 font-medium' :
                        scanResult.details.topHolderPercentage > 20 ? 'text-yellow-500 font-medium' :
                        'text-green-500 font-medium'
                      }>
                        {scanResult.details.topHolderPercentage > 50 ? 'CONCENTRATED' :
                         scanResult.details.topHolderPercentage > 20 ? 'MODERATE' : 'DISTRIBUTED'}
                      </span>
                    </div>
                  )}

                  {/* Market Data Impact */}
                  {scanResult.details?.priceChange24h && (
                    <div className="flex items-center justify-between p-4 app-bg-tertiary rounded-lg border border-gray-100">
                      <div className="flex items-center space-x-3">
                        {scanResult.details.priceChange24h < -20 ? (
                          <XCircle className="w-5 h-5 text-red-500" />
                        ) : scanResult.details.priceChange24h < -10 ? (
                          <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        ) : (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                        <div>
                          <div className="app-text-primary font-medium">24h Price Performance</div>
                          <div className="text-xs app-text-muted">
                            {scanResult.details.priceChange24h >= 0 ? '+' : ''}{scanResult.details.priceChange24h}% change
                            {scanResult.details.priceChange24h < -20 ? ' (Major decline -10 points)' : 
                             scanResult.details.priceChange24h < -10 ? ' (Significant decline -5 points)' : 
                             ' (Stable/positive +0 points)'}
                          </div>
                        </div>
                      </div>
                      <span className={
                        scanResult.details.priceChange24h < -20 ? 'text-red-500 font-medium' :
                        scanResult.details.priceChange24h < -10 ? 'text-yellow-500 font-medium' :
                        scanResult.details.priceChange24h >= 0 ? 'text-green-500 font-medium' : 'text-yellow-500 font-medium'
                      }>
                        {scanResult.details.priceChange24h >= 0 ? '+' : ''}{scanResult.details.priceChange24h}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Risk Warnings */}
                {scanResult.warnings && scanResult.warnings.length > 0 && (
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h5 className="text-yellow-800 font-medium mb-2">Risk Warnings</h5>
                        <ul className="text-yellow-700 text-sm space-y-1">
                          {scanResult.warnings.map((warning, index) => (
                            <li key={index}>• {warning}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Scoring Methodology */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h5 className="text-blue-800 font-medium mb-2">How We Calculate Safety Scores</h5>
                  <p className="text-blue-700 text-sm mb-2">
                    Our scoring system starts at 100 points and deducts points based on risk factors:
                  </p>
                                     <ul className="text-blue-700 text-sm space-y-1">
                     <li>• <strong>Honeypot Detection:</strong> -40 points if detected</li>
                     <li>• <strong>Blacklist Functions:</strong> -25 points if present</li>
                     <li>• <strong>Excessive Fees:</strong> -20 points if buy/sell tax &gt; 10%</li>
                     <li>• <strong>High Concentration:</strong> -15 points if top holder &gt; 50%</li>
                     <li>• <strong>Owner Control:</strong> -10 points if not renounced</li>
                     <li>• <strong>Verification Bonus:</strong> +10 points if verified</li>
                     <li>• <strong>Renounced Bonus:</strong> +5 points if ownership renounced</li>
                   </ul>
                </div>
              </div>

              {/* Trading View Link */}
              {scanResult && scanResult.details && (
                <div className="app-card p-6 mt-6">
                  <h3 className="app-heading-sm mb-4">Advanced Token Analysis</h3>
                  <p className="app-text-muted mb-4">
                    View comprehensive trading data, price charts, and market metrics for this token.
                  </p>
                  <button
                    onClick={() => {
                      // Navigate to trading search with token parameter
                      const chainId = 'ethereum'; // Default to Ethereum, could be dynamic based on token
                      const tokenAddress = scanResult.contractAddress;
                      
                      // Open in new tab to preserve the current scan results
                      window.open(`/app/trading/${chainId}/search?token=${tokenAddress}`, '_blank');
                    }}
                    className="flex items-center space-x-2 app-button-primary"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>View Trading Data & Charts</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <div className="mt-3 text-xs app-text-muted">
                    Opens real-time trading view with price charts, volume, liquidity, and market data
                  </div>
                </div>
              )}
            </>
          )}

          {/* Recent Scans */}
          {recentScans.length > 0 && (
            <div className="app-card p-8">
              <h2 className="app-heading-md mb-6">Recent Scans</h2>
              <div className="space-y-4">
                {recentScans.map((scan, index) => (
                  <div key={index} className="flex items-center justify-between p-4 app-bg-tertiary rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(scan.status)}
                      <div>
                        <div className="font-medium app-text-primary">{scan.name} ({scan.symbol})</div>
                        <div className="text-sm app-text-muted">{scan.address}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${getRiskColor(scan.risk).split(' ')[1]}`}>
                        {scan.risk} RISK
                      </div>
                      <div className="text-xs app-text-muted">{scan.timestamp}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </SafeCheckerErrorBoundary>
  );
};

export default SafeCheckerSafe;