import React, { useState, useEffect } from 'react';
import { 
  Code, 
  Shield, 
  Users, 
  Gift, 
  Eye, 
  AlertTriangle, 
  Settings, 
  BarChart3,
  Plus,
  Trash2,
  Edit,
  Play,
  Pause,
  RefreshCw,
  Download,
  Upload,
  Search,
  Filter,
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Info,
  Zap,
  Target,
  Activity,
  Database,
  Lock,
  Unlock
} from 'lucide-react';

interface TokenWatch {
  id: string;
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  watchType: 'price' | 'volume' | 'holders' | 'transactions';
  threshold: string;
  status: 'active' | 'paused' | 'triggered';
  lastAlert: Date;
  alerts: number;
}

interface BadActor {
  id: string;
  address: string;
  name: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  flags: string[];
  firstSeen: Date;
  lastActivity: Date;
  tokensAffected: number;
  totalDamage: string;
}

interface Airdrop {
  id: string;
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  amount: string;
  recipients: number;
  status: 'pending' | 'active' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
}

interface DevMetrics {
  watchedTokens: number;
  activeAlerts: number;
  badActorsDetected: number;
  airdropsCompleted: number;
  totalValueProtected: string;
  averageResponseTime: string;
}

const DevPlus = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'watch' | 'badactors' | 'airdrops' | 'tools'>('dashboard');
  const [watchedTokens, setWatchedTokens] = useState<TokenWatch[]>([]);
  const [badActors, setBadActors] = useState<BadActor[]>([]);
  const [airdrops, setAirdrops] = useState<Airdrop[]>([]);
  const [metrics, setMetrics] = useState<DevMetrics>({
    watchedTokens: 24,
    activeAlerts: 7,
    badActorsDetected: 12,
    airdropsCompleted: 156,
    totalValueProtected: '$2.4M',
    averageResponseTime: '2.3s'
  });

  useEffect(() => {
    // Simulate data loading
    const mockWatchedTokens: TokenWatch[] = [
      {
        id: '1',
        tokenAddress: '0x1234567890abcdef',
        tokenName: 'SafeMoon',
        tokenSymbol: 'SAFE',
        watchType: 'price',
        threshold: '$0.001',
        status: 'active',
        lastAlert: new Date(Date.now() - 2 * 60 * 60 * 1000),
        alerts: 3
      },
      {
        id: '2',
        tokenAddress: '0xabcdef1234567890',
        tokenName: 'RocketToken',
        tokenSymbol: 'ROCKET',
        watchType: 'volume',
        threshold: '1000 SEI',
        status: 'triggered',
        lastAlert: new Date(Date.now() - 30 * 60 * 1000),
        alerts: 1
      }
    ];

    const mockBadActors: BadActor[] = [
      {
        id: '1',
        address: '0x742d35Cc6635C0532925a3b8D41c4e9E4532D3eE',
        name: 'Suspicious Trader #1',
        riskLevel: 'high',
        flags: ['Wash Trading', 'Price Manipulation', 'Multiple Accounts'],
        firstSeen: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
        tokensAffected: 5,
        totalDamage: '$45,230'
      },
      {
        id: '2',
        address: '0x966CBf1baa5C08e4458f08A4CF1ECbb6Ae50894e',
        name: 'Rug Pull Artist',
        riskLevel: 'critical',
        flags: ['Rug Pull', 'Liquidity Removal', 'Contract Pause'],
        firstSeen: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        tokensAffected: 3,
        totalDamage: '$123,450'
      }
    ];

    const mockAirdrops: Airdrop[] = [
      {
        id: '1',
        tokenAddress: '0x1234567890abcdef',
        tokenName: 'Community Token',
        tokenSymbol: 'COMM',
        amount: '1000 COMM',
        recipients: 250,
        status: 'completed',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 23 * 60 * 60 * 1000)
      },
      {
        id: '2',
        tokenAddress: '0xabcdef1234567890',
        tokenName: 'Reward Token',
        tokenSymbol: 'REWARD',
        amount: '500 REWARD',
        recipients: 100,
        status: 'active',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      }
    ];

    setWatchedTokens(mockWatchedTokens);
    setBadActors(mockBadActors);
    setAirdrops(mockAirdrops);
  }, []);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-500 bg-green-50';
      case 'medium': return 'text-yellow-500 bg-yellow-50';
      case 'high': return 'text-orange-500 bg-orange-50';
      case 'critical': return 'text-red-500 bg-red-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500 bg-green-50';
      case 'paused': return 'text-yellow-500 bg-yellow-50';
      case 'triggered': return 'text-red-500 bg-red-50';
      case 'pending': return 'text-blue-500 bg-blue-50';
      case 'completed': return 'text-green-500 bg-green-50';
      case 'failed': return 'text-red-500 bg-red-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="sei-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm sei-text-secondary">Watched Tokens</p>
              <p className="text-2xl font-bold sei-text-primary">{metrics.watchedTokens}</p>
            </div>
            <Eye className="w-8 h-8 sei-text-muted" />
          </div>
        </div>
        
        <div className="sei-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm sei-text-secondary">Active Alerts</p>
              <p className="text-2xl font-bold sei-text-primary">{metrics.activeAlerts}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        
        <div className="sei-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm sei-text-secondary">Bad Actors Detected</p>
              <p className="text-2xl font-bold sei-text-primary">{metrics.badActorsDetected}</p>
            </div>
            <Shield className="w-8 h-8 text-red-500" />
          </div>
        </div>
        
        <div className="sei-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm sei-text-secondary">Airdrops Completed</p>
              <p className="text-2xl font-bold sei-text-primary">{metrics.airdropsCompleted}</p>
            </div>
            <Gift className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="sei-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm sei-text-secondary">Value Protected</p>
              <p className="text-2xl font-bold sei-text-primary">{metrics.totalValueProtected}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="sei-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm sei-text-secondary">Avg Response Time</p>
              <p className="text-2xl font-bold sei-text-primary">{metrics.averageResponseTime}</p>
            </div>
            <Clock className="w-8 h-8 sei-text-muted" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="sei-card p-6">
        <h3 className="text-lg font-semibold sei-text-primary mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="sei-btn sei-btn-primary flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Token Watch</span>
          </button>
          
          <button className="sei-btn sei-btn-secondary flex items-center space-x-2">
            <Gift className="w-4 h-4" />
            <span>Create Airdrop</span>
          </button>
          
          <button className="sei-btn sei-btn-secondary flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>Scan Bad Actors</span>
          </button>
          
          <button className="sei-btn sei-btn-secondary flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="sei-card p-6">
          <h3 className="text-lg font-semibold sei-text-primary mb-4">Recent Alerts</h3>
          <div className="space-y-3">
            {watchedTokens.filter(t => t.status === 'triggered').map((token) => (
              <div key={token.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="font-medium sei-text-primary">{token.tokenSymbol}</p>
                  <p className="text-sm sei-text-secondary">{token.watchType} threshold exceeded</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-red-500">{token.alerts} alerts</p>
                  <p className="text-xs sei-text-secondary">
                    {new Date(token.lastAlert).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sei-card p-6">
          <h3 className="text-lg font-semibold sei-text-primary mb-4">Recent Airdrops</h3>
          <div className="space-y-3">
            {airdrops.slice(0, 3).map((airdrop) => (
              <div key={airdrop.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium sei-text-primary">{airdrop.tokenSymbol}</p>
                  <p className="text-sm sei-text-secondary">{airdrop.recipients} recipients</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(airdrop.status)}`}>
                    {airdrop.status}
                  </span>
                  <p className="text-xs sei-text-secondary mt-1">
                    {new Date(airdrop.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderWatch = () => (
    <div className="space-y-6">
      {/* Add New Watch */}
      <div className="sei-card p-6">
        <h3 className="text-lg font-semibold sei-text-primary mb-4">Add Token Watch</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Token Address"
            className="sei-input"
          />
          <select className="sei-input">
            <option>Price</option>
            <option>Volume</option>
            <option>Holders</option>
            <option>Transactions</option>
          </select>
          <input
            type="text"
            placeholder="Threshold"
            className="sei-input"
          />
          <button className="sei-btn sei-btn-primary">
            <Plus className="w-4 h-4" />
            Add Watch
          </button>
        </div>
      </div>

      {/* Watched Tokens */}
      <div className="sei-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium sei-text-secondary uppercase tracking-wider">Token</th>
                <th className="px-6 py-3 text-left text-xs font-medium sei-text-secondary uppercase tracking-wider">Watch Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium sei-text-secondary uppercase tracking-wider">Threshold</th>
                <th className="px-6 py-3 text-left text-xs font-medium sei-text-secondary uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium sei-text-secondary uppercase tracking-wider">Alerts</th>
                <th className="px-6 py-3 text-left text-xs font-medium sei-text-secondary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {watchedTokens.map((token) => (
                <tr key={token.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {token.tokenSymbol.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <div className="font-medium sei-text-primary">{token.tokenSymbol}</div>
                        <div className="text-sm sei-text-secondary">{token.tokenName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="capitalize">{token.watchType}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="sei-text-primary">{token.threshold}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(token.status)}`}>
                      {token.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="sei-text-primary">{token.alerts}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button className="sei-btn sei-btn-ghost">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="sei-btn sei-btn-ghost">
                        <Pause className="w-4 h-4" />
                      </button>
                      <button className="sei-btn sei-btn-ghost text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderBadActors = () => (
    <div className="space-y-6">
      {/* Bad Actors List */}
      <div className="sei-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium sei-text-secondary uppercase tracking-wider">Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium sei-text-secondary uppercase tracking-wider">Risk Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium sei-text-secondary uppercase tracking-wider">Flags</th>
                <th className="px-6 py-3 text-left text-xs font-medium sei-text-secondary uppercase tracking-wider">Tokens Affected</th>
                <th className="px-6 py-3 text-left text-xs font-medium sei-text-secondary uppercase tracking-wider">Total Damage</th>
                <th className="px-6 py-3 text-left text-xs font-medium sei-text-secondary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {badActors.map((actor) => (
                <tr key={actor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium sei-text-primary">{actor.name}</div>
                      <div className="text-sm sei-text-secondary font-mono">{actor.address}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-xs px-2 py-1 rounded-full ${getRiskColor(actor.riskLevel)}`}>
                      {actor.riskLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {actor.flags.map((flag, index) => (
                        <span key={index} className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">
                          {flag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="sei-text-primary">{actor.tokensAffected}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="sei-text-primary">{actor.totalDamage}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button className="sei-btn sei-btn-ghost">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="sei-btn sei-btn-ghost">
                        <AlertTriangle className="w-4 h-4" />
                      </button>
                      <button className="sei-btn sei-btn-ghost">
                        <Lock className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAirdrops = () => (
    <div className="space-y-6">
      {/* Create Airdrop */}
      <div className="sei-card p-6">
        <h3 className="text-lg font-semibold sei-text-primary mb-4">Create New Airdrop</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Token Address"
            className="sei-input"
          />
          <input
            type="text"
            placeholder="Amount per recipient"
            className="sei-input"
          />
          <input
            type="number"
            placeholder="Number of recipients"
            className="sei-input"
          />
          <button className="sei-btn sei-btn-primary">
            <Gift className="w-4 h-4" />
            Create Airdrop
          </button>
        </div>
      </div>

      {/* Airdrops List */}
      <div className="sei-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium sei-text-secondary uppercase tracking-wider">Token</th>
                <th className="px-6 py-3 text-left text-xs font-medium sei-text-secondary uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium sei-text-secondary uppercase tracking-wider">Recipients</th>
                <th className="px-6 py-3 text-left text-xs font-medium sei-text-secondary uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium sei-text-secondary uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium sei-text-secondary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {airdrops.map((airdrop) => (
                <tr key={airdrop.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {airdrop.tokenSymbol.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <div className="font-medium sei-text-primary">{airdrop.tokenSymbol}</div>
                        <div className="text-sm sei-text-secondary">{airdrop.tokenName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="sei-text-primary">{airdrop.amount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="sei-text-primary">{airdrop.recipients}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(airdrop.status)}`}>
                      {airdrop.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="sei-text-primary">
                      {new Date(airdrop.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button className="sei-btn sei-btn-ghost">
                        <Play className="w-4 h-4" />
                      </button>
                      <button className="sei-btn sei-btn-ghost">
                        <Pause className="w-4 h-4" />
                      </button>
                      <button className="sei-btn sei-btn-ghost">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTools = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Token Scanner */}
        <div className="sei-card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-8 h-8 text-blue-500" />
            <h3 className="text-lg font-semibold sei-text-primary">Token Scanner</h3>
          </div>
          <p className="sei-text-secondary mb-4">Scan tokens for security vulnerabilities and potential risks</p>
          <button className="sei-btn sei-btn-primary w-full">
            <Search className="w-4 h-4" />
            Scan Token
          </button>
        </div>

        {/* Liquidity Manager */}
        <div className="sei-card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <DollarSign className="w-8 h-8 text-green-500" />
            <h3 className="text-lg font-semibold sei-text-primary">Liquidity Manager</h3>
          </div>
          <p className="sei-text-secondary mb-4">Manage liquidity pools and monitor liquidity health</p>
          <button className="sei-btn sei-btn-secondary w-full">
            <BarChart3 className="w-4 h-4" />
            Manage Liquidity
          </button>
        </div>

        {/* Contract Deployer */}
        <div className="sei-card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Code className="w-8 h-8 text-purple-500" />
            <h3 className="text-lg font-semibold sei-text-primary">Contract Deployer</h3>
          </div>
          <p className="sei-text-secondary mb-4">Deploy and verify smart contracts on Sei network</p>
          <button className="sei-btn sei-btn-secondary w-full">
            <Upload className="w-4 h-4" />
            Deploy Contract
          </button>
        </div>

        {/* Analytics Dashboard */}
        <div className="sei-card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <BarChart3 className="w-8 h-8 text-orange-500" />
            <h3 className="text-lg font-semibold sei-text-primary">Analytics Dashboard</h3>
          </div>
          <p className="sei-text-secondary mb-4">Advanced analytics and performance metrics</p>
          <button className="sei-btn sei-btn-secondary w-full">
            <TrendingUp className="w-4 h-4" />
            View Analytics
          </button>
        </div>

        {/* Security Monitor */}
        <div className="sei-card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <h3 className="text-lg font-semibold sei-text-primary">Security Monitor</h3>
          </div>
          <p className="sei-text-secondary mb-4">Monitor security threats and suspicious activities</p>
          <button className="sei-btn sei-btn-secondary w-full">
            <Eye className="w-4 h-4" />
            Monitor Security
          </button>
        </div>

        {/* API Manager */}
        <div className="sei-card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Database className="w-8 h-8 text-indigo-500" />
            <h3 className="text-lg font-semibold sei-text-primary">API Manager</h3>
          </div>
          <p className="sei-text-secondary mb-4">Manage API keys and integrations</p>
          <button className="sei-btn sei-btn-secondary w-full">
            <Settings className="w-4 h-4" />
            Manage APIs
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-20 sei-bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold sei-text-primary">Dev Plus</h1>
              <p className="sei-text-secondary">Advanced developer tools for token management and security</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="sei-btn sei-btn-secondary">
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <button className="sei-btn sei-btn-primary">
                <Code className="w-4 h-4" />
                Documentation
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white rounded-lg p-1 mb-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'watch', label: 'Token Watch', icon: Eye },
            { id: 'badactors', label: 'Bad Actors', icon: AlertTriangle },
            { id: 'airdrops', label: 'Airdrops', icon: Gift },
            { id: 'tools', label: 'Tools', icon: Code }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'sei-bg-red text-white'
                    : 'sei-text-secondary hover:sei-text-primary'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'watch' && renderWatch()}
        {activeTab === 'badactors' && renderBadActors()}
        {activeTab === 'airdrops' && renderAirdrops()}
        {activeTab === 'tools' && renderTools()}
      </div>
    </div>
  );
};

export default DevPlus;