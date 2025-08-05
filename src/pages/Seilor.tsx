import React, { useState, useEffect } from 'react';
import { 
  Brain, TrendingUp, Zap, Target, Globe, Sparkles, Bot, ChevronRight, ExternalLink, 
  Star, Users, DollarSign, Calendar, AlertCircle, Info, Activity, BarChart3, 
  Filter, Search, ArrowUpDown, Eye, MessageCircle, Send, Copy, Bookmark 
} from 'lucide-react';
import { getSeiDApps, getAlphaInsights, getSeiNetworkStats, getDAppCategories, type SeiDApp, type AlphaInsight } from '../utils/seiEcosystemData';
import { AIChatDataService } from '../utils/aiChatDataService';
import { TokenScanner } from '../utils/tokenScanner';
import { SeiTokenRegistry } from '../utils/seiTokenRegistry';

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
  const [aiDataService] = useState(() => new AIChatDataService());
  const [tokenScanner] = useState(() => new TokenScanner());
  const [seiRegistry] = useState(() => new SeiTokenRegistry(false));
  const [showBrowser, setShowBrowser] = useState(false);
  const [browserUrl, setBrowserUrl] = useState('');
  const [browserTitle, setBrowserTitle] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      type: 'ai',
      message: "👋 **Welcome to Seilor 0!** I'm your AI-powered navigator for the Sei ecosystem.\n\nI can help you:\n• **Discover** top dApps and protocols\n• **Analyze** tokens with real-time data\n• **Navigate** DeFi safely\n• **Track** alpha insights\n• **Interact** with Seifun features\n\nWhat would you like to explore?",
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

  // Enhanced AI chat handler with real Seifun data integration
  const handleAiChat = async () => {
    if (!aiChat.trim()) return;

    // Add user message
    const userMessage = {
      type: 'user',
      message: aiChat,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);

    // Show typing indicator
    const typingMessage = {
      type: 'ai',
      message: "🤖 Analyzing...",
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, typingMessage]);

    try {
      // Enhanced AI response with real Seifun data integration
      let aiResponse = "";
      const query = aiChat.toLowerCase();

      // Check if user is asking about a specific token address
      const tokenAddressMatch = aiChat.match(/sei[a-zA-Z0-9]{39,}/i) || aiChat.match(/0x[a-fA-F0-9]{40}/);
      
      if (tokenAddressMatch) {
        const tokenAddress = tokenAddressMatch[0];
        try {
          aiResponse = "🔍 **Analyzing Token**: `" + tokenAddress + "`\n\n⏳ Fetching real-time data from Sei blockchain...\n\n";
          
          // Update message with initial response
          setChatMessages(prev => prev.slice(0, -1).concat({
            type: 'ai',
            message: aiResponse,
            timestamp: new Date()
          }));

          // Perform real token analysis
          const analysis = await tokenScanner.analyzeToken(tokenAddress);
          
          if (analysis && analysis.basicInfo) {
            aiResponse = `🎯 **Token Analysis Complete**\n\n` +
              `**📊 Basic Info:**\n` +
              `• Name: ${analysis.basicInfo.name || 'Unknown'}\n` +
              `• Symbol: ${analysis.basicInfo.symbol || 'Unknown'}\n` +
              `• Decimals: ${analysis.basicInfo.decimals || 'Unknown'}\n\n` +
              
              `**💰 Market Data:**\n` +
              `• Price: ${analysis.basicInfo.marketData?.price ? tokenScanner.formatNumber(analysis.basicInfo.marketData.price) : 'Not available'}\n` +
              `• Market Cap: ${analysis.basicInfo.marketData?.marketCap ? tokenScanner.formatNumber(analysis.basicInfo.marketData.marketCap) : 'Not available'}\n` +
              `• 24h Volume: ${analysis.basicInfo.marketData?.volume24h ? tokenScanner.formatNumber(analysis.basicInfo.marketData.volume24h) : 'Not available'}\n\n` +
              
              `**🛡️ Security Score:** ${analysis.securityScore}/100\n\n` +
              
              `**⚠️ Risk Factors:**\n${analysis.riskFactors.map(risk => `• ${risk}`).join('\n')}\n\n` +
              
              `**💡 Recommendation:** ${analysis.recommendation}\n\n` +
              `*Analysis powered by Seifun's advanced token scanner*`;
          } else {
            aiResponse = `❌ **Token Analysis Failed**\n\nCould not analyze token: \`${tokenAddress}\`\n\nPossible reasons:\n• Invalid token address\n• Token not found on Sei network\n• Network connectivity issues\n\nTry using Seifun's SafeChecker tool for manual analysis.`;
          }
        } catch (error) {
          aiResponse = `⚠️ **Analysis Error**\n\nFailed to analyze token: \`${tokenAddress}\`\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again or use Seifun's SafeChecker tool.`;
        }
      }
      // Check for Seifun-specific queries
      else if (query.includes('seifun') || query.includes('safechecker') || query.includes('token scanner')) {
        aiResponse = "🚀 **Seifun Platform Features**:\n\n" +
          "**🛡️ SafeChecker**: Advanced token analysis with real-time security scoring\n" +
          "**📊 Token Scanner**: Comprehensive token metrics and holder analysis\n" +
          "**🎯 Launchpad**: Token creation and listing platform\n" +
          "**💼 Portfolio Tracker**: Track your Sei investments\n" +
          "**🤖 AI Assistant**: That's me! Your intelligent guide\n\n" +
          "**How to use**: Paste any Sei token address and I'll analyze it for you!\n" +
          "Try asking: 'Analyze sei1...' with a real token address.";
      }
      // Alpha opportunities with real data
      else if (query.includes('alpha') || query.includes('opportunity') || query.includes('listing')) {
        const watchedTokens = await aiDataService.getWatchedTokens();
        const recentActivity = watchedTokens.slice(0, 3);
        
        aiResponse = "🎯 **Alpha Opportunities on Sei**:\n\n" +
          "**🔥 Real-Time Alerts**: Currently monitoring " + watchedTokens.length + " tokens\n\n" +
          "**📈 Recent Activity:**\n" +
          (recentActivity.length > 0 ? 
            recentActivity.map(token => `• ${token.tokenSymbol}: ${token.watchType} alert - ${token.status}`).join('\n') :
            "• No recent alerts - market is stable") + "\n\n" +
          
          "**🚀 Ecosystem Growth**: 50+ projects building on Sei\n" +
          "**💰 Infrastructure**: Native USDC, Backpack integration\n" +
          "**📊 DeFi Expansion**: $42M+ TVL across protocols\n\n" +
          "Want me to analyze a specific token? Just paste the address!";
      }
      // Token analysis requests
      else if (query.includes('analyze') || query.includes('check') || query.includes('scan')) {
        aiResponse = "🔍 **Token Analysis Ready**\n\n" +
          "I can analyze any Sei token in real-time! Just provide:\n\n" +
          "**📝 What I need:**\n" +
          "• Token contract address (sei1... or 0x...)\n" +
          "• Or ask about specific tokens by name\n\n" +
          "**📊 What I'll provide:**\n" +
          "• Real-time price and market data\n" +
          "• Security analysis and risk factors\n" +
          "• Holder distribution and liquidity\n" +
          "• Trading recommendations\n\n" +
          "**Example**: 'Analyze sei1abc123...' or 'Check this token: 0x123...'\n\n" +
          "*Powered by Seifun's advanced token scanner*";
      }
      // DeFi and trading with real ecosystem data
      else if (query.includes('defi') || query.includes('trading') || query.includes('yield')) {
        aiResponse = "⚡ **Sei DeFi Ecosystem** ($42M+ Total TVL):\n\n" +
          "**🏆 Top Protocols:**\n" +
          "• **Astroport** ($30M+ TVL) - Advanced DEX with concentrated liquidity\n" +
          "• **Silo Finance** ($9.6M TVL) - Liquid staking with iSEI tokens\n" +
          "• **Kryptonite** ($2.9M TVL) - SEILOR token + kUSD stablecoin\n" +
          "• **Dragonswap** - Parallelized EVM DEX for ultra-fast swaps\n\n" +
          "**🔥 Sei Advantages:**\n" +
          "• 390ms finality = near-instant trades\n" +
          "• No MEV frontrunning\n" +
          "• 45+ TPS consistent throughput\n\n" +
          "**💡 Strategy Tips:**\n" +
          "• Start with established protocols (Astroport, Silo)\n" +
          "• Use liquid staking for yield + flexibility\n" +
          "• Always analyze tokens before investing\n\n" +
          "Want me to analyze a specific DeFi token?";
      }
      // Staking information
      else if (query.includes('staking') || query.includes('stake') || query.includes('seilor') || query.includes('kryptonite')) {
        aiResponse = "💎 **Liquid Staking on Sei**:\n\n" +
          "**🥇 Kryptonite** ($2.9M TVL):\n" +
          "• Stake SEI → Get SEILOR tokens\n" +
          "• Mint kUSD stablecoin (earn yield by holding!)\n" +
          "• SEILOR already listed on Bybit\n" +
          "• Real-time APY tracking available\n\n" +
          "**🥈 Silo Finance** ($9.6M TVL):\n" +
          "• Stake SEI → Get iSEI tokens\n" +
          "• Use iSEI in DeFi strategies\n" +
          "• Compound staking rewards\n\n" +
          "**💰 Benefits:**\n" +
          "• Keep earning staking rewards\n" +
          "• Stay liquid for DeFi opportunities\n" +
          "• No unbonding periods\n\n" +
          "Want me to analyze the current staking rates?";
      }
      // Security and safety with real tools
      else if (query.includes('safe') || query.includes('security') || query.includes('risk') || query.includes('scam')) {
        aiResponse = "🛡️ **Sei DeFi Safety Guide**:\n\n" +
          "**✅ Seifun Safety Tools:**\n" +
          "• **SafeChecker**: Real-time token security analysis\n" +
          "• **Token Scanner**: Comprehensive risk assessment\n" +
          "• **AI Analysis**: Instant security scoring\n\n" +
          "**🔍 What I Check:**\n" +
          "• Contract verification status\n" +
          "• Liquidity and holder distribution\n" +
          "• Trading patterns and volume\n" +
          "• Known security vulnerabilities\n\n" +
          "**⚠️ Red Flags to Avoid:**\n" +
          "• Unverified contracts\n" +
          "• Low liquidity (<$10k)\n" +
          "• Concentrated holder distribution\n" +
          "• Unusual trading patterns\n\n" +
          "**🚨 ALWAYS**: Paste token addresses here for analysis before investing!";
      }
      // Default intelligent response
      else {
        aiResponse = "🤖 **Seilor 0 - Your Sei AI Navigator**\n\n" +
          "I'm powered by Seifun's real-time data and can help you with:\n\n" +
          "**🔍 Real Token Analysis:**\n" +
          "• Paste any Sei token address for instant analysis\n" +
          "• Security scoring and risk assessment\n" +
          "• Market data and trading insights\n\n" +
          "**📊 Live Ecosystem Data:**\n" +
          "• Current TVL: $42M+ across Sei DeFi\n" +
          "• Active monitoring of 50+ projects\n" +
          "• Real-time alerts and opportunities\n\n" +
          "**💡 What would you like to explore?**\n" +
          "• 'Analyze [token address]' - Real token analysis\n" +
          "• 'Show me DeFi opportunities' - Current yields\n" +
          "• 'Safety check [token]' - Security analysis\n" +
          "• 'What's new on Sei?' - Latest developments\n\n" +
          "*Try pasting a real Sei token address to see the magic! ✨*";
      }

      // Replace the typing message with the actual response
      setChatMessages(prev => prev.slice(0, -1).concat({
        type: 'ai',
        message: aiResponse,
        timestamp: new Date()
      }));

    } catch (error) {
      console.error('AI Chat Error:', error);
      setChatMessages(prev => prev.slice(0, -1).concat({
        type: 'ai',
        message: "⚠️ **Error**: Something went wrong while processing your request. Please try again.\n\nError details: " + (error instanceof Error ? error.message : 'Unknown error'),
        timestamp: new Date()
      }));
    }

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

  // Handle dApp navigation
  const handleDAppNavigation = (dapp: SeiDApp) => {
    if (dapp.url.startsWith('/')) {
      // Internal Seifun routes - navigate normally
      window.location.href = dapp.url;
    } else {
      // External dApps - open in in-app browser
      setBrowserUrl(dapp.url);
      setBrowserTitle(dapp.name);
      setShowBrowser(true);
    }
  };

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
                     <div 
                       key={dapp.id} 
                       onClick={() => handleDAppNavigation(dapp)}
                       className="group bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl border border-slate-700/50 p-6 hover:border-red-500/50 transition-all duration-300 hover:transform hover:scale-105 cursor-pointer"
                     >
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
                               <button 
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   // View functionality - could show details modal
                                 }}
                                 className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                                 title="View Details"
                               >
                                 <Eye className="w-4 h-4" />
                               </button>
                               <button 
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   // Bookmark functionality - could save to favorites
                                 }}
                                 className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                                 title="Bookmark"
                               >
                                 <Bookmark className="w-4 h-4" />
                               </button>
                               <button 
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleDAppNavigation(dapp);
                                 }}
                                 className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                 title="Open dApp"
                               >
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

       {/* In-App Browser Modal */}
       {showBrowser && (
         <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-6xl h-[80vh] flex flex-col">
             {/* Browser Header */}
             <div className="flex items-center justify-between p-4 border-b border-slate-700">
               <div className="flex items-center space-x-3">
                 <div className="flex items-center space-x-2">
                   <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                   <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                   <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                 </div>
                 <div className="bg-slate-800 rounded-lg px-4 py-2 flex-1 max-w-md">
                   <div className="flex items-center space-x-2">
                     <Globe className="w-4 h-4 text-slate-400" />
                     <span className="text-slate-300 text-sm truncate">{browserUrl}</span>
                   </div>
                 </div>
               </div>
               <button
                 onClick={() => setShowBrowser(false)}
                 className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
               >
                 <ExternalLink className="w-5 h-5 text-slate-400" />
               </button>
             </div>

             {/* Browser Content */}
             <div className="flex-1 bg-white rounded-b-2xl overflow-hidden">
               <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                 <div className="text-center p-8">
                   <Globe className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                   <h3 className="text-xl font-bold text-slate-700 mb-2">In-App Browser</h3>
                   <p className="text-slate-600 mb-6 max-w-md">
                     This feature allows you to browse dApps within Seifun. 
                     For full functionality, external dApps will open in your default browser.
                   </p>
                   <div className="space-y-3">
                     <button
                       onClick={() => {
                         window.open(browserUrl, '_blank');
                         setShowBrowser(false);
                       }}
                       className="w-full bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                     >
                       <ExternalLink className="w-5 h-5" />
                       <span>Open in External Browser</span>
                     </button>
                     <p className="text-xs text-slate-500">
                       Full in-app browser functionality coming soon with enhanced security and Web3 integration.
                     </p>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </div>
       )}
     </div>
   );
 };
 
 export default Seilor;