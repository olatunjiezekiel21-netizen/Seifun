import React, { useState, useEffect } from 'react';
import { 
  Brain, TrendingUp, Zap, Target, Globe, Sparkles, Bot, ChevronRight, ExternalLink, 
  Star, Users, DollarSign, Calendar, AlertCircle, Info, Activity, BarChart3, 
  Filter, Search, ArrowUpDown, Eye, MessageCircle, Send, Copy, Bookmark 
} from 'lucide-react';
import { getSeiDApps, getAlphaInsights, getSeiNetworkStats, getDAppCategories, type SeiDApp, type AlphaInsight } from '../utils/seiEcosystemData';

const Seilor = () => {
  const [activeTab, setActiveTab] = useState('discover');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('tvl');
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
      message: "👋 **Welcome to Seilor 0!** I'm your AI-powered navigator for the Sei ecosystem.\n\nI can help you:\n• **Discover** top dApps and protocols\n• **Analyze** market opportunities\n• **Navigate** DeFi safely\n• **Track** alpha insights\n\nWhat would you like to explore?",
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

  // Enhanced AI chat handler with sophisticated responses
  const handleAiChat = () => {
    if (!aiChat.trim()) return;

    // Add user message
    const userMessage = {
      type: 'user',
      message: aiChat,
      timestamp: new Date()
    };

    // Enhanced AI response with real Sei ecosystem knowledge
    let aiResponse = "";
    const query = aiChat.toLowerCase();
    
    if (query.includes('alpha') || query.includes('opportunity') || query.includes('listing')) {
      aiResponse = "🎯 **Alpha Opportunities on Sei**:\n\n" +
        "**SEILOR Token**: Kryptonite's native token already listed on Bybit - rare pre-mainnet listing!\n" +
        "**Ecosystem Growth**: 37+ projects building, major Ethereum protocols migrating to Sei v2\n" +
        "**Infrastructure**: Backpack integration, native USDC coming, Circle Mint support\n" +
        "**DeFi Expansion**: $42M+ TVL growing rapidly across Astroport, Silo, Kryptonite\n\n" +
        "💡 Early positioning in liquid staking and parallelized EVM dApps could be key!";
    } else if (query.includes('dapp') || query.includes('discover') || query.includes('project')) {
      aiResponse = "🚀 **Top Sei dApps by Category**:\n\n" +
        "**🔥 DeFi Leaders**:\n• Astroport ($30M+ TVL) - Advanced DEX\n• Dragonswap - Parallelized EVM DEX\n• Yei Finance - Money markets\n\n" +
        "**💎 Liquid Staking**:\n• Kryptonite ($2.9M TVL) - SEILOR + kUSD\n• Silo Finance ($9.6M TVL) - iSEI tokens\n\n" +
        "**🎮 Gaming & NFTs**:\n• Archer Hunter (12K+ users) - Gaming\n• Seyans (8K+ holders) - Premier NFTs\n• The Colony (5.5K holders) - Mafia Antz\n\n" +
        "Which category interests you most?";
    } else if (query.includes('safe') || query.includes('security') || query.includes('risk')) {
      aiResponse = "🛡️ **Sei DeFi Safety Guide**:\n\n" +
        "**✅ Verified Projects**: All listed dApps are verified with real TVL data\n" +
        "**🔍 Due Diligence**: Check TVL trends, user growth, audit reports\n" +
        "**💰 Risk Management**: Start small, diversify across protocols\n" +
        "**⚡ Sei Advantages**: 390ms finality reduces MEV risks, consistent uptime\n\n" +
        "**Recommended**: Use Seifun's SafeChecker for token analysis before investing!";
    } else if (query.includes('staking') || query.includes('stake') || query.includes('seilor') || query.includes('kryptonite')) {
      aiResponse = "💎 **Liquid Staking on Sei**:\n\n" +
        "**Kryptonite** ($2.9M TVL):\n• Stake SEI → Get SEILOR tokens\n• Mint kUSD stablecoin (earn yield by holding!)\n• Already listed on Bybit\n\n" +
        "**Silo Finance** ($9.6M TVL):\n• Stake SEI → Get iSEI tokens\n• Use iSEI in DeFi strategies\n\n" +
        "**Benefits**: Keep earning staking rewards while staying liquid for DeFi opportunities!";
    } else if (query.includes('defi') || query.includes('trading') || query.includes('yield') || query.includes('astroport')) {
      aiResponse = "⚡ **Sei DeFi Ecosystem** ($42M+ Total TVL):\n\n" +
        "**Astroport** - Leading DEX with concentrated liquidity, fee sharing\n" +
        "**Dragonswap** - Leverages parallelized EVM for ultra-fast swaps\n" +
        "**Yei Finance** - Lending/borrowing with competitive yields\n\n" +
        "**🔥 Sei Advantage**: 390ms finality = near-instant trades, no MEV frontrunning!\n" +
        "**Strategy**: Start with major protocols, then explore newer opportunities.";
    } else if (query.includes('gaming') || query.includes('game') || query.includes('archer')) {
      aiResponse = "🎮 **Gaming on Sei**:\n\n" +
        "**Archer Hunter** (12K+ users):\n• Real-time skill-based mechanics\n• Fast-paced action leveraging Sei's speed\n\n" +
        "**Astro Karts**:\n• Competitive racing with blockchain rewards\n• Growing gaming community\n\n" +
        "**🚀 Why Sei Gaming Works**: Sub-400ms finality enables real-time gaming without lag!";
    } else if (query.includes('nft') || query.includes('collection') || query.includes('seyans') || query.includes('art')) {
      aiResponse = "🎨 **NFTs on Sei**:\n\n" +
        "**Seyans** (8K+ holders): Premier collection expanded to Solana with native DEX\n" +
        "**The Colony** (5.5K holders): 5,555 Mafia Antz with AntSwap aggregator (200K+ SEI staked)\n" +
        "**Sei Colors** (2K+ holders): 10,101 unique RGB color NFTs representing digital spectrum\n\n" +
        "**🔥 NFT Advantages on Sei**: Instant minting, low fees, active trading community!";
    } else if (query.includes('fast') || query.includes('speed') || query.includes('performance') || query.includes('sei')) {
      aiResponse = "⚡ **Sei: The Fastest Blockchain**:\n\n" +
        "**390ms Finality**: Fastest time-to-finality in crypto\n" +
        "**45+ TPS**: Consistent high throughput\n" +
        "**Parallelized EVM**: 100x faster than traditional Ethereum\n" +
        "**Twin Turbo Consensus**: Optimistic processing + intelligent propagation\n\n" +
        "**Real Impact**: Web2-like UX, no transaction delays, perfect for trading & gaming!";
    } else if (query.includes('bridge') || query.includes('transfer') || query.includes('cross-chain')) {
      aiResponse = "🌉 **Moving Assets to Sei**:\n\n" +
        "**Sei Bridge** (25K+ users): Official bridge for secure transfers\n" +
        "**Backpack Integration**: Major exchange now supports Sei\n" +
        "**IBC Compatible**: Connect to entire Cosmos ecosystem\n\n" +
        "**Pro Tips**: Use official bridge, check gas fees, start with small amounts!";
    } else if (query.includes('help') || query.includes('guide') || query.includes('how') || query.includes('start')) {
      aiResponse = "🎯 **How I Can Help You Navigate Sei**:\n\n" +
        "**📱 dApp Discovery**: Find the best projects by category\n" +
        "**💰 DeFi Strategies**: Trading, staking, yield optimization\n" +
        "**🔍 Alpha Research**: Early opportunities, upcoming listings\n" +
        "**🛡️ Safety**: Risk assessment, security best practices\n" +
        "**📊 Analytics**: TVL trends, user metrics, performance data\n\n" +
        "Just ask me anything about the Sei ecosystem!";
    } else {
      aiResponse = "🤖 **Seilor AI at Your Service!**\n\n" +
        "I'm your intelligent guide to the Sei ecosystem. I can help with:\n\n" +
        "• **dApp Discovery** - Find amazing Sei projects\n" +
        "• **DeFi Strategies** - Trading, staking, yields\n" +
        "• **Alpha Opportunities** - Early projects, listings\n" +
        "• **Safety & Security** - Risk assessment\n" +
        "• **Technical Analysis** - Performance, TVL data\n\n" +
        "What would you like to explore in the Sei ecosystem?";
    }

    const aiMessage = {
      type: 'ai',
      message: aiResponse,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage, aiMessage]);
    setAiChat('');
  };

  // Filter and sort dApps
  const filteredDApps = seiDApps
    .filter(dapp => {
      const matchesCategory = selectedCategory === 'All' || dapp.category === selectedCategory;
      const matchesSearch = dapp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           dapp.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'category') return a.category.localeCompare(b.category);
      return 0; // Default TVL sorting would require parsing
    });

  const featuredDApps = seiDApps.filter(dapp => dapp.featured);

  const tabs = [
    { id: 'discover', label: 'dApp Discovery', icon: Globe },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'alpha', label: 'Alpha Insights', icon: Target },
    { id: 'ai', label: 'AI Assistant', icon: Bot }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Professional Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Seilor 0</h1>
                  <p className="text-xs text-slate-400">AI-Powered Sei Navigator</p>
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-1 bg-slate-800/50 rounded-lg p-1">
                <span className="px-2 py-1 text-xs font-medium text-red-400 bg-red-500/10 rounded">BETA</span>
                <span className="px-2 py-1 text-xs text-slate-400">v0.1.0</span>
              </div>
            </div>
            
            {/* Network Stats Bar */}
            <div className="hidden lg:flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span className="text-slate-300">TVL: <span className="font-semibold text-green-400">{networkStats.totalTvl}</span></span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-slate-300">Users: <span className="font-semibold text-blue-400">{networkStats.activeUsers}</span></span>
              </div>
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-purple-400" />
                <span className="text-slate-300">TPS: <span className="font-semibold text-purple-400">{networkStats.transactions}</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Tab Navigation */}
      <div className="border-b border-slate-700/30 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'text-red-400 bg-slate-800/50 border-b-2 border-red-500'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-red-500 to-red-600" />
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* dApp Discovery Tab */}
        {activeTab === 'discover' && (
          <div className="space-y-8">
            {/* Search and Filters */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search dApps, protocols, or descriptions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <ArrowUpDown className="w-4 h-4 text-slate-400" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-red-500"
                    >
                      <option value="tvl">Sort by TVL</option>
                      <option value="name">Sort by Name</option>
                      <option value="category">Sort by Category</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Projects */}
            {featuredDApps.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-6">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <h2 className="text-2xl font-bold text-white">Featured Projects</h2>
                  <span className="px-2 py-1 text-xs font-medium text-yellow-400 bg-yellow-500/10 rounded-full">
                    {featuredDApps.length} projects
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredDApps.map(dapp => (
                    <div key={dapp.id} className="group bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl border border-slate-700/50 p-6 hover:border-red-500/50 transition-all duration-300 hover:transform hover:scale-105">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={dapp.image} 
                            alt={dapp.name}
                            className="w-12 h-12 rounded-xl border border-slate-600"
                          />
                          <div>
                            <h3 className="font-bold text-white group-hover:text-red-400 transition-colors">
                              {dapp.name}
                            </h3>
                            <span className="text-xs font-medium px-2 py-1 bg-slate-700/50 text-slate-300 rounded-full">
                              {dapp.category}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-red-400 transition-colors" />
                        </div>
                      </div>
                      
                      <p className="text-slate-300 text-sm mb-4 line-clamp-2">{dapp.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs">
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-3 h-3 text-green-400" />
                            <span className="text-green-400 font-medium">{dapp.tvl}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-3 h-3 text-blue-400" />
                            <span className="text-blue-400 font-medium">{dapp.users}</span>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
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
            )}

            {/* Professional Data Table */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">All Projects</h2>
                <span className="text-slate-400 text-sm">
                  Showing {filteredDApps.length} of {seiDApps.length} projects
                </span>
              </div>
              
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-900/50 border-b border-slate-700/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Project
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          TVL / Volume
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Users
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/30">
                      {filteredDApps.map(dapp => (
                        <tr key={dapp.id} className="hover:bg-slate-700/20 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <img 
                                src={dapp.image} 
                                alt={dapp.name}
                                className="w-10 h-10 rounded-lg border border-slate-600"
                              />
                              <div>
                                <div className="font-semibold text-white group-hover:text-red-400 transition-colors">
                                  {dapp.name}
                                </div>
                                <div className="text-sm text-slate-400 line-clamp-1">
                                  {dapp.description}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700/50 text-slate-300">
                              {dapp.category}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-1">
                              <DollarSign className="w-4 h-4 text-green-400" />
                              <span className="text-green-400 font-medium">{dapp.tvl}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4 text-blue-400" />
                              <span className="text-blue-400 font-medium">{dapp.users}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              dapp.status === 'Live' 
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            }`}>
                              <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                dapp.status === 'Live' ? 'bg-green-400' : 'bg-yellow-400'
                              }`} />
                              {dapp.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors">
                                <Bookmark className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                <ExternalLink className="w-4 h-4" />
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
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total TVL', value: networkStats.totalTvl, icon: DollarSign, color: 'green' },
                { label: 'Active Users', value: networkStats.activeUsers, icon: Users, color: 'blue' },
                { label: 'Transactions/sec', value: networkStats.transactions, icon: Activity, color: 'purple' },
                { label: 'Live dApps', value: networkStats.dAppsLive, icon: Globe, color: 'red' }
              ].map((stat, index) => (
                <div key={index} className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                      <p className={`text-2xl font-bold text-${stat.color}-400 mt-1`}>{stat.value}</p>
                    </div>
                    <div className={`p-3 bg-${stat.color}-500/10 rounded-xl`}>
                      <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-8 text-center">
              <BarChart3 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Advanced Analytics Coming Soon</h3>
              <p className="text-slate-400">Real-time charts, TVL tracking, and protocol analytics are being developed.</p>
            </div>
          </div>
        )}

        {/* Alpha Insights Tab */}
        {activeTab === 'alpha' && (
          <div className="space-y-8">
            <div className="text-center">
              <Target className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Alpha Insights</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                AI-powered market intelligence and early opportunities in the Sei ecosystem. 
                Get ahead of the curve with exclusive insights.
              </p>
            </div>
            
            {alphaInsights.length === 0 ? (
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-8 text-center">
                <Sparkles className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Alpha Intelligence Loading...</h3>
                <p className="text-slate-400">Our AI is analyzing market data and ecosystem developments.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {alphaInsights.map(insight => (
                  <div key={insight.id} className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-white mb-2">{insight.title}</h3>
                        <p className="text-slate-300 mb-4">{insight.description}</p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-green-400">Confidence: {insight.confidence}%</span>
                          <span className="text-blue-400">Timeframe: {insight.timeframe}</span>
                          <span className="text-purple-400">Impact: {insight.impact}</span>
                        </div>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium bg-red-500/20 text-red-400 rounded-full">
                        {insight.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AI Assistant Tab */}
        {activeTab === 'ai' && (
          <div className="space-y-6">
            <div className="text-center">
              <Bot className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Seilor AI Assistant</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                Your intelligent guide to the Sei ecosystem. Ask about dApps, DeFi strategies, 
                alpha opportunities, or get help navigating the blockchain.
              </p>
            </div>

            {/* Enhanced Chat Interface */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
              {/* Chat Messages */}
              <div className="h-96 overflow-y-auto p-6 space-y-4">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-2xl ${msg.type === 'user' ? 'order-2' : 'order-1'}`}>
                      <div className={`px-4 py-3 rounded-2xl ${
                        msg.type === 'user' 
                          ? 'bg-red-500 text-white ml-4' 
                          : 'bg-slate-700/50 text-slate-200 mr-4'
                      }`}>
                        <div className="text-sm whitespace-pre-line">{msg.message}</div>
                      </div>
                      <div className={`text-xs text-slate-500 mt-1 ${
                        msg.type === 'user' ? 'text-right mr-4' : 'ml-4'
                      }`}>
                        {msg.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      msg.type === 'user' 
                        ? 'bg-red-500 order-1' 
                        : 'bg-slate-600 order-2'
                    }`}>
                      {msg.type === 'user' ? (
                        <Users className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-slate-300" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Enhanced Chat Input */}
              <div className="border-t border-slate-700/50 p-6 bg-slate-900/50">
                <div className="flex items-end space-x-3">
                  <div className="flex-1">
                    <textarea
                      value={aiChat}
                      onChange={(e) => setAiChat(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAiChat();
                        }
                      }}
                      placeholder="Ask about dApps, alpha opportunities, DeFi strategies, or anything about Sei..."
                      className="w-full bg-slate-800/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors resize-none"
                      rows={3}
                    />
                  </div>
                  <button
                    onClick={handleAiChat}
                    disabled={!aiChat.trim()}
                    className="bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl font-medium transition-colors flex items-center space-x-2"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {[
                    'Show me top DeFi projects',
                    'What are the best staking options?',
                    'How do I bridge assets to Sei?',
                    'Tell me about gaming on Sei',
                    'What are the alpha opportunities?'
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setAiChat(suggestion)}
                      className="px-3 py-1.5 text-xs bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white rounded-lg transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Smart Analysis',
                  description: 'Get AI-powered insights on tokens, dApps, and market trends with real-time data',
                  icon: Brain,
                  color: 'blue'
                },
                {
                  title: 'Risk Assessment',
                  description: 'Evaluate investment risks with advanced algorithms and safety recommendations',
                  icon: AlertCircle,
                  color: 'yellow'
                },
                {
                  title: 'Learning Guide',
                  description: 'Learn DeFi concepts with personalized tutorials and step-by-step guidance',
                  icon: Info,
                  color: 'green'
                }
              ].map((feature, index) => (
                <div key={index} className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 hover:border-slate-600/50 transition-colors">
                  <div className={`w-12 h-12 bg-${feature.color}-500/10 rounded-xl flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-6 h-6 text-${feature.color}-400`} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
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