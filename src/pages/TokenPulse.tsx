import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  TrendingUp, 
  Users, 
  Star, 
  Zap, 
  Eye, 
  Heart, 
  Clock, 
  Award,
  Flame,
  Target,
  BarChart3,
  Timer,
  Sparkles,
  Search,
  Filter,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Percent,
  ArrowUp,
  ArrowDown,
  Settings,
  Calendar,
  PieChart,
  LineChart,
  BarChart,
  Shield
} from 'lucide-react';
import TokenChart from '../components/TokenChart';

interface TokenAnalytics {
  id: string;
  tokenName: string;
  tokenSymbol: string;
  price: string;
  priceChange24h: string;
  volume24h: string;
  marketCap: string;
  holders: number;
  transactions24h: number;
  liquidity: string;
  safetyScore: number;
  createdAt: Date;
}

interface TradingMetrics {
  totalVolume: string;
  totalTransactions: number;
  activeTokens: number;
  averageSafetyScore: number;
  topGainers: number;
  topLosers: number;
}

interface MarketTrend {
  period: string;
  volume: string;
  transactions: number;
  newTokens: number;
  avgPriceChange: string;
}

const TokenPulse = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tokens' | 'trends' | 'analytics'>('overview');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('24h');
  const [tokens, setTokens] = useState<TokenAnalytics[]>([]);
  const [metrics, setMetrics] = useState<TradingMetrics>({
    totalVolume: '$2.4M',
    totalTransactions: 15420,
    activeTokens: 247,
    averageSafetyScore: 78,
    topGainers: 23,
    topLosers: 8
  });
  const [marketTrends, setMarketTrends] = useState<MarketTrend[]>([]);

  // Simulate analytics data
  useEffect(() => {
    const mockTokens: TokenAnalytics[] = [
      {
        id: '1',
        tokenName: 'SeiMoon',
        tokenSymbol: 'MOON',
        price: '$0.00234',
        priceChange24h: '+156.7%',
        volume24h: '$45,230',
        marketCap: '$2.34M',
        holders: 1234,
        transactions24h: 89,
        liquidity: '$12,450',
        safetyScore: 85,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: '2',
        tokenName: 'SafeRocket',
        tokenSymbol: 'ROCKET',
        price: '$0.00156',
        priceChange24h: '+89.2%',
        volume24h: '$32,150',
        marketCap: '$1.56M',
        holders: 892,
        transactions24h: 67,
        liquidity: '$8,920',
        safetyScore: 92,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
      },
      {
        id: '3',
        tokenName: 'DegenCoin',
        tokenSymbol: 'DEGEN',
        price: '$0.00089',
        priceChange24h: '-23.4%',
        volume24h: '$18,750',
        marketCap: '$890K',
        holders: 567,
        transactions24h: 34,
        liquidity: '$5,230',
        safetyScore: 67,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
      }
    ];

    const mockTrends: MarketTrend[] = [
      { period: '24h', volume: '$2.4M', transactions: 15420, newTokens: 12, avgPriceChange: '+12.4%' },
      { period: '7d', volume: '$18.7M', transactions: 98750, newTokens: 89, avgPriceChange: '+8.9%' },
      { period: '30d', volume: '$67.2M', transactions: 324500, newTokens: 234, avgPriceChange: '+15.2%' }
    ];

    setTokens(mockTokens);
    setMarketTrends(mockTrends);
  }, []);

  const getPriceChangeColor = (change: string) => {
    return change.startsWith('+') ? 'text-green-500' : 'text-red-500';
  };

  const getSafetyColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="sei-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm sei-text-secondary">Total Volume</p>
              <p className="text-2xl font-bold sei-text-primary">{metrics.totalVolume}</p>
            </div>
            <DollarSign className="w-8 h-8 sei-text-muted" />
          </div>
        </div>
        
        <div className="sei-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm sei-text-secondary">Transactions</p>
              <p className="text-2xl font-bold sei-text-primary">{metrics.totalTransactions.toLocaleString()}</p>
            </div>
            <Activity className="w-8 h-8 sei-text-muted" />
          </div>
        </div>
        
        <div className="sei-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm sei-text-secondary">Active Tokens</p>
              <p className="text-2xl font-bold sei-text-primary">{metrics.activeTokens}</p>
            </div>
            <Star className="w-8 h-8 sei-text-muted" />
          </div>
        </div>
        
        <div className="sei-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm sei-text-secondary">Avg Safety Score</p>
              <p className="text-2xl font-bold sei-text-primary">{metrics.averageSafetyScore}</p>
            </div>
            <Shield className="w-8 h-8 sei-text-muted" />
          </div>
        </div>
      </div>

      {/* Market Trends Chart */}
      <div className="sei-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold sei-text-primary">Market Trends</h3>
          <div className="flex items-center space-x-2">
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="sei-input text-sm"
            >
              <option value="24h">24h</option>
              <option value="7d">7d</option>
              <option value="30d">30d</option>
              <option value="90d">90d</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {marketTrends.map((trend, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm sei-text-secondary">{trend.period}</p>
              <p className="text-lg font-semibold sei-text-primary">{trend.volume}</p>
              <p className="text-xs sei-text-muted">{trend.transactions.toLocaleString()} tx</p>
            </div>
          ))}
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="sei-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold sei-text-primary">Top Gainers</h3>
            <ArrowUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="space-y-3">
            {tokens.filter(t => t.priceChange24h.startsWith('+')).slice(0, 5).map((token, index) => (
              <div key={token.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-green-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium sei-text-primary">{token.tokenSymbol}</p>
                    <p className="text-xs sei-text-secondary">{token.tokenName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-500">{token.priceChange24h}</p>
                  <p className="text-xs sei-text-secondary">{token.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sei-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold sei-text-primary">Top Losers</h3>
            <ArrowDown className="w-5 h-5 text-red-500" />
          </div>
          <div className="space-y-3">
            {tokens.filter(t => t.priceChange24h.startsWith('-')).slice(0, 5).map((token, index) => (
              <div key={token.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-red-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium sei-text-primary">{token.tokenSymbol}</p>
                    <p className="text-xs sei-text-secondary">{token.tokenName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-500">{token.priceChange24h}</p>
                  <p className="text-xs sei-text-secondary">{token.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTokens = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="sei-card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sei-text-muted" />
              <input
                type="text"
                placeholder="Search tokens..."
                className="w-full pl-10 pr-4 py-2 sei-input"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 sei-text-muted" />
            <select className="sei-input text-sm">
              <option>All Tokens</option>
              <option>Verified Only</option>
              <option>High Volume</option>
            </select>
            <button className="sei-btn sei-btn-secondary">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Tokens Table */}
      <div className="sei-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium sei-text-secondary uppercase tracking-wider">Token</th>
                <th className="px-6 py-3 text-left text-xs font-medium sei-text-secondary uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium sei-text-secondary uppercase tracking-wider">24h Change</th>
                <th className="px-6 py-3 text-left text-xs font-medium sei-text-secondary uppercase tracking-wider">Volume</th>
                <th className="px-6 py-3 text-left text-xs font-medium sei-text-secondary uppercase tracking-wider">Market Cap</th>
                <th className="px-6 py-3 text-left text-xs font-medium sei-text-secondary uppercase tracking-wider">Safety</th>
                <th className="px-6 py-3 text-left text-xs font-medium sei-text-secondary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tokens.map((token) => (
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
                    <div className="font-medium sei-text-primary">{token.price}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`font-medium ${getPriceChangeColor(token.priceChange24h)}`}>
                      {token.priceChange24h}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="sei-text-primary">{token.volume24h}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="sei-text-primary">{token.marketCap}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`font-medium ${getSafetyColor(token.safetyScore)}`}>
                      {token.safetyScore}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button className="sei-btn sei-btn-ghost">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="sei-btn sei-btn-ghost">
                        <BarChart3 className="w-4 h-4" />
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

  const renderTrends = () => (
    <div className="space-y-6">
      <div className="sei-card p-6">
        <h3 className="text-lg font-semibold sei-text-primary mb-4">Market Trends Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-sm sei-text-secondary">Volume Trend</p>
            <p className="text-xl font-bold sei-text-primary">+12.4%</p>
            <p className="text-xs sei-text-muted">vs last period</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm sei-text-secondary">New Holders</p>
            <p className="text-xl font-bold sei-text-primary">+8.7%</p>
            <p className="text-xs sei-text-muted">vs last period</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Star className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-sm sei-text-secondary">New Tokens</p>
            <p className="text-xl font-bold sei-text-primary">+15.2%</p>
            <p className="text-xs sei-text-muted">vs last period</p>
          </div>
        </div>
      </div>

      <div className="sei-card p-6">
        <h3 className="text-lg font-semibold sei-text-primary mb-4">Trading Patterns</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Flame className="w-5 h-5 text-orange-500" />
              <div>
                <p className="font-medium sei-text-primary">High Volume Spikes</p>
                <p className="text-sm sei-text-secondary">Detected in 12 tokens</p>
              </div>
            </div>
            <span className="text-sm font-medium text-orange-500">+23%</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Target className="w-5 h-5 text-blue-500" />
              <div>
                <p className="font-medium sei-text-primary">Price Manipulation</p>
                <p className="text-sm sei-text-secondary">Suspicious activity in 3 tokens</p>
              </div>
            </div>
            <span className="text-sm font-medium text-red-500">-5%</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium sei-text-primary">Healthy Growth</p>
                <p className="text-sm sei-text-secondary">Sustained growth in 45 tokens</p>
              </div>
            </div>
            <span className="text-sm font-medium text-green-500">+18%</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="sei-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold sei-text-primary">Advanced Analytics</h3>
          <button className="sei-btn sei-btn-secondary">
            <RefreshCw className="w-4 h-4" />
            Refresh Data
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium sei-text-primary mb-3">Volume Distribution</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm sei-text-secondary">Top 10 tokens</span>
                <span className="text-sm font-medium sei-text-primary">67%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '67%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm sei-text-secondary">Mid-tier tokens</span>
                <span className="text-sm font-medium sei-text-primary">23%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '23%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm sei-text-secondary">Small tokens</span>
                <span className="text-sm font-medium sei-text-primary">10%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '10%' }}></div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium sei-text-primary mb-3">Safety Score Distribution</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm sei-text-secondary">Safe (80-100)</span>
                <span className="text-sm font-medium text-green-500">45%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm sei-text-secondary">Medium (60-79)</span>
                <span className="text-sm font-medium text-yellow-500">35%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '35%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm sei-text-secondary">Risky (0-59)</span>
                <span className="text-sm font-medium text-red-500">20%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: '20%' }}></div>
              </div>
            </div>
          </div>
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
              <h1 className="text-3xl font-bold sei-text-primary">Token Pulse Analytics</h1>
              <p className="sei-text-secondary">Real-time market analytics and token performance tracking</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="sei-btn sei-btn-secondary">
                <Calendar className="w-4 h-4" />
                {timeRange}
              </button>
              <button className="sei-btn sei-btn-primary">
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white rounded-lg p-1 mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'tokens', label: 'Tokens', icon: Star },
            { id: 'trends', label: 'Trends', icon: TrendingUp },
            { id: 'analytics', label: 'Analytics', icon: PieChart }
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
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'tokens' && renderTokens()}
        {activeTab === 'trends' && renderTrends()}
        {activeTab === 'analytics' && renderAnalytics()}
      </div>
    </div>
  );
};

export default TokenPulse;