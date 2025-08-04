import React, { useState } from 'react';
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
  Star
} from 'lucide-react';

const DevPlus = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const keyMetrics = [
    { label: 'Active Projects', value: '23', change: '+5', icon: Code, trend: 'up' },
    { label: 'Total Revenue', value: '$45.2K', change: '+12.5%', icon: DollarSign, trend: 'up' },
    { label: 'Security Score', value: '94.2%', change: '+2.1%', icon: Shield, trend: 'up' },
    { label: 'Community Size', value: '1,247', change: '+23', icon: Users, trend: 'up' }
  ];

  const quickActions = [
    { name: 'Launch Token', icon: Zap, description: 'Create and deploy a new token' },
    { name: 'Security Scan', icon: Shield, description: 'Scan for vulnerabilities' },
    { name: 'Analytics', icon: BarChart3, description: 'View detailed metrics' },
    { name: 'Airdrop', icon: Gift, description: 'Distribute tokens to users' }
  ];

  const recentActivity = [
    { action: 'Token Launched', project: 'SeiDiamond', time: '2 hours ago', status: 'success' },
    { action: 'Security Scan', project: 'SeiCat', time: '4 hours ago', status: 'success' },
    { action: 'Airdrop Completed', project: 'SeiRocket', time: '6 hours ago', status: 'success' },
    { action: 'Vulnerability Found', project: 'SeiScam', time: '1 day ago', status: 'warning' }
  ];

  const watchedTokens = [
    { name: 'SeiDoge', symbol: 'SEIDOGE', price: '$0.000123', change: '+15.2%', alerts: 0 },
    { name: 'SeiCat', symbol: 'SEICAT', price: '$0.000089', change: '-8.4%', alerts: 1 },
    { name: 'SeiMoon', symbol: 'SEIMOON', price: '$0.000456', change: '+45.2%', alerts: 0 },
    { name: 'SeiRocket', symbol: 'SEIROCKET', price: '$0.000234', change: '+32.1%', alerts: 0 }
  ];

  const badActors = [
    { address: '0x1234...5678', risk: 'high', activity: 'Suspicious trading patterns', time: '2 hours ago' },
    { address: '0xabcd...efgh', risk: 'medium', activity: 'Multiple failed transactions', time: '4 hours ago' },
    { address: '0x9999...0000', risk: 'high', activity: 'Honeypot token creation', time: '1 day ago' }
  ];

  const airdropCriteria = [
    { name: 'Holders', value: '1,000+', status: 'active' },
    { name: 'Minimum Balance', value: '100 tokens', status: 'active' },
    { name: 'Snapshot Date', value: '2024-01-27', status: 'pending' },
    { name: 'Distribution', value: 'Proportional', status: 'active' }
  ];

  const analyticsData = [
    { metric: 'Token Performance', value: '+23.4%', target: '+10%', status: 'excellent' },
    { metric: 'Security Score', value: '94.2%', target: '90%', status: 'excellent' },
    { metric: 'Community Growth', value: '+15.2%', target: '+5%', status: 'good' },
    { metric: 'Revenue Growth', value: '+28.7%', target: '+20%', status: 'excellent' }
  ];

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'token-watch', name: 'Token Watch', icon: Eye },
    { id: 'bad-actors', name: 'Bad Actors', icon: AlertTriangle },
    { id: 'airdrops', name: 'Airdrops', icon: Gift },
    { id: 'tools', name: 'Developer Tools', icon: Settings }
  ];

  return (
    <div className="app-bg-primary min-h-screen">
      {/* Header */}
      <div className="app-bg-secondary border-b app-border">
        <div className="app-container py-8">
          <h1 className="app-heading-xl app-text-primary mb-4">
            Dev Plus
          </h1>
          <p className="app-text-lg max-w-3xl">
            Advanced developer tools for token management, security monitoring, and ecosystem growth. 
            Build, monitor, and scale your projects with confidence.
          </p>
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
                className={`app-category-tab ${
                  activeTab === tab.id ? 'active' : ''
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'dashboard' && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {keyMetrics.map((metric, index) => (
                  <div key={index} className="app-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 app-gradient-blue rounded-lg flex items-center justify-center">
                        <metric.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className={`text-sm font-medium ${
                        metric.trend === 'up' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {metric.change}
                      </div>
                    </div>
                    <div className="app-text-muted text-sm mb-1">{metric.label}</div>
                    <div className="app-text-primary text-2xl font-bold">{metric.value}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Quick Actions */}
                <div className="app-card p-6">
                  <h3 className="app-heading-md mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {quickActions.map((action, index) => (
                      <button
                        key={index}
                        className="p-4 app-bg-tertiary rounded-lg hover:app-bg-secondary transition-colors text-left"
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <action.icon className="w-5 h-5 app-text-muted" />
                          <span className="app-text-primary font-medium">{action.name}</span>
                        </div>
                        <p className="app-text-muted text-sm">{action.description}</p>
                      </button>
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
                          activity.status === 'success' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}>
                          {activity.status === 'success' ? (
                            <CheckCircle className="w-4 h-4 text-white" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="app-text-primary text-sm">{activity.action}</div>
                          <div className="app-text-muted text-xs">{activity.project} • {activity.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'token-watch' && (
            <div className="app-card p-6">
              <h3 className="app-heading-md mb-6">Watched Tokens</h3>
              <div className="space-y-4">
                {watchedTokens.map((token, index) => (
                  <div key={index} className="flex items-center justify-between p-4 app-bg-tertiary rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 app-gradient-blue rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">{token.symbol.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="app-text-primary font-medium">{token.name}</div>
                        <div className="app-text-muted text-sm">{token.symbol}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="app-text-primary font-medium">{token.price}</div>
                      <div className={`text-sm ${
                        token.change.startsWith('+') ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {token.change}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {token.alerts > 0 && (
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      )}
                      <button className="app-btn app-btn-secondary text-sm">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'bad-actors' && (
            <div className="app-card p-6">
              <h3 className="app-heading-md mb-6">Bad Actors Detection</h3>
              <div className="space-y-4">
                {badActors.map((actor, index) => (
                  <div key={index} className="p-4 app-bg-tertiary rounded-lg border-l-4 border-red-500">
                    <div className="flex items-center justify-between mb-2">
                      <div className="app-text-primary font-medium">{actor.address}</div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        actor.risk === 'high' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'
                      }`}>
                        {actor.risk} risk
                      </div>
                    </div>
                    <div className="app-text-muted text-sm mb-2">{actor.activity}</div>
                    <div className="flex items-center justify-between">
                      <div className="app-text-muted text-xs">{actor.time}</div>
                      <button className="app-btn app-btn-primary text-sm">
                        Investigate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'airdrops' && (
            <div className="space-y-8">
              {/* Airdrop Setup */}
              <div className="app-card p-6">
                <h3 className="app-heading-md mb-6">Airdrop Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block app-text-muted text-sm mb-2">Token Address</label>
                    <input type="text" className="app-input" placeholder="Enter token contract address" />
                  </div>
                  <div>
                    <label className="block app-text-muted text-sm mb-2">Amount per Wallet</label>
                    <input type="number" className="app-input" placeholder="Enter amount" />
                  </div>
                  <div>
                    <label className="block app-text-muted text-sm mb-2">Snapshot Date</label>
                    <input type="date" className="app-input" />
                  </div>
                  <div>
                    <label className="block app-text-muted text-sm mb-2">Distribution Method</label>
                    <select className="app-input">
                      <option>Proportional to Balance</option>
                      <option>Equal Distribution</option>
                      <option>Random Selection</option>
                    </select>
                  </div>
                </div>
                <button className="app-btn app-btn-primary mt-6">
                  <Gift className="w-4 h-4 mr-2" />
                  Launch Airdrop
                </button>
              </div>

              {/* Airdrop Criteria */}
              <div className="app-card p-6">
                <h3 className="app-heading-md mb-4">Airdrop Criteria</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {airdropCriteria.map((criteria, index) => (
                    <div key={index} className="flex items-center justify-between p-3 app-bg-tertiary rounded-lg">
                      <div>
                        <div className="app-text-primary font-medium">{criteria.name}</div>
                        <div className="app-text-muted text-sm">{criteria.value}</div>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        criteria.status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
                      }`}>
                        {criteria.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Analytics Dashboard */}
              <div className="app-card p-6">
                <h3 className="app-heading-md mb-6">Analytics Dashboard</h3>
                <div className="space-y-4">
                  {analyticsData.map((data, index) => (
                    <div key={index} className="p-4 app-bg-tertiary rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="app-text-primary font-medium">{data.metric}</div>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          data.status === 'excellent' ? 'bg-green-500/20 text-green-500' :
                          data.status === 'good' ? 'bg-blue-500/20 text-blue-500' :
                          'bg-yellow-500/20 text-yellow-500'
                        }`}>
                          {data.status}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="app-text-primary text-xl font-bold">{data.value}</div>
                        <div className="app-text-muted text-sm">Target: {data.target}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Developer Tools */}
              <div className="app-card p-6">
                <h3 className="app-heading-md mb-6">Developer Tools</h3>
                <div className="space-y-4">
                  <button className="w-full p-4 app-bg-tertiary rounded-lg hover:app-bg-secondary transition-colors text-left">
                    <div className="flex items-center space-x-3">
                      <Code className="w-5 h-5 app-text-muted" />
                      <div>
                        <div className="app-text-primary font-medium">Contract Deployment</div>
                        <div className="app-text-muted text-sm">Deploy smart contracts</div>
                      </div>
                    </div>
                  </button>
                  
                  <button className="w-full p-4 app-bg-tertiary rounded-lg hover:app-bg-secondary transition-colors text-left">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 app-text-muted" />
                      <div>
                        <div className="app-text-primary font-medium">Security Scanner</div>
                        <div className="app-text-muted text-sm">Audit smart contracts</div>
                      </div>
                    </div>
                  </button>
                  
                  <button className="w-full p-4 app-bg-tertiary rounded-lg hover:app-bg-secondary transition-colors text-left">
                    <div className="flex items-center space-x-3">
                      <BarChart3 className="w-5 h-5 app-text-muted" />
                      <div>
                        <div className="app-text-primary font-medium">Performance Analytics</div>
                        <div className="app-text-muted text-sm">Track token metrics</div>
                      </div>
                    </div>
                  </button>
                  
                  <button className="w-full p-4 app-bg-tertiary rounded-lg hover:app-bg-secondary transition-colors text-left">
                    <div className="flex items-center space-x-3">
                      <Settings className="w-5 h-5 app-text-muted" />
                      <div>
                        <div className="app-text-primary font-medium">Configuration</div>
                        <div className="app-text-muted text-sm">Manage project settings</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DevPlus;