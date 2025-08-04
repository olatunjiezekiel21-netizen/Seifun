import React, { useState } from 'react';
import { 
  Search, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle 
} from 'lucide-react';

import { getTokenInfo } from '../utils/SeiTokenRegistry';
import { scanTokenAddress } from '../utils/tokenScanner';

const SafeChecker = () => {
  const [tokenAddress, setTokenAddress] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const scanToken = async () => {
    if (!tokenAddress.trim()) return;
    setIsScanning(true);
    setScanResult(null);
    setError(null);

    try {
      // Fetch basic token info (optional, for name/symbol)
      let registryInfo = {};
      try {
        registryInfo = await getTokenInfo(tokenAddress);
      } catch (e) {
        // If not found, that's fine—continue with scan only
      }

      // Scan the token (must return: isHoneypot, isVerified, riskLevel, securityScore, warnings, details, etc.)
      const scanData = await scanTokenAddress(tokenAddress);

      // Compose the final scan result
      const scanResult = {
        ...registryInfo,
        ...scanData,
        address: tokenAddress,
        name:
          (registryInfo as any)?.name ||
          (scanData as any)?.name ||
          'Unknown',
        symbol:
          (registryInfo as any)?.symbol ||
          (scanData as any)?.symbol ||
          '',
      };

      setScanResult(scanResult);

      setRecentScans(prev => [
        {
          address: tokenAddress.slice(0, 8) + '...' + tokenAddress.slice(-4),
          name: scanResult.name,
          status: scanResult.isHoneypot ? 'dangerous' : 'safe',
          timestamp: 'Just now',
          risk: scanResult.riskLevel
        },
        ...prev.slice(0, 4)
      ]);
    } catch (err: any) {
      setError('Failed to scan token: ' + (err?.message || err));
    } finally {
      setIsScanning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'safe':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'dangerous':
        return <XCircle className="w-5 h-5 text-red-500" />;
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
        {/* Scanner Input */}
        <div className="app-card p-8 mb-8">
          <h2 className="app-heading-md mb-6">Token Scanner</h2>
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Enter token contract address..."
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
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
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
          {error && (
            <div className="mt-4 text-red-500 text-sm">{error}</div>
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
                    <span className="app-text-primary font-medium">{scanResult.name}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 app-bg-tertiary rounded-lg">
                    <span className="app-text-muted">Symbol</span>
                    <span className="app-text-primary font-medium">{scanResult.symbol}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 app-bg-tertiary rounded-lg">
                    <span className="app-text-muted">Address</span>
                    <span className="app-text-primary font-mono text-sm">{scanResult.address}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 app-bg-tertiary rounded-lg">
                    <span className="app-text-muted">Security Score</span>
                    <span className="app-text-primary font-medium">{scanResult.securityScore}/100</span>
                  </div>
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
          <h2 className="app-heading-md mb-6">Recent Scans</h2>
          <div className="space-y-4">
            {recentScans.map((scan, index) => (
              <div key={index} className="flex items-center justify-between p-4 app-bg-tertiary rounded-lg">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(scan.status)}
                  <div>
                    <div className="app-text-primary font-medium">{scan.name}</div>
                    <div className="app-text-muted text-sm">{scan.address}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(scan.risk)}`}>
                    {scan.risk} RISK
                  </span>
                  <span className="app-text-muted text-sm">{scan.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafeChecker;
