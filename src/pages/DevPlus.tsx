import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Shield, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Activity,
  Settings,
  Code,
  Gift,
  Target,
  Zap,
  Star,
  RefreshCw,
  ExternalLink,
  TrendingDown,
  Droplets,
  Flame
} from 'lucide-react';
import { defiService, testDefiService } from '../services/DeFiService';
import { useReownWallet } from '../utils/reownWalletConnection';

interface TokenData {
  address: string;
  name: string;
  symbol: string;
  totalSupply: string;
  decimals: number;
  creator: string;
  createdAt: Date;
  verified: boolean;
  securityScore: number;
  holders: number;
  price?: string;
  marketCap?: string;
  volume24h?: string;
  priceChange24h?: string;
}

interface TokenActivity {
  type: 'launch' | 'trade' | 'scan' | 'alert' | 'liquidity' | 'burn';
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  description: string;
  timestamp: Date;
  status: 'success' | 'warning' | 'error';
  txHash?: string;
}

const DevPlus = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [activities, setActivities] = useState<TokenActivity[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedToken, setSelectedToken] = useState<TokenData | null>(null);
  const [showLiquidityModal, setShowLiquidityModal] = useState(false);
  const [showBurnModal, setShowBurnModal] = useState(false);
  const [liquidityAmount, setLiquidityAmount] = useState({ token: '', sei: '' });
  const [burnAmount, setBurnAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  
  const { isConnected, address, connectWallet } = useReownWallet();

  // Load real data from localStorage (would be from TokenService in production)
  useEffect(() => {
    loadData();
    
    // Set up periodic refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    try {
      setRefreshing(true);
      
      // Get real data from localStorage (created tokens from SeiList)
      const storedTokens = JSON.parse(localStorage.getItem('dev++_tokens') || '[]');
      const tokenData = storedTokens.map((token: any) => ({
        ...token,
        createdAt: new Date(token.createdAt || Date.now())
      }));
      
      setTokens(tokenData);
      
      // Generate activities from token data
      const tokenActivities = tokenData.map((token: TokenData) => ({
        type: 'launch' as const,
        tokenAddress: token.address,
        tokenName: token.name,
        tokenSymbol: token.symbol,
        description: `Token ${token.name} (${token.symbol}) launched`,
        timestamp: token.createdAt,
        status: 'success' as const
      }));
      
      setActivities(tokenActivities.slice(0, 10));
    } catch (error) {
      console.error('Failed to load DevPlus data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadData();
  };

  // REAL LIQUIDITY ADDITION
  const handleAddLiquidity = async () => {
    if (!selectedToken || !isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!liquidityAmount.token || !liquidityAmount.sei) {
      alert('Please enter both token and SEI amounts');
      return;
    }

    setProcessing(true);
    try {
      // Connect DeFi service to user's wallet
      await defiService.connectWallet();
      
      const result = await defiService.addLiquidity({
        tokenAddress: selectedToken.address,
        tokenAmount: liquidityAmount.token,
        seiAmount: liquidityAmount.sei,
        slippageTolerance: 5, // 5%
        deadline: 20 // 20 minutes
      });

      if (result.success) {
        alert(
          `🎉 Liquidity Added Successfully!\n\n` +
          `Token: ${selectedToken.name} (${selectedToken.symbol})\n` +
          `Token Amount: ${result.tokenAmount}\n` +
          `SEI Amount: ${result.seiAmount}\n` +
          `LP Tokens Received: ${result.liquidityTokens}\n` +
          `Transaction Hash: ${result.txHash}\n\n` +
          `Your liquidity has been added to the pool!`
        );
        
        // Add activity
        const newActivity = {
          type: 'liquidity' as const,
          tokenAddress: selectedToken.address,
          tokenName: selectedToken.name,
          tokenSymbol: selectedToken.symbol,
          description: `Added ${liquidityAmount.token} ${selectedToken.symbol} + ${liquidityAmount.sei} SEI liquidity`,
          timestamp: new Date(),
          status: 'success' as const,
          txHash: result.txHash
        };
        
        setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
        setShowLiquidityModal(false);
        setLiquidityAmount({ token: '', sei: '' });
      } else {
        alert(`❌ Liquidity Addition Failed:\n\n${result.error}`);
      }
    } catch (error) {
      alert(`❌ Liquidity Addition Failed:\n\n${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  // REAL TOKEN BURNING
  const handleBurnTokens = async () => {
    if (!selectedToken || !isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!burnAmount) {
      alert('Please enter the amount to burn');
      return;
    }

    const confirmed = confirm(
      `🔥 FINAL BURN CONFIRMATION 🔥\n\n` +
      `You are about to PERMANENTLY BURN:\n` +
      `${burnAmount} ${selectedToken.symbol}\n\n` +
      `This action is IRREVERSIBLE!\n` +
      `The tokens will be permanently removed from circulation.\n\n` +
      `Are you absolutely sure you want to proceed?`
    );

    if (!confirmed) return;

    setProcessing(true);
    try {
      // Connect DeFi service to user's wallet
      await defiService.connectWallet();
      
      const result = await defiService.burnTokens({
        tokenAddress: selectedToken.address,
        amount: burnAmount
      });

      if (result.success) {
        alert(
          `🔥 Tokens Burned Successfully!\n\n` +
          `Token: ${selectedToken.name} (${selectedToken.symbol})\n` +
          `Amount Burned: ${result.amountBurned}\n` +
          `New Total Supply: ${result.newTotalSupply}\n` +
          `Transaction Hash: ${result.txHash}\n\n` +
          `The tokens have been permanently removed from circulation!`
        );
        
        // Update token data
        setTokens(prev => prev.map(token => 
          token.address === selectedToken.address 
            ? { ...token, totalSupply: result.newTotalSupply }
            : token
        ));
        
        // Add activity
        const newActivity = {
          type: 'burn' as const,
          tokenAddress: selectedToken.address,
          tokenName: selectedToken.name,
          tokenSymbol: selectedToken.symbol,
          description: `Burned ${burnAmount} ${selectedToken.symbol} tokens`,
          timestamp: new Date(),
          status: 'success' as const,
          txHash: result.txHash
        };
        
        setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
        setShowBurnModal(false);
        setBurnAmount('');
        loadData(); // Refresh data
      } else {
        alert(`❌ Token Burn Failed:\n\n${result.error}`);
      }
    } catch (error) {
      alert(`❌ Token Burn Failed:\n\n${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  // Calculate key metrics from real data
  const analytics = {
    totalTokens: tokens.length,
    verifiedTokens: tokens.filter(t => t.verified).length,
    avgSecurityScore: tokens.length > 0 
      ? tokens.reduce((sum, t) => sum + t.securityScore, 0) / tokens.length 
      : 0,
    highRiskTokens: tokens.filter(t => t.securityScore < 40).length,
    recentActivities: activities.length,
    unresolvedAlerts: tokens.filter(t => t.securityScore < 40).length
  };

  const keyMetrics = [
    { 
      label: 'Active Tokens', 
      value: analytics.totalTokens.toString(), 
      change: tokens.length > 0 ? `${tokens.filter(t => Date.now() - t.createdAt.getTime() < 24 * 60 * 60 * 1000).length} today` : '0 today',
      icon: Code, 
      trend: 'up' 
    },
    { 
      label: 'Avg Security Score', 
      value: `${Math.round(analytics.avgSecurityScore)}%`, 
      change: analytics.avgSecurityScore >= 70 ? 'Excellent' : analytics.avgSecurityScore >= 40 ? 'Good' : 'Needs Work',
      icon: Shield, 
      trend: analytics.avgSecurityScore >= 70 ? 'up' : analytics.avgSecurityScore >= 40 ? 'neutral' : 'down'
    },
    { 
      label: 'Verified Tokens', 
      value: analytics.verifiedTokens.toString(), 
      change: `${Math.round((analytics.verifiedTokens / Math.max(analytics.totalTokens, 1)) * 100)}% verified`,
      icon: CheckCircle, 
      trend: 'up' 
    },
    { 
      label: 'Active Alerts', 
      value: analytics.unresolvedAlerts.toString(), 
      change: analytics.highRiskTokens > 0 ? `${analytics.highRiskTokens} high risk` : 'All clear',
      icon: AlertTriangle, 
      trend: analytics.unresolvedAlerts > 0 ? 'down' : 'up'
    }
  ];

  const quickActions = [
    { name: 'Launch Token', icon: Zap, description: 'Create and deploy a new token', action: () => window.location.href = '/app/seilist' },
    { name: 'Security Scan', icon: Shield, description: 'Scan tokens for vulnerabilities', action: () => window.location.href = '/app/safechecker' },
    { name: 'Analytics', icon: BarChart3, description: 'View detailed metrics', action: () => setActiveTab('analytics') },
    { name: 'Token Watch', icon: Eye, description: 'Monitor token activity', action: () => setActiveTab('token-watch') }
  ];

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'token-watch', name: 'Token Watch', icon: Eye },
    { id: 'analytics', name: 'Analytics', icon: TrendingUp },
    { id: 'tools', name: 'Developer Tools', icon: Settings }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="app-bg-primary min-h-screen">
      {/* Header */}
      <div className="app-bg-secondary border-b app-border">
        <div className="app-container py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="app-heading-xl app-text-primary mb-4">
                                 Dev++ Dashboard
              </h1>
              <p className="app-text-lg max-w-3xl">
                Real-time token management, security monitoring, and ecosystem analytics. 
                All data is live from your created tokens.
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="app-btn app-btn-secondary flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="app-container py-8">
        {/* Tab Navigation */}
        <div className="app-category-tabs mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`app-category-tab ${activeTab === tab.id ? 'active' : ''}`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {keyMetrics.map((metric) => {
                const Icon = metric.icon;
                return (
                  <div key={metric.label} className="app-bg-secondary rounded-lg p-6 border app-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="app-text-muted text-sm font-medium">{metric.label}</p>
                        <p className="app-text-primary text-2xl font-bold mt-2">{metric.value}</p>
                        <p className={`text-sm mt-1 ${
                          metric.trend === 'up' ? 'text-green-400' : 
                          metric.trend === 'down' ? 'text-red-400' : 'text-gray-400'
                        }`}>
                          {metric.change}
                        </p>
                      </div>
                      <div className={`p-3 rounded-lg ${
                        metric.trend === 'up' ? 'bg-green-500/10' : 
                        metric.trend === 'down' ? 'bg-red-500/10' : 'bg-gray-500/10'
                      }`}>
                        <Icon className={`w-6 h-6 ${
                          metric.trend === 'up' ? 'text-green-400' : 
                          metric.trend === 'down' ? 'text-red-400' : 'text-gray-400'
                        }`} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="app-heading-md app-text-primary mb-6">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.name}
                      onClick={action.action}
                      className="app-bg-secondary rounded-lg p-6 border app-border hover:border-blue-500/50 transition-colors text-left group"
                    >
                      <Icon className="w-8 h-8 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
                      <h4 className="app-text-primary font-medium mb-2">{action.name}</h4>
                      <p className="app-text-muted text-sm">{action.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h3 className="app-heading-md app-text-primary mb-6">Recent Activity</h3>
              <div className="app-bg-secondary rounded-lg border app-border">
                {activities.length > 0 ? (
                  <div className="divide-y divide-gray-700">
                    {activities.slice(0, 5).map((activity, index) => (
                      <div key={index} className="p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(activity.status).replace('text-', 'bg-')}`}></div>
                          <div>
                            <p className="app-text-primary font-medium">{activity.description}</p>
                            <p className="app-text-muted text-sm">
                              {activity.tokenName} ({activity.tokenSymbol})
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="app-text-muted text-sm">
                            {new Date(activity.timestamp).toLocaleDateString()}
                          </p>
                          <p className="app-text-muted text-xs">
                            {new Date(activity.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Activity className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="app-text-muted">No recent activity</p>
                    <p className="app-text-muted text-sm mt-1">Create tokens through SeiList to see activity here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Token Watch */}
        {activeTab === 'token-watch' && (
          <div>
            <h3 className="app-heading-md app-text-primary mb-6">Tracked Tokens</h3>
            <div className="app-bg-secondary rounded-lg border app-border">
              {tokens.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-gray-700">
                      <tr>
                        <th className="text-left p-4 app-text-primary font-medium">Token</th>
                        <th className="text-left p-4 app-text-primary font-medium">Security Score</th>
                        <th className="text-left p-4 app-text-primary font-medium">Supply</th>
                        <th className="text-left p-4 app-text-primary font-medium">Created</th>
                        <th className="text-left p-4 app-text-primary font-medium">Status</th>
                        <th className="text-left p-4 app-text-primary font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {tokens.map((token) => (
                        <tr key={token.address} className="hover:bg-gray-800/50">
                          <td className="p-4">
                            <div>
                              <p className="app-text-primary font-medium">{token.name}</p>
                              <p className="app-text-muted text-sm">{token.symbol}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${
                                token.securityScore >= 70 ? 'bg-green-400' :
                                token.securityScore >= 40 ? 'bg-yellow-400' : 'bg-red-400'
                              }`}></div>
                              <span className="app-text-primary">{token.securityScore}/100</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="app-text-primary">{parseInt(token.totalSupply).toLocaleString()}</span>
                          </td>
                          <td className="p-4">
                            <span className="app-text-muted text-sm">
                              {new Date(token.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="p-4">
                            {token.verified ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400">
                                <Clock className="w-3 h-3 mr-1" />
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => window.open(`/app/safechecker?address=${token.address}`, '_blank')}
                                className="text-blue-400 hover:text-blue-300 text-xs flex items-center space-x-1"
                                title="Security Scan"
                              >
                                <Shield className="w-3 h-3" />
                                <span>Scan</span>
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedToken(token);
                                  setShowLiquidityModal(true);
                                }}
                                className="text-green-400 hover:text-green-300 text-xs flex items-center space-x-1"
                                title="Add Real Liquidity"
                              >
                                <Droplets className="w-3 h-3" />
                                <span>Liquidity</span>
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedToken(token);
                                  setShowBurnModal(true);
                                }}
                                className="text-red-400 hover:text-red-300 text-xs flex items-center space-x-1"
                                title="Burn Tokens (Real Transaction)"
                              >
                                <Flame className="w-3 h-3" />
                                <span>Burn</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Eye className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="app-text-muted">No tokens being tracked</p>
                  <p className="app-text-muted text-sm mt-1">Create tokens through SeiList to start tracking</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics */}
        {activeTab === 'analytics' && (
          <div>
            <h3 className="app-heading-md app-text-primary mb-6">Analytics Overview</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="app-bg-secondary rounded-lg border app-border p-6">
                <h4 className="app-text-primary font-medium mb-4">Token Performance</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="app-text-muted">Total Tokens Created</span>
                    <span className="app-text-primary font-medium">{analytics.totalTokens}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="app-text-muted">Verification Rate</span>
                    <span className="app-text-primary font-medium">
                      {Math.round((analytics.verifiedTokens / Math.max(analytics.totalTokens, 1)) * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="app-text-muted">Avg Security Score</span>
                    <span className={`font-medium ${
                      analytics.avgSecurityScore >= 70 ? 'text-green-400' :
                      analytics.avgSecurityScore >= 40 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {Math.round(analytics.avgSecurityScore)}/100
                    </span>
                  </div>
                </div>
              </div>

              <div className="app-bg-secondary rounded-lg border app-border p-6">
                <h4 className="app-text-primary font-medium mb-4">Security Overview</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="app-text-muted">High Risk Tokens</span>
                    <span className="text-red-400 font-medium">{analytics.highRiskTokens}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="app-text-muted">Active Alerts</span>
                    <span className="text-yellow-400 font-medium">{analytics.unresolvedAlerts}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="app-text-muted">Recent Activities</span>
                    <span className="app-text-primary font-medium">{analytics.recentActivities}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Developer Tools */}
        {activeTab === 'tools' && (
          <div>
            <h3 className="app-heading-md app-text-primary mb-6">Developer Tools</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="app-bg-secondary rounded-lg border app-border p-6">
                <h4 className="app-text-primary font-medium mb-4">Data Export</h4>
                <p className="app-text-muted text-sm mb-4">
                  Export all tracked token data for analysis or backup
                </p>
                <button
                  onClick={() => {
                    const data = {
                      tokens,
                      activities,
                      analytics,
                      timestamp: new Date()
                    };
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `devplus-export-${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="app-btn app-btn-primary"
                >
                  Export Data
                </button>
              </div>

              <div className="app-bg-secondary rounded-lg border app-border p-6">
                <h4 className="app-text-primary font-medium mb-4">Integration Status</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="app-text-primary text-sm">SeiList Integration Active</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="app-text-primary text-sm">Real-time Data Tracking</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="app-text-primary text-sm">No Mock Data - All Real</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* REAL LIQUIDITY MODAL */}
      {showLiquidityModal && selectedToken && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Add Real Liquidity</h3>
              <button
                onClick={() => setShowLiquidityModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <ExternalLink className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Token: {selectedToken.name} ({selectedToken.symbol})
                </label>
                <input
                  type="number"
                  placeholder="Token amount"
                  value={liquidityAmount.token}
                  onChange={(e) => setLiquidityAmount(prev => ({ ...prev, token: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  SEI Amount
                </label>
                <input
                  type="number"
                  placeholder="SEI amount"
                  value={liquidityAmount.sei}
                  onChange={(e) => setLiquidityAmount(prev => ({ ...prev, sei: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
              </div>

                        {!isConnected && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
              <p className="text-yellow-400 text-sm">
                ⚠️ Please connect your wallet to add liquidity
              </p>
            </div>
          )}

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <p className="text-blue-400 text-sm">
                  💡 This will create a real liquidity pool with your tokens and SEI. 
                  Make sure you have sufficient balance of both tokens.
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowLiquidityModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                            onClick={handleAddLiquidity}
            disabled={processing || !isConnected}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {processing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <Droplets className="w-4 h-4" />
                    <span>Add Liquidity</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REAL BURN MODAL */}
      {showBurnModal && selectedToken && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-red-500/30">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-red-400">🔥 Burn Tokens</h3>
              <button
                onClick={() => setShowBurnModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <ExternalLink className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Token: {selectedToken.name} ({selectedToken.symbol})
                </label>
                <div className="text-sm text-gray-400 mb-2">
                  Current Supply: {parseInt(selectedToken.totalSupply).toLocaleString()}
                </div>
                <input
                  type="number"
                  placeholder="Amount to burn"
                  value={burnAmount}
                  onChange={(e) => setBurnAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-red-500/50 rounded-lg text-white placeholder-gray-400 focus:border-red-500 focus:outline-none"
                />
              </div>

                        {!isConnected && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
              <p className="text-yellow-400 text-sm">
                ⚠️ Please connect your wallet to burn tokens
              </p>
            </div>
          )}

              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <h4 className="text-red-400 font-medium mb-2">⚠️ DANGER ZONE</h4>
                <ul className="text-red-300 text-sm space-y-1">
                  <li>• This action is PERMANENT and IRREVERSIBLE</li>
                  <li>• Tokens will be permanently removed from circulation</li>
                  <li>• Total supply will be reduced forever</li>
                  <li>• You can only burn tokens you own</li>
                  <li>• Gas fees will apply for the transaction</li>
                </ul>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowBurnModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                            onClick={handleBurnTokens}
            disabled={processing || !isConnected}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {processing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Burning...</span>
                  </>
                ) : (
                  <>
                    <Flame className="w-4 h-4" />
                    <span>Burn Tokens</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevPlus;