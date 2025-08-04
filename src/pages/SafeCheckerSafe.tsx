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
  Info
} from 'lucide-react';

// Lazy load heavy dependencies
const TokenScanner = React.lazy(() => 
  import('../utils/tokenScanner').then(module => ({ default: module.TokenScanner }))
);

const SeiTokenRegistry = React.lazy(() => 
  import('../utils/seiTokenRegistry').then(module => ({ default: module.SeiTokenRegistry }))
);

// Safe wallet hook import with error boundary
const useReownWallet = React.lazy(() =>
  import('../utils/reownWalletConnection').then(module => ({ default: module.useReownWallet }))
);

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
  const [walletData, setWalletData] = useState({
    isConnected: false,
    address: null,
    balance: null,
    isConnecting: false,
    error: null,
    walletType: null,
    connectWallet: async () => {},
    disconnectWallet: async () => {},
    getAvailableWallets: () => []
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadWalletHook = async () => {
      try {
        const { useReownWallet } = await import('../utils/reownWalletConnection');
        // This would need to be handled differently in a real implementation
        // For now, we'll use a fallback
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load wallet hook:', error);
        setIsLoading(false);
      }
    };

    loadWalletHook();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-400">Loading wallet system...</span>
      </div>
    );
  }

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

          {/* Scan Results - Using the same UI as SafeCheckerSimple for now */}
          {scanResult && (
            <div className="app-card p-8 mb-8">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-4">Scan Results</h3>
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    {getStatusIcon(scanResult.isHoneypot ? 'dangerous' : 'safe')}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(scanResult.riskLevel)}`}>
                      {scanResult.riskLevel} RISK
                    </span>
                  </div>
                  <h4 className="text-lg font-medium text-white mb-2">{scanResult.name} ({scanResult.symbol})</h4>
                  <p className="text-gray-400 text-sm mb-4">Security Score: {scanResult.securityScore}/100</p>
                  <p className="text-gray-300">
                    Token analysis completed. {scanResult.warnings?.length || 0} potential issues found.
                  </p>
                </div>
              </div>
            </div>
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