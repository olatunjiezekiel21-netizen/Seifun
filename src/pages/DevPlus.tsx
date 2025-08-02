import React, { useState } from 'react';
import { 
  Code, 
  Shield, 
  Users, 
  TrendingUp, 
  Settings, 
  Plus, 
  Search, 
  AlertTriangle, 
  Gift, 
  BarChart3, 
  Zap, 
  Database,
  Eye,
  Heart,
  MessageCircle,
  ArrowUpRight,
  Clock,
  DollarSign,
  Activity
} from 'lucide-react';

interface TokenWatch {
  id: string;
  tokenName: string;
  tokenSymbol: string;
  address: string;
  price: string;
  change24h: string;
  volume24h: string;
  marketCap: string;
  alerts: string[];
  lastUpdated: Date;
}

interface BadActor {
  id: string;
  address: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  suspiciousActivity: string[];
  tokensAffected: number;
  totalVolume: string;
  firstDetected: Date;
  lastActivity: Date;
}

interface Airdrop {
  id: string;
  name: string;
  tokenSymbol: string;
  totalAmount: string;
  recipients: number;
  status: 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'FAILED';
  startDate: Date;
  endDate: Date;
  criteria: string[];
}

interface DevMetrics {
  totalTokens: number;
  activeWatches: number;
  badActorsDetected: number;
  airdropsCompleted: number;
  totalVolume: string;
  averageScore: number;
}

const DevPlus = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'watch' | 'badactors' | 'airdrops' | 'tools'>('dashboard');
  const [watchedTokens, setWatchedTokens] = useState<TokenWatch[]>([]);
  const [badActors, setBadActors] = useState<BadActor[]>([]);
  const [airdrops, setAirdrops] = useState<Airdrop[]>([]);
  const [metrics, setMetrics] = useState<DevMetrics>({
    totalTokens: 1247,
    activeWatches: 23,
    badActorsDetected: 8,
    airdropsCompleted: 45,
    totalVolume: '$2.4M',
    averageScore: 87
  });

  // Mock data
  React.useEffect(() => {
    setWatchedTokens([
      {
        id: '1',
        tokenName: 'SeiMoon',
        tokenSymbol: 'MOON',
        address: '0x1234...5678',
        price: '$0.00234',
        change24h: '+156.7%',
        volume24h: '$45,230',
        marketCap: '$2.34M',
        alerts: ['Price spike detected', 'Unusual volume'],
        lastUpdated: new Date()
      },
      {
        id: '2',
        tokenName: 'SafeRocket',
        tokenSymbol: 'ROCKET',
        address: '0x8765...4321',
        price: '$0.00156',
        change24h: '+89.2%',
        volume24h: '$32,150',
        marketCap: '$1.56M',
        alerts: ['New holder threshold reached'],
        lastUpdated: new Date(Date.now() - 1000 * 60 * 30)
      }
    ]);

    setBadActors([
      {
        id: '1',
        address: '0xabcd...efgh',
        riskLevel: 'HIGH',
        suspiciousActivity: ['Rug pull pattern', 'Multiple failed transactions'],
        tokensAffected: 3,
        totalVolume: '$125K',
        firstDetected: new Date(Date.now() - 1000 * 60 * 60 * 24),
        lastActivity: new Date()
      },
      {
        id: '2',
        address: '0xijkl...mnop',
        riskLevel: 'CRITICAL',
        suspiciousActivity: ['Honeypot detection', 'Owner transfer blocked'],
        tokensAffected: 1,
        totalVolume: '$45K',
        firstDetected: new Date(Date.now() - 1000 * 60 * 60 * 12),
        lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2)
      }
    ]);

    setAirdrops([
      {
        id: '1',
        name: 'SeiMoon Community Airdrop',
        tokenSymbol: 'MOON',
        totalAmount: '1,000,000 MOON',
        recipients: 500,
        status: 'ACTIVE',
        startDate: new Date(Date.now() - 1000 * 60 * 60 * 24),
        endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        criteria: ['Hold SEI for 30+ days', 'Minimum 100 SEI balance']
      },
      {
        id: '2',
        name: 'Early Adopters Reward',
        tokenSymbol: 'ROCKET',
        totalAmount: '500,000 ROCKET',
        recipients: 250,
        status: 'COMPLETED',
        startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
        endDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
        criteria: ['First 1000 users', 'Completed KYC']
      }
    ]);
  }, []);

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4 rounded-xl">
          <div className="text-2xl font-bold">{metrics.totalTokens}</div>
          <div className="text-sm opacity-90">Total Tokens</div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-xl">
          <div className="text-2xl font-bold">{metrics.activeWatches}</div>
          <div className="text-sm opacity-90">Active Watches</div>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-4 rounded-xl">
          <div className="text-2xl font-bold">{metrics.badActorsDetected}</div>
          <div className="text-sm opacity-90">Bad Actors</div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-violet-500 text-white p-4 rounded-xl">
          <div className="text-2xl font-bold">{metrics.airdropsCompleted}</div>
          <div className="text-sm opacity-90">Airdrops</div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white p-4 rounded-xl">
          <div className="text-2xl font-bold">{metrics.totalVolume}</div>
          <div className="text-sm opacity-90">Total Volume</div>
        </div>
        <div className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white p-4 rounded-xl">
          <div className="text-2xl font-bold">{metrics.averageScore}</div>
          <div className="text-sm opacity-90">Avg Score</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <Plus className="w-5 h-5 text-blue-500" />
            <span>Quick Actions</span>
          </h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
              <span>Add Token Watch</span>
              <Eye className="w-4 h-4" />
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
              <span>Create Airdrop</span>
              <Gift className="w-4 h-4" />
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors">
              <span>Scan Bad Actors</span>
              <AlertTriangle className="w-4 h-4" />
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
              <span>Deploy Contract</span>
              <Code className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <Activity className="w-5 h-5 text-green-500" />
            <span>Recent Activity</span>
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">New token detected</div>
                <div className="text-sm text-gray-500">SeiMoon added to watchlist</div>
              </div>
              <Clock className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">Bad actor alert</div>
                <div className="text-sm text-gray-500">Suspicious activity detected</div>
              </div>
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">Airdrop completed</div>
                <div className="text-sm text-gray-500">500 recipients received tokens</div>
              </div>
              <Gift className="w-4 h-4 text-green-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderWatch = () => (
    <div className="space-y-6">
      {/* Add Token Watch Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Add Token to Watchlist</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Token address"
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Alert threshold"
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors">
            Add Watch
          </button>
        </div>
      </div>

      {/* Watched Tokens */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Watched Tokens</h3>
        <div className="space-y-4">
          {watchedTokens.map((token) => (
            <div key={token.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold">{token.tokenName}</h4>
                    <span className="text-sm text-gray-500">({token.tokenSymbol})</span>
                  </div>
                  <p className="text-sm text-gray-500">{token.address}</p>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{token.price}</div>
                  <div className={`text-sm ${
                    token.change24h.includes('+') ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {token.change24h}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-gray-100">
                <div>
                  <div className="text-sm text-gray-500">Volume 24h</div>
                  <div className="font-medium">{token.volume24h}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Market Cap</div>
                  <div className="font-medium">{token.marketCap}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Alerts</div>
                  <div className="font-medium text-red-600">{token.alerts.length}</div>
                </div>
              </div>
              {token.alerts.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="text-sm text-gray-500 mb-2">Active Alerts:</div>
                  <div className="space-y-1">
                    {token.alerts.map((alert, index) => (
                      <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        {alert}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBadActors = () => (
    <div className="space-y-6">
      {/* Scan Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Scan for Bad Actors</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <select className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option>All Networks</option>
            <option>Sei Mainnet</option>
            <option>Sei Testnet</option>
          </select>
          <select className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option>All Risk Levels</option>
            <option>Critical Only</option>
            <option>High & Critical</option>
          </select>
          <button className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors">
            Start Scan
          </button>
        </div>
      </div>

      {/* Bad Actors List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Detected Bad Actors</h3>
        <div className="space-y-4">
          {badActors.map((actor) => (
            <div key={actor.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold">{actor.address}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      actor.riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                      actor.riskLevel === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                      actor.riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {actor.riskLevel}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {actor.tokensAffected} tokens affected • {actor.totalVolume} volume
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">
                    First detected: {actor.firstDetected.toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    Last activity: {actor.lastActivity.toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="text-sm text-gray-500 mb-2">Suspicious Activities:</div>
                <div className="space-y-1">
                  {actor.suspiciousActivity.map((activity, index) => (
                    <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      {activity}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAirdrops = () => (
    <div className="space-y-6">
      {/* Create Airdrop Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Create New Airdrop</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Airdrop name"
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Token symbol"
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Total amount"
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="number"
            placeholder="Number of recipients"
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="date"
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="date"
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="md:col-span-2">
            <textarea
              placeholder="Criteria (one per line)"
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="md:col-span-2">
            <button className="w-full bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors">
              Create Airdrop
            </button>
          </div>
        </div>
      </div>

      {/* Airdrops List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Active Airdrops</h3>
        <div className="space-y-4">
          {airdrops.map((airdrop) => (
            <div key={airdrop.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold">{airdrop.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      airdrop.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      airdrop.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                      airdrop.status === 'PLANNING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {airdrop.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {airdrop.totalAmount} • {airdrop.recipients} recipients
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">
                    Start: {airdrop.startDate.toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    End: {airdrop.endDate.toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="text-sm text-gray-500 mb-2">Criteria:</div>
                <div className="space-y-1">
                  {airdrop.criteria.map((criterion, index) => (
                    <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                      {criterion}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTools = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Liquidity Management */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            <span>Liquidity Management</span>
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Token address"
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Amount"
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button className="w-full bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors">
              Add Liquidity
            </button>
          </div>
        </div>

        {/* Contract Deployment */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <Code className="w-5 h-5 text-blue-500" />
            <span>Contract Deployment</span>
          </h3>
          <div className="space-y-4">
            <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>Select Contract Type</option>
              <option>ERC-20 Token</option>
              <option>Staking Contract</option>
              <option>Vesting Contract</option>
              <option>Custom Contract</option>
            </select>
            <button className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors">
              Deploy Contract
            </button>
          </div>
        </div>

        {/* Analytics Dashboard */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-purple-500" />
            <span>Analytics Dashboard</span>
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-purple-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">24</div>
                <div className="text-sm text-purple-600">Active Tokens</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">$1.2M</div>
                <div className="text-sm text-green-600">Total Volume</div>
              </div>
            </div>
            <button className="w-full bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 transition-colors">
              View Full Analytics
            </button>
          </div>
        </div>

        {/* Security Scanner */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <Shield className="w-5 h-5 text-red-500" />
            <span>Security Scanner</span>
          </h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Contract address to scan"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button className="w-full bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors">
              Scan Contract
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-500 via-blue-500 to-red-500 bg-clip-text text-transparent mb-2">
              Dev Plus
            </h1>
            <p className="text-gray-600 text-lg">
              Advanced developer tools for token management, security monitoring, and blockchain analytics
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 py-4">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'watch', label: 'Token Watch', icon: Eye },
              { id: 'badactors', label: 'Bad Actors', icon: AlertTriangle },
              { id: 'airdrops', label: 'Airdrops', icon: Gift },
              { id: 'tools', label: 'Developer Tools', icon: Code }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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