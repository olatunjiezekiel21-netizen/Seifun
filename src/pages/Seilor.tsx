import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, Zap, Target, Globe, Sparkles, Bot, ChevronRight, ExternalLink, Star, Users, DollarSign, Calendar, AlertCircle, Info } from 'lucide-react';
import { getSeiDApps, getAlphaInsights, getSeiNetworkStats, getDAppCategories, type SeiDApp, type AlphaInsight } from '../utils/seiEcosystemData';

const Seilor = () => {
  const [activeTab, setActiveTab] = useState('discover');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [aiChat, setAiChat] = useState('');
  const [seiDApps, setSeiDApps] = useState<SeiDApp[]>([]);
  const [alphaInsights, setAlphaInsights] = useState<AlphaInsight[]>([]);
  const [networkStats, setNetworkStats] = useState({
    totalTvl: 'Loading...',
    activeUsers: 'Loading...',
    transactions: 'Loading...',
    dAppsLive: 'Loading...'
  });
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState([
    {
      type: 'ai',
      message: "👋 Welcome to Seilor 0! I'm your AI guide for the Sei ecosystem. Ask me about dApps, alpha opportunities, or how to navigate DeFi safely!",
      timestamp: new Date()
    }
  ]);

  const categories = getDAppCategories();

  // Load real data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [dApps, insights, stats] = await Promise.all([
          getSeiDApps(),
          getAlphaInsights(),
          getSeiNetworkStats()
        ]);
        
        setSeiDApps(dApps);
        setAlphaInsights(insights);
        setNetworkStats(stats);
      } catch (error) {
        console.error('Failed to load Seilor data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredDApps = selectedCategory === 'All' 
    ? seiDApps 
    : seiDApps.filter(dapp => dapp.category === selectedCategory);

  const handleAiChat = () => {
    if (!aiChat.trim()) return;

    // Add user message
    const userMessage = {
      type: 'user',
      message: aiChat,
      timestamp: new Date()
    };

    // Mock AI response based on keywords
    let aiResponse = "I'm analyzing the Sei ecosystem for you...";
    
    if (aiChat.toLowerCase().includes('alpha')) {
      aiResponse = "🎯 Here are the top alpha opportunities I'm tracking: 1) New DeFi protocol launching with innovative yield strategies, 2) Major CEX listing rumors for 3 Sei tokens, 3) Stealth project token sale opening soon. Would you like details on any of these?";
    } else if (aiChat.toLowerCase().includes('dapp')) {
      aiResponse = "🚀 The Sei ecosystem has amazing dApps! I recommend checking out Seifun for token launches, Sei Swap for trading, and Sei Lend for yield opportunities. Which category interests you most?";
    } else if (aiChat.toLowerCase().includes('safe')) {
      aiResponse = "🛡️ Safety first! Always verify smart contracts, check TVL and user metrics, start with small amounts, and never invest more than you can afford to lose. Use Seifun's SafeChecker for token analysis!";
    }

    const aiMessage = {
      type: 'ai',
      message: aiResponse,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage, aiMessage]);
    setAiChat('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Header with Beta Badge */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-blue-500/10"></div>
        <div className="relative app-container py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Seilor 0
                  </h1>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-red-400 text-sm font-medium">
                      BETA
                    </span>
                    <span className="text-gray-400 text-sm">AI-Powered Sei Navigator</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-gray-400">
              <Sparkles className="w-5 h-5 text-red-400" />
              <span className="text-sm">Powered by Advanced AI</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 bg-slate-800/50 p-1 rounded-xl mb-8">
            {[
              { id: 'discover', label: 'dApp Discovery', icon: Globe },
              { id: 'alpha', label: 'Alpha Insights', icon: Target },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'ai', label: 'AI Assistant', icon: Bot }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="app-container pb-12">
        {/* dApp Discovery Tab */}
        {activeTab === 'discover' && (
          <div>
            {/* Category Filter */}
            <div className="flex space-x-2 mb-8">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-red-500 text-white'
                      : 'bg-slate-800 text-gray-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Featured dApps */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <Star className="w-6 h-6 text-red-400 mr-2" />
                Featured dApps
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredDApps.filter(dapp => dapp.featured).map(dapp => (
                  <div key={dapp.id} className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 hover:border-red-500/50 transition-all group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={dapp.image} 
                          alt={dapp.name}
                          className="w-16 h-16 rounded-xl"
                        />
                        <div>
                          <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors">
                            {dapp.name}
                          </h3>
                          <p className="text-gray-400 text-sm">{dapp.description}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-green-400 font-medium">{dapp.tvl}</span>
                            <span className="text-blue-400">{dapp.users} users</span>
                          </div>
                        </div>
                      </div>
                      <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-red-400 transition-colors" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                        {dapp.category}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        dapp.status === 'Live' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {dapp.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* All dApps Grid */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">All dApps</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDApps.map(dapp => (
                  <div key={dapp.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-red-500/50 transition-all group cursor-pointer">
                    <div className="flex items-center space-x-3 mb-3">
                      <img 
                        src={dapp.image} 
                        alt={dapp.name}
                        className="w-12 h-12 rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-white group-hover:text-red-400 transition-colors">
                          {dapp.name}
                        </h3>
                        <p className="text-gray-400 text-sm">{dapp.category}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-red-400 transition-colors" />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-400">{dapp.tvl}</span>
                      <span className="text-blue-400">{dapp.users}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Alpha Insights Tab */}
        {activeTab === 'alpha' && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
                <Target className="w-6 h-6 text-red-400 mr-2" />
                Alpha Insights
              </h2>
              <p className="text-gray-400">AI-powered insights on upcoming opportunities in the Sei ecosystem</p>
            </div>

            <div className="space-y-6">
              {loading ? (
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 text-center">
                  <div className="animate-pulse">
                    <div className="h-4 bg-slate-700 rounded w-3/4 mx-auto mb-4"></div>
                    <div className="h-3 bg-slate-700 rounded w-full mb-2"></div>
                    <div className="h-3 bg-slate-700 rounded w-2/3"></div>
                  </div>
                </div>
              ) : alphaInsights.length === 0 ? (
                <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 text-center">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Alpha Insights Coming Soon</h3>
                  <p className="text-gray-400">
                    Our AI is being trained to provide real-time alpha insights for the Sei ecosystem. 
                    Check back soon for market intelligence and opportunities!
                  </p>
                </div>
              ) : (
                alphaInsights.map(insight => (
                <div key={insight.id} className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-white">{insight.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          insight.type === 'upcoming' ? 'bg-blue-500/20 text-blue-400' :
                          insight.type === 'cex' ? 'bg-green-500/20 text-green-400' :
                          'bg-purple-500/20 text-purple-400'
                        }`}>
                          {insight.category}
                        </span>
                      </div>
                      <p className="text-gray-300 mb-4">{insight.description}</p>
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-gray-400">Confidence: {insight.confidence}%</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-blue-400" />
                          <span className="text-sm text-gray-400">{insight.timeframe}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Zap className="w-4 h-4 text-red-400" />
                          <span className="text-sm text-gray-400">Impact: {insight.impact}</span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className={`w-3 h-3 rounded-full ${
                        insight.confidence > 90 ? 'bg-green-400' :
                        insight.confidence > 70 ? 'bg-yellow-400' :
                        'bg-red-400'
                      }`}>                       </div>
                     </div>
                   </div>
                 </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
                <TrendingUp className="w-6 h-6 text-red-400 mr-2" />
                Sei Ecosystem Analytics
              </h2>
              <p className="text-gray-400">Real-time metrics and insights for the Sei blockchain</p>
            </div>

            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { label: 'Total TVL', value: networkStats.totalTvl, change: 'Coming Soon', color: 'green' },
                { label: 'Active Users', value: networkStats.activeUsers, change: 'Coming Soon', color: 'blue' },
                { label: 'Transactions', value: networkStats.transactions, change: 'Coming Soon', color: 'purple' },
                { label: 'dApps Live', value: networkStats.dAppsLive, change: 'Growing', color: 'red' }
              ].map((metric, index) => (
                <div key={index} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                  <h3 className="text-gray-400 text-sm mb-2">{metric.label}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-white">{metric.value}</span>
                    <span className={`text-sm font-medium ${
                      metric.color === 'green' ? 'text-green-400' :
                      metric.color === 'blue' ? 'text-blue-400' :
                      metric.color === 'purple' ? 'text-purple-400' :
                      'text-red-400'
                    }`}>
                      {metric.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Coming Soon Notice */}
            <div className="bg-gradient-to-r from-red-500/10 to-blue-500/10 rounded-xl p-8 border border-red-500/20 text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Advanced Analytics Coming Soon</h3>
              <p className="text-gray-400">
                Detailed charts, historical data, and predictive analytics are being developed. 
                Stay tuned for the full analytics suite!
              </p>
            </div>
          </div>
        )}

        {/* AI Assistant Tab */}
        {activeTab === 'ai' && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
                <Bot className="w-6 h-6 text-red-400 mr-2" />
                AI Assistant
              </h2>
              <p className="text-gray-400">Your intelligent guide to the Sei ecosystem</p>
            </div>

            {/* Chat Interface */}
            <div className="bg-slate-800 rounded-xl border border-slate-700">
              {/* Chat Messages */}
              <div className="h-96 overflow-y-auto p-6 space-y-4">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.type === 'user' 
                        ? 'bg-red-500 text-white' 
                        : 'bg-slate-700 text-gray-200'
                    }`}>
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="border-t border-slate-700 p-4">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={aiChat}
                    onChange={(e) => setAiChat(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAiChat()}
                    placeholder="Ask about dApps, alpha opportunities, or DeFi strategies..."
                    className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                  />
                  <button
                    onClick={handleAiChat}
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>

            {/* AI Features */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Smart Analysis',
                  description: 'Get AI-powered insights on tokens, dApps, and market trends',
                  icon: Brain
                },
                {
                  title: 'Risk Assessment',
                  description: 'Evaluate investment risks with advanced algorithms',
                  icon: AlertCircle
                },
                {
                  title: 'Learning Guide',
                  description: 'Learn DeFi concepts with personalized tutorials',
                  icon: Info
                }
              ].map((feature, index) => (
                <div key={index} className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                  <feature.icon className="w-8 h-8 text-red-400 mb-3" />
                  <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Seilor;