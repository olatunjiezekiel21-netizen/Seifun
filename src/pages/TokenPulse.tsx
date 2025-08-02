import React, { useState } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Activity, Users, DollarSign, ArrowUpRight, Calendar, Clock, Target, Zap, Shield, Star } from 'lucide-react';

const TokenPulse = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock analytics data
  const analyticsData = {
    totalTokens: 1247,
    activeUsers: 8920,
    totalVolume: '$2.4M',
    avgScore: 87.3,
    trendingTokens: [
      { name: 'SEI', symbol: 'SEI', change: '+12.4%', volume: '$890K', marketCap: '$524M' },
      { name: 'SeiDoge', symbol: 'SDOGE', change: '+45.2%', volume: '$234K', marketCap: '$2.34M' },
      { name: 'SeiCat', symbol: 'SCAT', change: '+23.1%', volume: '$156K', marketCap: '$890K' },
      { name: 'SeiMoon', symbol: 'SMOON', change: '+67.8%', volume: '$445K', marketCap: '$1.2M' },
      { name: 'SeiRocket', symbol: 'SROCK', change: '+34.5%', volume: '$278K', marketCap: '$567K' }
    ],
    recentActivity: [
      { action: 'Token Launched', token: 'SeiDoge', time: '2 min ago', user: '0x1234...5678' },
      { action: 'Large Trade', token: 'SEI', time: '5 min ago', user: '0x8765...4321' },
      { action: 'Token Verified', token: 'SeiCat', time: '12 min ago', user: 'Admin' },
      { action: 'Market Alert', token: 'SeiMoon', time: '18 min ago', user: 'System' },
      { action: 'New Holder', token: 'SeiRocket', time: '25 min ago', user: '0x9876...5432' }
    ]
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'analytics', label: 'Analytics', icon: Target }
  ];

  return (
    <div className="min-h-screen sei-bg-primary">
      {/* Header */}
      <div className="sei-bg-secondary border-b sei-border">
        <div className="sei-container py-8">
          <div className="text-center mb-8">
            <h1 className="sei-heading-xl sei-text-primary mb-4">
              Token Pulse
            </h1>
            <p className="sei-text-lg max-w-2xl mx-auto">
              Real-time analytics and insights for the Sei ecosystem
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="sei-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="sei-text-muted text-sm">Total Tokens</div>
                  <div className="sei-text-primary text-2xl font-bold">{analyticsData.totalTokens}</div>
                </div>
                <div className="sei-primary">
                  <BarChart3 className="w-8 h-8" />
                </div>
              </div>
            </div>

            <div className="sei-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="sei-text-muted text-sm">Active Users</div>
                  <div className="sei-text-primary text-2xl font-bold">{analyticsData.activeUsers}</div>
                </div>
                <div className="sei-primary">
                  <Users className="w-8 h-8" />
                </div>
              </div>
            </div>

            <div className="sei-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="sei-text-muted text-sm">Total Volume</div>
                  <div className="sei-text-primary text-2xl font-bold">{analyticsData.totalVolume}</div>
                </div>
                <div className="sei-primary">
                  <DollarSign className="w-8 h-8" />
                </div>
              </div>
            </div>

            <div className="sei-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="sei-text-muted text-sm">Avg Score</div>
                  <div className="sei-text-primary text-2xl font-bold">{analyticsData.avgScore}</div>
                </div>
                <div className="sei-primary">
                  <Star className="w-8 h-8" />
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="sei-category-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Trending Tokens */}
            <div className="sei-card p-6">
              <h3 className="sei-heading-md mb-6">Trending Tokens</h3>
              <div className="space-y-4">
                {analyticsData.trendingTokens.map((token, index) => (
                  <div key={index} className="flex items-center justify-between p-4 sei-bg-tertiary rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="sei-token-icon">
                        {token.symbol.charAt(0)}
                      </div>
                      <div>
                        <div className="sei-text-primary font-medium">{token.name}</div>
                        <div className="sei-text-muted text-sm">{token.symbol}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`sei-token-change positive`}>{token.change}</div>
                      <div className="sei-text-muted text-sm">{token.volume}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="sei-card p-6">
              <h3 className="sei-heading-md mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {analyticsData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 sei-bg-tertiary rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <div className="sei-text-primary font-medium">{activity.action}</div>
                        <div className="sei-text-muted text-sm">{activity.token}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="sei-text-muted text-sm">{activity.time}</div>
                      <div className="sei-text-secondary text-xs">{activity.user}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trending' && (
          <div className="sei-card p-6">
            <h3 className="sei-heading-md mb-6">Market Trends</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analyticsData.trendingTokens.map((token, index) => (
                <div key={index} className="sei-bg-tertiary p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="sei-token-icon">
                        {token.symbol.charAt(0)}
                      </div>
                      <div>
                        <div className="sei-text-primary font-medium">{token.name}</div>
                        <div className="sei-text-muted text-sm">{token.symbol}</div>
                      </div>
                    </div>
                    <div className="sei-token-change positive">{token.change}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="sei-text-muted">Volume</div>
                      <div className="sei-text-primary font-medium">{token.volume}</div>
                    </div>
                    <div>
                      <div className="sei-text-muted">Market Cap</div>
                      <div className="sei-text-primary font-medium">{token.marketCap}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="sei-card p-6">
            <h3 className="sei-heading-md mb-6">Live Activity Feed</h3>
            <div className="space-y-4">
              {analyticsData.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 sei-bg-tertiary rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <div className="sei-text-primary font-medium">{activity.action}</div>
                    <div className="sei-text-muted text-sm">{activity.token} • {activity.user}</div>
                  </div>
                  <div className="text-right">
                    <div className="sei-text-muted text-sm">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="sei-card p-6">
              <h3 className="sei-heading-md mb-6">Performance Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="sei-text-secondary">Token Launch Rate</span>
                  <span className="sei-text-primary font-medium">12/day</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="sei-text-secondary">Avg Trading Volume</span>
                  <span className="sei-text-primary font-medium">$890K</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="sei-text-secondary">Active Traders</span>
                  <span className="sei-text-primary font-medium">1,247</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="sei-text-secondary">Success Rate</span>
                  <span className="sei-text-primary font-medium">87.3%</span>
                </div>
              </div>
            </div>

            <div className="sei-card p-6">
              <h3 className="sei-heading-md mb-6">Security Insights</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-green-500" />
                  <div>
                    <div className="sei-text-primary font-medium">Verified Tokens</div>
                    <div className="sei-text-muted text-sm">234 tokens verified</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <div>
                    <div className="sei-text-primary font-medium">Risk Alerts</div>
                    <div className="sei-text-muted text-sm">12 alerts today</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Target className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="sei-text-primary font-medium">Safety Score</div>
                    <div className="sei-text-muted text-sm">Avg: 87.3/100</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenPulse;