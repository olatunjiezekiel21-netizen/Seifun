import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  PieChart, 
  BarChart3, 
  AlertTriangle, 
  Target, 
  Brain, 
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Shield,
  DollarSign
} from 'lucide-react';
import { portfolioOptimizer, PortfolioAnalysis } from '../services/PortfolioOptimizer';
import { marketIntelligence } from '../services/MarketIntelligence';

interface DashboardStats {
  portfolioValue: number;
  riskScore: number;
  expectedReturn: number;
  marketSentiment: number;
  activeAlerts: number;
  tradingOpportunities: number;
}

const AIDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    portfolioValue: 0,
    riskScore: 0,
    expectedReturn: 0,
    marketSentiment: 0,
    activeAlerts: 0,
    tradingOpportunities: 0
  });
  const [portfolioAnalysis, setPortfolioAnalysis] = useState<PortfolioAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'portfolio' | 'market' | 'ai'>('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load portfolio analysis
      const portfolio = await portfolioOptimizer.analyzePortfolio();
      setPortfolioAnalysis(portfolio);
      
      // Load market data
      const marketOverview = await marketIntelligence.getMarketOverview();
      const sentiment = await marketIntelligence.getMarketSentiment();
      const opportunities = await marketIntelligence.getTradingOpportunities();
      const alerts = await marketIntelligence.getActiveAlerts();
      
      // Extract sentiment score from response
      const sentimentMatch = sentiment.match(/Sentiment Score: (-?\d+)/);
      const sentimentScore = sentimentMatch ? parseInt(sentimentMatch[1]) : 0;
      
      // Count trading opportunities
      const opportunitiesCount = (opportunities.match(/🎯/g) || []).length;
      
      // Count active alerts
      const alertsCount = (alerts.match(/•/g) || []).length;
      
      setStats({
        portfolioValue: portfolio.totalValue,
        riskScore: portfolio.riskScore,
        expectedReturn: portfolio.expectedReturn * 100,
        marketSentiment: sentimentScore,
        activeAlerts: alertsCount,
        tradingOpportunities: opportunitiesCount
      });
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: number) => {
    if (risk <= 1.5) return 'text-green-500';
    if (risk <= 2.5) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 50) return 'text-green-500';
    if (sentiment >= -50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSentimentIcon = (sentiment: number) => {
    if (sentiment >= 70) return '🚀';
    if (sentiment >= 40) return '📈';
    if (sentiment >= 10) return '😐';
    if (sentiment >= -10) return '😐';
    if (sentiment >= -40) return '📉';
    if (sentiment >= -70) return '🐻';
    return '💀';
  };

  if (loading) {
    return (
      <div className="min-h-screen app-bg-primary p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-700 rounded"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-96 bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen app-bg-primary p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold app-text-primary mb-2">
            <Brain className="inline-block w-10 h-10 mr-3 text-blue-500" />
            AI-Powered Dashboard
          </h1>
          <p className="text-lg app-text-secondary">
            Advanced portfolio optimization, market intelligence, and AI-driven insights
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Portfolio Value */}
          <div className="app-card p-6 border app-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm app-text-muted">Portfolio Value</p>
                <p className="text-2xl font-bold app-text-primary">${stats.portfolioValue.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
            <div className="mt-2 flex items-center">
              <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-500">+{stats.expectedReturn.toFixed(1)}% APY</span>
            </div>
          </div>

          {/* Risk Score */}
          <div className="app-card p-6 border app-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm app-text-muted">Risk Score</p>
                <p className={`text-2xl font-bold ${getRiskColor(stats.riskScore)}`}>
                  {stats.riskScore.toFixed(1)}/3.0
                </p>
              </div>
              <Shield className="w-8 h-8 text-blue-500" />
            </div>
            <div className="mt-2">
              <span className={`text-sm ${getRiskColor(stats.riskScore)}`}>
                {stats.riskScore <= 1.5 ? 'Low Risk' : stats.riskScore <= 2.5 ? 'Medium Risk' : 'High Risk'}
              </span>
            </div>
          </div>

          {/* Market Sentiment */}
          <div className="app-card p-6 border app-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm app-text-muted">Market Sentiment</p>
                <p className={`text-2xl font-bold ${getSentimentColor(stats.marketSentiment)}`}>
                  {stats.marketSentiment}/100
                </p>
              </div>
              <span className="text-3xl">{getSentimentIcon(stats.marketSentiment)}</span>
            </div>
            <div className="mt-2">
              <span className={`text-sm ${getSentimentColor(stats.marketSentiment)}`}>
                {stats.marketSentiment >= 50 ? 'Bullish' : stats.marketSentiment >= -50 ? 'Neutral' : 'Bearish'}
              </span>
            </div>
          </div>

          {/* AI Insights */}
          <div className="app-card p-6 border app-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm app-text-muted">AI Insights</p>
                <p className="text-2xl font-bold app-text-primary">
                  {stats.tradingOpportunities + stats.activeAlerts}
                </p>
              </div>
              <Zap className="w-8 h-8 text-purple-500" />
            </div>
            <div className="mt-2 text-sm app-text-secondary">
              {stats.tradingOpportunities} opportunities, {stats.activeAlerts} alerts
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-app-bg-secondary rounded-lg p-1">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'portfolio', label: 'Portfolio', icon: PieChart },
            { id: 'market', label: 'Market', icon: BarChart3 },
            { id: 'ai', label: 'AI Tools', icon: Brain }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'app-bg-primary app-text-primary'
                  : 'app-text-secondary hover:app-bg-secondary'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="app-card p-6 border app-border">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold app-text-primary mb-4">Dashboard Overview</h2>
              
              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  onClick={() => setActiveTab('portfolio')}
                  className="app-bg-secondary p-4 rounded-lg text-left hover:bg-opacity-80 transition-colors"
                >
                  <PieChart className="w-8 h-8 text-blue-500 mb-2" />
                  <h3 className="font-semibold app-text-primary">Portfolio Analysis</h3>
                  <p className="text-sm app-text-muted">View detailed portfolio breakdown and optimization</p>
                </button>
                
                <button 
                  onClick={() => setActiveTab('market')}
                  className="app-bg-secondary p-4 rounded-lg text-left hover:bg-opacity-80 transition-colors"
                >
                  <BarChart3 className="w-8 h-8 text-green-500 mb-2" />
                  <h3 className="font-semibold app-text-primary">Market Intelligence</h3>
                  <p className="text-sm app-text-muted">Get market trends and trading opportunities</p>
                </button>
                
                <button 
                  onClick={() => setActiveTab('ai')}
                  className="app-bg-secondary p-4 rounded-lg text-left hover:bg-opacity-80 transition-colors"
                >
                  <Brain className="w-8 h-8 text-purple-500 mb-2" />
                  <h3 className="font-semibold app-text-primary">AI Tools</h3>
                  <p className="text-sm app-text-muted">Access advanced AI-powered features</p>
                </button>
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="text-lg font-semibold app-text-primary mb-3">Recent Activity</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 app-bg-secondary rounded">
                    <span className="app-text-secondary">Portfolio analyzed</span>
                    <span className="text-sm app-text-muted">Just now</span>
                  </div>
                  <div className="flex items-center justify-between p-3 app-bg-secondary rounded">
                    <span className="app-text-secondary">Market sentiment updated</span>
                    <span className="text-sm app-text-muted">2 min ago</span>
                  </div>
                  <div className="flex items-center justify-between p-3 app-bg-secondary rounded">
                    <span className="app-text-secondary">AI insights generated</span>
                    <span className="text-sm app-text-muted">5 min ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'portfolio' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold app-text-primary mb-4">Portfolio Analysis</h2>
              
              {portfolioAnalysis && (
                <>
                  {/* Portfolio Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="app-bg-secondary p-4 rounded-lg">
                      <h3 className="font-semibold app-text-primary mb-3">Portfolio Summary</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="app-text-secondary">Total Value:</span>
                          <span className="app-text-primary font-semibold">${portfolioAnalysis.totalValue.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="app-text-secondary">Risk Score:</span>
                          <span className={`font-semibold ${getRiskColor(portfolioAnalysis.riskScore)}`}>
                            {portfolioAnalysis.riskScore.toFixed(1)}/3.0
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="app-text-secondary">Expected Return:</span>
                          <span className="text-green-500 font-semibold">
                            {(portfolioAnalysis.expectedReturn * 100).toFixed(1)}% APY
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="app-bg-secondary p-4 rounded-lg">
                      <h3 className="font-semibold app-text-primary mb-3">Performance Metrics</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="app-text-secondary">Total Return:</span>
                          <span className="app-text-primary font-semibold">
                            {portfolioAnalysis.performance.totalReturn.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="app-text-secondary">Volatility:</span>
                          <span className="app-text-primary font-semibold">
                            {portfolioAnalysis.performance.volatility.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="app-text-secondary">Sharpe Ratio:</span>
                          <span className="app-text-primary font-semibold">
                            {portfolioAnalysis.performance.sharpeRatio.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Asset Allocation */}
                  <div>
                    <h3 className="text-lg font-semibold app-text-primary mb-3">Asset Allocation</h3>
                    <div className="space-y-3">
                      {portfolioAnalysis.allocation.map((asset, index) => (
                        <div key={index} className="flex items-center justify-between p-3 app-bg-secondary rounded">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              asset.risk === 'low' ? 'bg-green-500' : 
                              asset.risk === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}></div>
                            <div>
                              <span className="font-semibold app-text-primary">{asset.symbol}</span>
                              <span className="text-sm app-text-muted ml-2">({asset.category})</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="app-text-primary font-semibold">{asset.percentage.toFixed(1)}%</div>
                            <div className="text-sm app-text-muted">${asset.value.toFixed(2)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h3 className="text-lg font-semibold app-text-primary mb-3">AI Recommendations</h3>
                    <div className="space-y-3">
                      {portfolioAnalysis.recommendations.slice(0, 5).map((rec, index) => (
                        <div key={index} className="flex items-center justify-between p-3 app-bg-secondary rounded">
                          <div className="flex items-center space-x-3">
                            <div className={`px-2 py-1 rounded text-xs font-semibold ${
                              rec.type === 'buy' ? 'bg-green-500 text-white' :
                              rec.type === 'sell' ? 'bg-red-500 text-white' :
                              'bg-yellow-500 text-black'
                            }`}>
                              {rec.type.toUpperCase()}
                            </div>
                            <div>
                              <span className="font-semibold app-text-primary">{rec.asset}</span>
                              <div className="text-sm app-text-muted">{rec.reason}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-xs px-2 py-1 rounded ${
                              rec.priority === 'high' ? 'bg-red-500 text-white' :
                              rec.priority === 'medium' ? 'bg-yellow-500 text-black' :
                              'bg-green-500 text-white'
                            }`}>
                              {rec.priority.toUpperCase()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'market' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold app-text-primary mb-4">Market Intelligence</h2>
              
              {/* Market Overview */}
              <div className="app-bg-secondary p-4 rounded-lg">
                <h3 className="font-semibold app-text-primary mb-3">Market Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">📈</div>
                    <div className="app-text-primary font-semibold">Bullish</div>
                    <div className="text-sm app-text-muted">Market sentiment</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">💰</div>
                    <div className="app-text-primary font-semibold">$45M+</div>
                    <div className="text-sm app-text-muted">Total TVL</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-500">🚀</div>
                    <div className="app-text-primary font-semibold">100+</div>
                    <div className="text-sm app-text-muted">Active tokens</div>
                  </div>
                </div>
              </div>

              {/* Trading Opportunities */}
              <div>
                <h3 className="text-lg font-semibold app-text-primary mb-3">Trading Opportunities</h3>
                <div className="space-y-3">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="flex items-center justify-between p-3 app-bg-secondary rounded">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold app-text-primary">SEI</div>
                          <div className="text-sm app-text-muted">Strong bullish momentum</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-500 font-semibold">+12.5%</div>
                        <div className="text-sm app-text-muted">Confidence: 85%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Market Alerts */}
              <div>
                <h3 className="text-lg font-semibold app-text-primary mb-3">Market Alerts</h3>
                <div className="space-y-3">
                  {[...Array(2)].map((_, index) => (
                    <div key={index} className="flex items-center justify-between p-3 app-bg-secondary rounded">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        <div>
                          <div className="font-semibold app-text-primary">Price Alert</div>
                          <div className="text-sm app-text-muted">SEI above $0.85</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs bg-yellow-500 text-black px-2 py-1 rounded">MEDIUM</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold app-text-primary mb-4">AI-Powered Tools</h2>
              
              {/* AI Capabilities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="app-bg-secondary p-4 rounded-lg">
                  <h3 className="font-semibold app-text-primary mb-3">Portfolio AI</h3>
                  <ul className="space-y-2 text-sm app-text-secondary">
                    <li>• Risk assessment & optimization</li>
                    <li>• Asset allocation recommendations</li>
                    <li>• Rebalancing strategies</li>
                    <li>• Performance analytics</li>
                  </ul>
                </div>

                <div className="app-bg-secondary p-4 rounded-lg">
                  <h3 className="font-semibold app-text-primary mb-3">Market AI</h3>
                  <ul className="space-y-2 text-sm app-text-secondary">
                    <li>• Sentiment analysis</li>
                    <li>• Trend prediction</li>
                    <li>• Trading opportunities</li>
                    <li>• Market alerts</li>
                  </ul>
                </div>
              </div>

              {/* Quick AI Actions */}
              <div>
                <h3 className="text-lg font-semibold app-text-primary mb-3">Quick AI Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="app-bg-secondary p-4 rounded-lg text-left hover:bg-opacity-80 transition-colors">
                    <Target className="w-6 h-6 text-blue-500 mb-2" />
                    <div className="font-semibold app-text-primary">Optimize Portfolio</div>
                    <div className="text-sm app-text-muted">Get AI recommendations</div>
                  </button>
                  
                  <button className="app-bg-secondary p-4 rounded-lg text-left hover:bg-opacity-80 transition-colors">
                    <BarChart3 className="w-6 h-6 text-green-500 mb-2" />
                    <div className="font-semibold app-text-primary">Market Analysis</div>
                    <div className="text-sm app-text-muted">AI-powered insights</div>
                  </button>
                  
                  <button className="app-bg-secondary p-4 rounded-lg text-left hover:bg-opacity-80 transition-colors">
                    <AlertTriangle className="w-6 h-6 text-yellow-500 mb-2" />
                    <div className="font-semibold app-text-primary">Set Alerts</div>
                    <div className="text-sm app-text-muted">Smart notifications</div>
                  </button>
                </div>
              </div>

              {/* AI Status */}
              <div className="app-bg-secondary p-4 rounded-lg">
                <h3 className="font-semibold app-text-primary mb-3">AI System Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="app-text-secondary">Portfolio Optimizer</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="app-text-secondary">Market Intelligence</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="app-text-secondary">Risk Assessment</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="app-text-secondary">Trading AI</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIDashboard;