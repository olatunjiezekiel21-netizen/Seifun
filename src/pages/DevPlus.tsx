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
        <div className="sei-card p-4">
          <div className="text-2xl font-bold sei-text-primary">{metrics.totalTokens}</div>
          <div className="text-sm sei-text-muted">Total Tokens</div>
        </div>
        <div className="sei-card p-4">
          <div className="text-2xl font-bold sei-text-primary">{metrics.activeWatches}</div>
          <div className="text-sm sei-text-muted">Active Watches</div>
        </div>
        <div className="sei-card p-4">
          <div className="text-2xl font-bold sei-text-primary">{metrics.badActorsDetected}</div>
          <div className="text-sm sei-text-muted">Bad Actors</div>
        </div>
        <div className="sei-card p-4">
          <div className="text-2xl font-bold sei-text-primary">{metrics.airdropsCompleted}</div>
          <div className="text-sm sei-text-muted">Airdrops</div>
        </div>
        <div className="sei-card p-4">
          <div className="text-2xl font-bold sei-text-primary">{metrics.totalVolume}</div>
          <div className="text-sm sei-text-muted">Total Volume</div>
        </div>
        <div className="sei-card p-4">
          <div className="text-2xl font-bold sei-text-primary">{metrics.averageScore}</div>
          <div className="text-sm sei-text-muted">Avg Score</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="sei-card p-6">
          <h3 className="sei-heading-md mb-4 flex items-center space-x-2">
            <Plus className="w-5 h-5 sei-accent" />
            <span>Quick Actions</span>
          </h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 sei-bg-tertiary sei-text-primary rounded-lg hover:bg-gray-700 transition-colors">
              <span>Add Token Watch</span>
              <Eye className="w-4 h-4" />
            </button>
            <button className="w-full flex items-center justify-between p-3 sei-bg-tertiary sei-text-primary rounded-lg hover:bg-gray-700 transition-colors">
              <span>Create Airdrop</span>
              <Gift className="w-4 h-4" />
            </button>
            <button className="w-full flex items-center justify-between p-3 sei-bg-tertiary sei-text-primary rounded-lg hover:bg-gray-700 transition-colors">
              <span>Scan Bad Actors</span>
              <AlertTriangle className="w-4 h-4" />
            </button>
            <button className="w-full flex items-center justify-between p-3 sei-bg-tertiary sei-text-primary rounded-lg hover:bg-gray-700 transition-colors">
              <span>Deploy Contract</span>
              <Code className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="sei-card p-6">
          <h3 className="sei-heading-md mb-4 flex items-center space-x-2">
            <Activity className="w-5 h-5 sei-accent" />
            <span>Recent Activity</span>
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 sei-bg-tertiary rounded-lg">
              <div>
                <div className="font-medium sei-text-primary">New token detected</div>
                <div className="text-sm sei-text-muted">SeiMoon added to watchlist</div>
              </div>
              <Clock className="w-4 h-4 sei-text-muted" />
            </div>
            <div className="flex items-center justify-between p-3 sei-bg-tertiary rounded-lg">
              <div>
                <div className="font-medium sei-text-primary">Bad actor alert</div>
                <div className="text-sm sei-text-muted">Suspicious activity detected</div>
              </div>
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <div className="flex items-center justify-between p-3 sei-bg-tertiary rounded-lg">
              <div>
                <div className="font-medium sei-text-primary">Airdrop completed</div>
                <div className="text-sm sei-text-muted">500 recipients received tokens</div>
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
      <div className="sei-card p-6">
        <h3 className="sei-heading-md mb-4">Add Token to Watchlist</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Token address"
            className="sei-input"
          />
          <input
            type="text"
            placeholder="Alert threshold"
            className="sei-input"
          />
          <button className="sei-btn sei-btn-primary">
            Add Watch
          </button>
        </div>
      </div>

      {/* Watched Tokens */}
      <div className="sei-card p-6">
        <h3 className="sei-heading-md mb-4">Watched Tokens</h3>
        <div className="space-y-4">
          {watchedTokens.map((token) => (
            <div key={token.id} className="sei-bg-tertiary rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold sei-text-primary">{token.tokenName}</h4>
                    <span className="text-sm sei-text-muted">({token.tokenSymbol})</span>
                  </div>
                  <p className="text-sm sei-text-muted">{token.address}</p>
                </div>
                <div className="text-right">
                  <div className="font-semibold sei-text-primary">{token.price}</div>
                  <div className={`text-sm ${
                    token.change24h.includes('+') ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {token.change24h}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-gray-600">
                <div>
                  <div className="text-sm sei-text-muted">Volume 24h</div>
                  <div className="font-medium sei-text-primary">{token.volume24h}</div>
                </div>
                <div>
                  <div className="text-sm sei-text-muted">Market Cap</div>
                  <div className="font-medium sei-text-primary">{token.marketCap}</div>
                </div>
                <div>
                  <div className="text-sm sei-text-muted">Alerts</div>
                  <div className="font-medium text-red-500">{token.alerts.length}</div>
                </div>
              </div>
              {token.alerts.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-600">
                  <div className="text-sm sei-text-muted mb-2">Active Alerts:</div>
                  <div className="space-y-1">
                    {token.alerts.map((alert, index) => (
                      <div key={index} className="text-sm text-red-500 bg-red-900/20 p-2 rounded">
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
      <div className="sei-card p-6">
        <h3 className="sei-heading-md mb-4">Scan for Bad Actors</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <select className="sei-input">
            <option>All Networks</option>
            <option>Sei Mainnet</option>
            <option>Sei Testnet</option>
          </select>
          <select className="sei-input">
            <option>All Risk Levels</option>
            <option>Critical Only</option>
            <option>High & Critical</option>
          </select>
          <button className="sei-btn sei-btn-primary">
            Start Scan
          </button>
        </div>
      </div>

      {/* Bad Actors List */}
      <div className="sei-card p-6">
        <h3 className="sei-heading-md mb-4">Detected Bad Actors</h3>
        <div className="space-y-4">
          {badActors.map((actor) => (
            <div key={actor.id} className="sei-bg-tertiary rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold sei-text-primary">{actor.address}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      actor.riskLevel === 'CRITICAL' ? 'bg-red-900/20 text-red-400' :
                      actor.riskLevel === 'HIGH' ? 'bg-orange-900/20 text-orange-400' :
                      actor.riskLevel === 'MEDIUM' ? 'bg-yellow-900/20 text-yellow-400' :
                      'bg-green-900/20 text-green-400'
                    }`}>
                      {actor.riskLevel}
                    </span>
                  </div>
                  <p className="text-sm sei-text-muted">
                    {actor.tokensAffected} tokens affected • {actor.totalVolume} volume
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm sei-text-muted">
                    First detected: {actor.firstDetected.toLocaleDateString()}
                  </div>
                  <div className="text-sm sei-text-muted">
                    Last activity: {actor.lastActivity.toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-600">
                <div className="text-sm sei-text-muted mb-2">Suspicious Activities:</div>
                <div className="space-y-1">
                  {actor.suspiciousActivity.map((activity, index) => (
                    <div key={index} className="text-sm text-red-500 bg-red-900/20 p-2 rounded">
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
      <div className="sei-card p-6">
        <h3 className="sei-heading-md mb-4">Create New Airdrop</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Airdrop name"
            className="sei-input"
          />
          <input
            type="text"
            placeholder="Token symbol"
            className="sei-input"
          />
          <input
            type="text"
            placeholder="Total amount"
            className="sei-input"
          />
          <input
            type="number"
            placeholder="Number of recipients"
            className="sei-input"
          />
          <input
            type="date"
            className="sei-input"
          />
          <input
            type="date"
            className="sei-input"
          />
          <div className="md:col-span-2">
            <textarea
              placeholder="Criteria (one per line)"
              rows={3}
              className="sei-input"
            />
          </div>
          <div className="md:col-span-2">
            <button className="w-full sei-btn sei-btn-primary">
              Create Airdrop
            </button>
          </div>
        </div>
      </div>

      {/* Airdrops List */}
      <div className="sei-card p-6">
        <h3 className="sei-heading-md mb-4">Active Airdrops</h3>
        <div className="space-y-4">
          {airdrops.map((airdrop) => (
            <div key={airdrop.id} className="sei-bg-tertiary rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold sei-text-primary">{airdrop.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      airdrop.status === 'ACTIVE' ? 'bg-green-900/20 text-green-400' :
                      airdrop.status === 'COMPLETED' ? 'bg-blue-900/20 text-blue-400' :
                      airdrop.status === 'PLANNING' ? 'bg-yellow-900/20 text-yellow-400' :
                      'bg-red-900/20 text-red-400'
                    }`}>
                      {airdrop.status}
                    </span>
                  </div>
                  <p className="text-sm sei-text-muted">
                    {airdrop.totalAmount} • {airdrop.recipients} recipients
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm sei-text-muted">
                    Start: {airdrop.startDate.toLocaleDateString()}
                  </div>
                  <div className="text-sm sei-text-muted">
                    End: {airdrop.endDate.toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-600">
                <div className="text-sm sei-text-muted mb-2">Criteria:</div>
                <div className="space-y-1">
                  {airdrop.criteria.map((criterion, index) => (
                    <div key={index} className="text-sm sei-bg-primary p-2 rounded">
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
        <div className="sei-card p-6">
          <h3 className="sei-heading-md mb-4 flex items-center space-x-2">
            <DollarSign className="w-5 h-5 sei-accent" />
            <span>Liquidity Management</span>
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Token address"
                className="sei-input"
              />
              <input
                type="text"
                placeholder="Amount"
                className="sei-input"
              />
            </div>
            <button className="w-full sei-btn sei-btn-primary">
              Add Liquidity
            </button>
          </div>
        </div>

        {/* Contract Deployment */}
        <div className="sei-card p-6">
          <h3 className="sei-heading-md mb-4 flex items-center space-x-2">
            <Code className="w-5 h-5 sei-accent" />
            <span>Contract Deployment</span>
          </h3>
          <div className="space-y-4">
            <select className="sei-input">
              <option>Select Contract Type</option>
              <option>ERC-20 Token</option>
              <option>Staking Contract</option>
              <option>Vesting Contract</option>
              <option>Custom Contract</option>
            </select>
            <button className="w-full sei-btn sei-btn-primary">
              Deploy Contract
            </button>
          </div>
        </div>

        {/* Analytics Dashboard */}
        <div className="sei-card p-6">
          <h3 className="sei-heading-md mb-4 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 sei-accent" />
            <span>Analytics Dashboard</span>
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="sei-bg-tertiary p-3 rounded-lg text-center">
                <div className="text-2xl font-bold sei-text-primary">24</div>
                <div className="text-sm sei-text-muted">Active Tokens</div>
              </div>
              <div className="sei-bg-tertiary p-3 rounded-lg text-center">
                <div className="text-2xl font-bold sei-text-primary">$1.2M</div>
                <div className="text-sm sei-text-muted">Total Volume</div>
              </div>
            </div>
            <button className="w-full sei-btn sei-btn-primary">
              View Full Analytics
            </button>
          </div>
        </div>

        {/* Security Scanner */}
        <div className="sei-card p-6">
          <h3 className="sei-heading-md mb-4 flex items-center space-x-2">
            <Shield className="w-5 h-5 sei-accent" />
            <span>Security Scanner</span>
          </h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Contract address to scan"
              className="sei-input"
            />
            <button className="w-full sei-btn sei-btn-primary">
              Scan Contract
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen sei-bg-primary">
      {/* Header */}
      <div className="sei-bg-secondary border-b sei-border">
        <div className="sei-container py-8">
          <div className="text-center">
            <h1 className="sei-heading-xl sei-text-primary mb-4">
              Dev Plus
            </h1>
            <p className="sei-text-lg">
              Advanced developer tools for token management, security monitoring, and blockchain analytics
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="sei-bg-secondary border-b sei-border">
        <div className="sei-container">
          <div className="sei-category-tabs">
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
                className={`sei-category-tab ${
                  activeTab === tab.id ? 'active' : ''
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="sei-container py-8">
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