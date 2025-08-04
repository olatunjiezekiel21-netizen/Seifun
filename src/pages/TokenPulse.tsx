import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, Activity, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

const TokenPulse = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    { label: 'Total Market Cap', value: '$2.4B', change: '+12.5%', icon: DollarSign, trend: 'up' },
    { label: '24h Volume', value: '$156M', change: '+8.2%', icon: Activity, trend: 'up' },
    { label: 'Active Tokens', value: '1,247', change: '+23', icon: Users, trend: 'up' },
    { label: 'Security Score', value: '94.2%', change: '+2.1%', icon: Shield, trend: 'up' }
  ];

  const trendingTokens = [
    { name: 'SeiDoge', symbol: 'SEIDOGE', price: '$0.000123', change: '+45.2%', volume: '$2.1M', marketCap: '$1.2M' },
    { name: 'SeiCat', symbol: 'SEICAT', price: '$0.000089', change: '+32.1%', volume: '$1.8M', marketCap: '$890K' },
    { name: 'SeiMoon', symbol: 'SEIMOON', price: '$0.000456', change: '+67.8%', volume: '$3.2M', marketCap: '$2.1M' },
    { name: 'SeiRocket', symbol: 'SEIROCKET', price: '$0.000234', change: '+28.9%', volume: '$1.5M', marketCap: '$1.6M' }
  ];

  const recentActivity = [
    { type: 'launch', token: 'SeiDiamond', user: '0x1234...5678', time: '2 hours ago', status: 'success' },
    { type: 'trade', token: 'SeiCat', user: '0xabcd...efgh', time: '5 minutes ago', status: 'success' },
    { type: 'honeypot', token: 'SeiScam', user: '0x9999...0000', time: '1 hour ago', status: 'warning' },
    { type: 'launch', token: 'SeiRocket', user: '0x5678...1234', time: '30 minutes ago', status: 'success' }
  ];

  const marketTrends = [
    { metric: 'New Launches', value: '23', change: '+15%', trend: 'up' },
    { metric: 'Failed Launches', value: '2', change: '-60%', trend: 'down' },
    { metric: 'Honeypot Detected', value: '1', change: '-75%', trend: 'down' },
    { metric: 'Total Volume', value: '$156M', change: '+8.2%', trend: 'up' }
  ];

  const performanceMetrics = [
    { name: 'Average Launch Success Rate', value: '94.2%', target: '90%', status: 'excellent' },
    { name: 'Honeypot Detection Rate', value: '98.7%', target: '95%', status: 'excellent' },
    { name: 'Average Token Performance', value: '+23.4%', target: '+10%', status: 'good' },
    { name: 'Community Engagement', value: '8,920', target: '5,000', status: 'excellent' }
  ];

  const securityInsights = [
    { type: 'warning', title: 'New Honeypot Pattern Detected', description: 'Updated detection algorithm to catch new scam patterns', time: '2 hours ago' },
    { type: 'success', title: 'Security Audit Completed', description: 'All verified tokens passed latest security audit', time: '1 day ago' },
    { type: 'info', title: 'New Token Verification', description: 'SeiDiamond token has been verified and approved', time: '3 hours ago' }
  ];

  return (
    <div className="app-bg-primary min-h-screen">
      {/* Header */}
      <div className="app-bg-secondary border-b app-border">
        <div className="app-container py-8">
          <h1 className="app-heading-xl app-text-primary mb-4">
            Token Pulse
          </h1>
          <p className="app-text-lg max-w-3xl">
            Real-time analytics and insights for the Sei token ecosystem. 
            Track market trends, security metrics, and token performance.
          </p>
        </div>
      </div>

      <div className="app-container py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="app-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 app-gradient-blue rounded-lg flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className={`text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {stat.change}
                </div>
              </div>
              <div className="app-text-muted text-sm mb-1">{stat.label}</div>
              <div className="app-text-primary text-2xl font-bold">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="app-category-tabs mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`app-category-tab ${activeTab === 'overview' ? 'active' : ''}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('trending')}
            className={`app-category-tab ${activeTab === 'trending' ? 'active' : ''}`}
          >
            Trending Tokens
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`app-category-tab ${activeTab === 'activity' ? 'active' : ''}`}
          >
            Recent Activity
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`app-category-tab ${activeTab === 'trends' ? 'active' : ''}`}
          >
            Market Trends
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`app-category-tab ${activeTab === 'performance' ? 'active' : ''}`}
          >
            Performance
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`app-category-tab ${activeTab === 'security' ? 'active' : ''}`}
          >
            Security
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Trending Tokens */}
              <div className="app-card p-6">
                <h3 className="app-heading-md mb-4">Trending Tokens</h3>
                <div className="space-y-4">
                  {trendingTokens.map((token, index) => (
                    <div key={index} className="flex items-center justify-between p-4 app-bg-tertiary rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 app-gradient-blue rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{token.symbol.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="app-text-primary font-medium">{token.name}</div>
                          <div className="app-text-muted text-sm">{token.symbol}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="app-text-primary font-medium">{token.price}</div>
                        <div className="text-green-500 text-sm">{token.change}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="app-card p-6">
                <h3 className="app-heading-md mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 app-bg-tertiary rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.status === 'success' ? 'bg-green-500' : 
                        activity.status === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}>
                        {activity.status === 'success' ? (
                          <CheckCircle className="w-4 h-4 text-white" />
                        ) : activity.status === 'warning' ? (
                          <AlertTriangle className="w-4 h-4 text-white" />
                        ) : (
                          <Activity className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="app-text-primary text-sm">
                          {activity.type === 'launch' ? 'Token Launched' :
                           activity.type === 'trade' ? 'Large Trade' :
                           'Honeypot Detected'}: {activity.token}
                        </div>
                        <div className="app-text-muted text-xs">{activity.user} • {activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'trending' && (
            <div className="app-card p-6">
              <h3 className="app-heading-md mb-6">Trending Tokens</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b app-border">
                      <th className="text-left py-3 app-text-muted font-medium">Token</th>
                      <th className="text-right py-3 app-text-muted font-medium">Price</th>
                      <th className="text-right py-3 app-text-muted font-medium">24h Change</th>
                      <th className="text-right py-3 app-text-muted font-medium">Volume</th>
                      <th className="text-right py-3 app-text-muted font-medium">Market Cap</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trendingTokens.map((token, index) => (
                      <tr key={index} className="border-b app-border">
                        <td className="py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 app-gradient-blue rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">{token.symbol.charAt(0)}</span>
                            </div>
                            <div>
                              <div className="app-text-primary font-medium">{token.name}</div>
                              <div className="app-text-muted text-sm">{token.symbol}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-right py-4 app-text-primary font-medium">{token.price}</td>
                        <td className="text-right py-4 text-green-500">{token.change}</td>
                        <td className="text-right py-4 app-text-primary">{token.volume}</td>
                        <td className="text-right py-4 app-text-primary">{token.marketCap}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="app-card p-6">
              <h3 className="app-heading-md mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 app-bg-tertiary rounded-lg">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.status === 'success' ? 'bg-green-500' : 
                      activity.status === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}>
                      {activity.status === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                      ) : activity.status === 'warning' ? (
                        <AlertTriangle className="w-5 h-5 text-white" />
                      ) : (
                        <Activity className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="app-text-primary font-medium">
                        {activity.type === 'launch' ? 'Token Launched' :
                         activity.type === 'trade' ? 'Large Trade' :
                         'Honeypot Detected'}: {activity.token}
                      </div>
                      <div className="app-text-muted text-sm">{activity.user} • {activity.time}</div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      activity.status === 'success' ? 'bg-green-500/20 text-green-500' :
                      activity.status === 'warning' ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-blue-500/20 text-blue-500'
                    }`}>
                      {activity.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'trends' && (
            <div className="app-card p-6">
              <h3 className="app-heading-md mb-6">Market Trends</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {marketTrends.map((trend, index) => (
                  <div key={index} className="p-4 app-bg-tertiary rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="app-text-primary font-medium">{trend.metric}</div>
                      <div className={`text-sm font-medium ${
                        trend.trend === 'up' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {trend.change}
                      </div>
                    </div>
                    <div className="app-text-primary text-2xl font-bold">{trend.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="app-card p-6">
              <h3 className="app-heading-md mb-6">Performance Metrics</h3>
              <div className="space-y-6">
                {performanceMetrics.map((metric, index) => (
                  <div key={index} className="p-4 app-bg-tertiary rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="app-text-primary font-medium">{metric.name}</div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        metric.status === 'excellent' ? 'bg-green-500/20 text-green-500' :
                        metric.status === 'good' ? 'bg-blue-500/20 text-blue-500' :
                        'bg-yellow-500/20 text-yellow-500'
                      }`}>
                        {metric.status}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="app-text-primary text-xl font-bold">{metric.value}</div>
                      <div className="app-text-muted text-sm">Target: {metric.target}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="app-card p-6">
              <h3 className="app-heading-md mb-6">Security Insights</h3>
              <div className="space-y-4">
                {securityInsights.map((insight, index) => (
                  <div key={index} className={`p-4 rounded-lg border-l-4 ${
                    insight.type === 'warning' ? 'app-bg-tertiary border-yellow-500' :
                    insight.type === 'success' ? 'app-bg-tertiary border-green-500' :
                    'app-bg-tertiary border-blue-500'
                  }`}>
                    <div className="flex items-start space-x-3">
                      {insight.type === 'warning' ? (
                        <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                      ) : insight.type === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      ) : (
                        <Shield className="w-5 h-5 text-blue-500 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="app-text-primary font-medium">{insight.title}</div>
                        <div className="app-text-muted text-sm mt-1">{insight.description}</div>
                        <div className="app-text-muted text-xs mt-2">{insight.time}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenPulse;