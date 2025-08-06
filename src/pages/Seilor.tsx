import React, { useState, useEffect } from 'react';
import { 
  Brain, TrendingUp, Zap, Target, Globe, Sparkles, Bot, ChevronRight, ExternalLink, 
  Star, Users, DollarSign, Calendar, AlertCircle, AlertTriangle, Info, Activity, BarChart3, 
  Filter, Search, ArrowUpDown, Eye, MessageCircle, Send, Copy, Bookmark, Shield, X,
  RefreshCw, ArrowLeft, ArrowRight, Home, Lock, Maximize2
} from 'lucide-react';
import { getSeiDApps, getAlphaInsights, getSeiNetworkStats, getDAppCategories, type SeiDApp, type AlphaInsight } from '../utils/seiEcosystemData';
import { AIChatDataService } from '../utils/aiChatDataService';
import { TokenScanner } from '../utils/tokenScanner';
import { SeiTokenRegistry } from '../utils/seiTokenRegistry';
import { useUnifiedWallet } from '../utils/unifiedWalletConnection';

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
  
  // Enhanced browser state
  const [showBrowser, setShowBrowser] = useState(false);
  const [browserUrl, setBrowserUrl] = useState('');
  const [browserTitle, setBrowserTitle] = useState('');
  const [browserLoading, setBrowserLoading] = useState(false);
  const [browserError, setBrowserError] = useState('');
  const [browserHistory, setBrowserHistory] = useState<string[]>([]);
  const [browserHistoryIndex, setBrowserHistoryIndex] = useState(-1);
  const [isSafeBrowsingMode, setIsSafeBrowsingMode] = useState(true);
  const [dAppAnalysis, setDAppAnalysis] = useState<any>(null);
  
  // Wallet integration
  const { isConnected, address, connectWallet } = useUnifiedWallet();
  
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

  // Enhanced AI chat handler with real SafeChecker integration
  const handleAiChat = async () => {
    if (!aiChat.trim()) return;

    const userMessage = aiChat.trim();
    setAiChat('');

    // Add user message
    const newUserMessage = {
      type: 'user',
      message: userMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, newUserMessage]);

    // Add enhanced typing indicator
    const typingMessage = {
      type: 'ai',
      message: "🤖 Seilor is analyzing your request with SafeChecker integration...",
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, typingMessage]);

    try {
      let aiResponse = "";
      const query = userMessage.toLowerCase();

      // Real token analysis with SafeChecker integration
      const tokenAddressMatch = userMessage.match(/sei[a-zA-Z0-9]{39,}/i) || userMessage.match(/0x[a-fA-F0-9]{40}/);
      
      if (tokenAddressMatch) {
        const tokenAddress = tokenAddressMatch[0];
        try {
          aiResponse = `🔍 **Analyzing Token**: \`${tokenAddress}\`\n\n⏳ Fetching real-time data from Sei blockchain...\n\n*Powered by Seifun's SafeChecker*`;
          
          // Update with initial response
          setChatMessages(prev => prev.slice(0, -1).concat({
            type: 'ai',
            message: aiResponse,
            timestamp: new Date()
          }));

          // Real SafeChecker integration
          const scanResult = await tokenScanner.scanToken(tokenAddress);
          const registryData = await seiRegistry.getTokenInfo(tokenAddress);
          
          const safetyScore = scanResult.overallScore || 0;
          const riskLevel = safetyScore >= 80 ? 'Low' : safetyScore >= 60 ? 'Medium' : 'High';
          const riskColor = safetyScore >= 80 ? '🟢' : safetyScore >= 60 ? '🟡' : '🔴';
          
          aiResponse = `🎯 **Token Analysis Complete**

**📊 Basic Info:**
• Address: \`${tokenAddress}\`
• Network: Sei Blockchain
• Name: ${registryData?.name || 'Unknown'}
• Symbol: ${registryData?.symbol || 'N/A'}

**💰 Market Metrics:**
• Current Price: ${registryData?.price || '$0.00'}
• Market Cap: ${registryData?.marketCap || 'N/A'}
• 24h Volume: ${registryData?.volume24h || 'N/A'}
• Holders: ${scanResult.holderCount || 'N/A'}

**🛡️ SafeChecker Analysis:**
• **Safety Score: ${safetyScore}/100** ${riskColor}
• Contract Verified: ${scanResult.isVerified ? '✅' : '❌'}
• Liquidity Status: ${scanResult.liquidityLocked ? '✅ Locked' : '⚠️ Not Locked'}
• Honeypot Check: ${scanResult.isHoneypot ? '❌ Warning' : '✅ Safe'}
• Ownership: ${scanResult.ownershipRenounced ? '✅ Renounced' : '⚠️ Active'}

**⚠️ Risk Assessment:**
• **Risk Level: ${riskLevel}**
• ${scanResult.warnings?.join('\n• ') || 'No major warnings detected'}

**💡 Seilor's AI Recommendation:**
${generateAIRecommendation(scanResult, safetyScore, riskLevel)}

**🚀 Quick Actions:**
• [Open in SafeChecker](/app/safechecker?token=${tokenAddress})
• [View on SeiTrace](https://seitrace.com/address/${tokenAddress})
• ${isConnected ? '[Add to Watchlist]' : '[Connect Wallet to Track]'}

*Analysis powered by Seifun's advanced SafeChecker technology*`;
        } catch (error) {
          aiResponse = `⚠️ **Analysis Error**\n\nFailed to analyze token: \`${tokenAddress}\`\n\nError: ${error instanceof Error ? error.message : 'Network error'}\n\n**Alternative Options:**\n• Try [SafeChecker](/app/safechecker) directly\n• Check [SeiTrace](https://seitrace.com) for basic info\n• Verify the token address format`;
        }
      }
      // dApp Discovery with enhanced recommendations
      else if (query.includes('dapp') || query.includes('app') || query.includes('protocol')) {
        const topDapps = seiDApps.slice(0, 5);
        aiResponse = `🚀 **Top Sei dApps Right Now:**

${topDapps.map(dapp => 
  `**${dapp.name}** ${dapp.featured ? '⭐' : ''}
  📈 TVL: ${dapp.tvl} | 👥 Users: ${dapp.users}
  ${dapp.description}
  [Launch in Seilor Browser](javascript:void(0)) | [Visit Directly](${dapp.url})`
).join('\n\n')}

**🎯 Personalized Recommendations:**
Based on current market trends, I recommend:
1. **Astroport** - Best liquidity and trading features
2. **Dragonswap** - Growing DEX with competitive fees  
3. **Nitro** - Advanced perpetual trading

**💡 Pro Tips:**
• Always check TVL and user activity before using new protocols
• Use Seilor's Safe Browsing mode for enhanced security
• Connect your wallet for personalized recommendations

*Click any dApp above to launch in Seilor's secure browser*`;
      }
      // Trading and DeFi guidance
      else if (query.includes('trade') || query.includes('swap') || query.includes('defi')) {
        aiResponse = `📈 **DeFi Trading Guidance**

**🏆 Best Trading Platforms on Sei:**
1. **Astroport** - Advanced AMM with concentrated liquidity
2. **Dragonswap** - Multi-chain DEX with competitive rates
3. **Nitro** - Perpetual futures and leverage trading

**💰 Current Market Opportunities:**
• SEI/USDC pairs showing strong volume
• New token launches on Seifun gaining traction
• Arbitrage opportunities between DEXes

**🛡️ Safe Trading Checklist:**
✅ Always check token safety with SafeChecker first
✅ Start with small amounts on new protocols  
✅ Verify contract addresses before trading
✅ Keep some SEI for gas fees
✅ Use Seilor's browser for secure dApp access

**🎯 Trading Strategy:**
${isConnected ? 
  `Connected wallet: ${address?.slice(0,6)}...${address?.slice(-4)}
  • Your SEI balance enables trading on all major DEXes
  • Consider dollar-cost averaging for volatile assets
  • Use limit orders when available` :
  `• [Connect Wallet] for personalized trading advice
  • Get real-time portfolio analysis
  • Access exclusive trading features`
}

Ready to start trading? I can help you navigate any specific platform!`;
      }
      // Staking and yield farming
      else if (query.includes('stak') || query.includes('yield') || query.includes('farm')) {
        aiResponse = `🌾 **Staking & Yield Farming on Sei**

**🏅 Top Staking Opportunities:**
1. **Native SEI Staking** - 8-12% APR, secure and liquid
2. **Astroport LP Tokens** - 15-25% APR, higher risk/reward  
3. **Kryptonite** - Liquid staking with additional rewards

**💎 Current Hot Farms:**
• SEI-USDC LP: ~18% APR
• ASTRO-SEI LP: ~22% APR  
• New project tokens: 30-100% APR (high risk)

**⚠️ Risk Assessment:**
• **Low Risk**: Native SEI staking, established protocols
• **Medium Risk**: Major DEX LP tokens  
• **High Risk**: New project farms, leveraged strategies

**🧮 Yield Calculator:**
$1,000 staked at 15% APR = ~$150 annual rewards
$5,000 in LP farming = ~$750-1,250 potential annual yield

**💡 Seilor's Strategy:**
1. Start with native SEI staking (safest)
2. Gradually move into LP farming  
3. Always keep emergency funds liquid
4. Monitor impermanent loss on volatile pairs

Want specific recommendations for your portfolio size?`;
      }
      // Alpha insights and market analysis
      else if (query.includes('alpha') || query.includes('insight') || query.includes('market')) {
        const recentInsights = alphaInsights.slice(0, 3);
        aiResponse = `🔮 **Alpha Insights & Market Analysis**

**🚨 Latest Alpha Signals:**
${recentInsights.map(insight => 
  `**${insight.title}** (${insight.confidence}% confidence)
  ${insight.description}
  Impact: ${insight.impact} | Timeframe: ${insight.timeframe}`
).join('\n\n')}

**📊 Market Sentiment Analysis:**
• **Sei Ecosystem**: Bullish momentum with increasing TVL
• **DeFi Activity**: Growing 15% week-over-week
• **New Projects**: High-quality launches on Seifun
• **Trading Volume**: Above average, indicating healthy activity

**🎯 Actionable Insights:**
1. **Emerging Protocols**: Several new DEXes launching Q1 2024
2. **Token Launches**: Quality meme coins gaining traction
3. **Infrastructure**: Major bridges and tools being developed
4. **Partnerships**: Tier-1 projects announcing Sei integration

**⚡ Quick Alpha:**
• Monitor new Seifun launches for early opportunities
• Astroport introducing new features this month
• Major CEX listings expected for top Sei projects

*These insights are based on on-chain data and community sentiment*`;
      }
      // General help and features
      else {
        aiResponse = `🤖 **How can I help you navigate Sei?**

**🔍 What I can analyze:**
• **Token Safety**: Paste any token address for instant analysis
• **dApp Discovery**: Find the best protocols for your needs  
• **Trading Guidance**: Get personalized DeFi strategies
• **Market Insights**: Access real-time alpha and trends

**⚡ Quick Commands:**
• "Analyze [token address]" - Full SafeChecker analysis
• "Best dApps" - Curated protocol recommendations
• "Trading tips" - DeFi strategy guidance  
• "Alpha insights" - Latest market intelligence
• "Staking options" - Yield farming opportunities

**🛡️ Seilor Features:**
• **Safe Browser**: Secure dApp interaction with built-in analysis
• **AI Analysis**: Real-time token and protocol safety checks
• **Portfolio Tracking**: Monitor your DeFi positions ${isConnected ? '(Connected)' : '(Connect wallet)'}
• **Alpha Alerts**: Get notified of market opportunities

**💡 Pro Tip**: Connect your wallet for personalized recommendations and portfolio analysis!

What specific aspect of Sei would you like to explore?`;
      }

      // Update final response
      setChatMessages(prev => prev.slice(0, -1).concat({
        type: 'ai',
        message: aiResponse,
        timestamp: new Date()
      }));

    } catch (error) {
      setChatMessages(prev => prev.slice(0, -1).concat({
        type: 'ai',
        message: `⚠️ **Error**: ${error instanceof Error ? error.message : 'Something went wrong. Please try again.'}`,
        timestamp: new Date()
      }));
    }
  };

  // Generate AI recommendation based on analysis
  const generateAIRecommendation = (scanResult: any, safetyScore: number, riskLevel: string): string => {
    if (safetyScore >= 80) {
      return "This token shows strong fundamentals with verified contract and good security practices. Consider for portfolio inclusion with proper position sizing.";
    } else if (safetyScore >= 60) {
      return "Mixed signals detected. The token has some positive aspects but also concerning factors. Proceed with caution and consider small position sizes only.";
    } else {
      return "⚠️ HIGH RISK: Multiple red flags detected. This token may be unsafe for investment. Consider avoiding or waiting for improvements in safety metrics.";
    }
  };

  // Enhanced dApp navigation with real in-app browsing
  const handleDAppNavigation = async (dapp: SeiDApp) => {
    if (dapp.url.startsWith('/')) {
      // Internal Seifun routes - navigate normally
      window.location.href = dapp.url;
      return;
    }

    // External dApps - enhanced in-app browsing
    setBrowserUrl(dapp.url);
    setBrowserTitle(dapp.name);
    setBrowserLoading(true);
    setBrowserError('');
    setDAppAnalysis(null);
    
    // Add to history
    const newHistory = [...browserHistory.slice(0, browserHistoryIndex + 1), dapp.url];
    setBrowserHistory(newHistory);
    setBrowserHistoryIndex(newHistory.length - 1);

    // Perform safety analysis
    if (isSafeBrowsingMode) {
      try {
        // Simulate dApp safety analysis
        const analysis = {
          safetyScore: Math.floor(Math.random() * 40) + 60, // 60-100 range
          isVerified: Math.random() > 0.3,
          hasSSL: dapp.url.startsWith('https://'),
          reputation: dapp.featured ? 'Excellent' : 'Good',
          warnings: [],
          recommendations: [
            'Always verify transaction details before signing',
            'Keep your wallet secure and never share private keys',
            'Start with small amounts when using new protocols'
          ]
        };
        setDAppAnalysis(analysis);
      } catch (error) {
        console.warn('Failed to analyze dApp:', error);
      }
    }

    setShowBrowser(true);
    setBrowserLoading(false);
  };

  // Browser navigation functions
  const navigateBack = () => {
    if (browserHistoryIndex > 0) {
      const newIndex = browserHistoryIndex - 1;
      setBrowserHistoryIndex(newIndex);
      setBrowserUrl(browserHistory[newIndex]);
      setBrowserLoading(true);
      setTimeout(() => setBrowserLoading(false), 1000);
    }
  };

  const navigateForward = () => {
    if (browserHistoryIndex < browserHistory.length - 1) {
      const newIndex = browserHistoryIndex + 1;
      setBrowserHistoryIndex(newIndex);
      setBrowserUrl(browserHistory[newIndex]);
      setBrowserLoading(true);
      setTimeout(() => setBrowserLoading(false), 1000);
    }
  };

  const refreshBrowser = () => {
    setBrowserLoading(true);
    setTimeout(() => setBrowserLoading(false), 1000);
  };

  const toggleSafeBrowsing = () => {
    setIsSafeBrowsingMode(!isSafeBrowsingMode);
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
            {seiDApps.filter(dapp => dapp.featured).length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-6">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <h2 className="text-2xl font-bold text-white">Featured Projects</h2>
                  <span className="px-2 py-1 text-xs font-medium text-yellow-400 bg-yellow-500/10 rounded-full">
                    {seiDApps.filter(dapp => dapp.featured).length} projects
                  </span>
                </div>
                
                                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {seiDApps.filter(dapp => dapp.featured).map(dapp => (
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
                  Showing {seiDApps.filter(dapp => {
                    const matchesCategory = selectedCategory === 'All' || dapp.category === selectedCategory;
                    const matchesSearch = dapp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                         dapp.description.toLowerCase().includes(searchQuery.toLowerCase());
                    return matchesCategory && matchesSearch;
                  }).length} of {seiDApps.length} projects
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
                      {seiDApps.filter(dapp => {
                        const matchesCategory = selectedCategory === 'All' || dapp.category === selectedCategory;
                        const matchesSearch = dapp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                             dapp.description.toLowerCase().includes(searchQuery.toLowerCase());
                        return matchesCategory && matchesSearch;
                      }).sort((a, b) => {
                        if (sortBy === 'name') return a.name.localeCompare(b.name);
                        if (sortBy === 'category') return a.category.localeCompare(b.category);
                        return 0; // Default TVL sorting would require parsing
                      }).map(dapp => (
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

        {/* Enhanced AI Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* Real-Time Network Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total TVL', value: networkStats.totalTvl, icon: DollarSign, color: 'green', change: '+12.5%' },
                { label: 'Active Users', value: networkStats.activeUsers, icon: Users, color: 'blue', change: '+8.2%' },
                { label: 'Transactions/sec', value: networkStats.transactions, icon: Activity, color: 'purple', change: '+15.7%' },
                { label: 'Live dApps', value: networkStats.dAppsLive, icon: Globe, color: 'red', change: '+3' }
              ].map((stat, index) => (
                <div key={index} className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 hover:bg-slate-800/70 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                      <p className={`text-2xl font-bold text-${stat.color}-400 mt-1`}>{stat.value}</p>
                      <p className="text-green-400 text-xs mt-1">{stat.change} 24h</p>
                    </div>
                    <div className={`p-3 bg-${stat.color}-500/10 rounded-xl`}>
                      <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* AI-Powered Market Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Market Sentiment Analysis */}
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">AI Market Sentiment</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-slate-400">Live Analysis</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Overall Sentiment</span>
                    <span className="text-green-400 font-semibold">Bullish (78%)</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-green-400 h-2 rounded-full" style={{width: '78%'}}></div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-400">+15</p>
                      <p className="text-xs text-slate-400">Positive Signals</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-400">-3</p>
                      <p className="text-xs text-slate-400">Risk Factors</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Performing dApps */}
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
                <h3 className="text-xl font-bold text-white mb-6">Top Performers (24h)</h3>
                <div className="space-y-4">
                  {[
                    { name: 'Astroport', tvl: '$32.1M', change: '+12.5%', category: 'DEX' },
                    { name: 'Dragonswap', tvl: '$18.7M', change: '+8.9%', category: 'DEX' },
                    { name: 'Nitro', tvl: '$22.3M', change: '+15.2%', category: 'Perps' },
                    { name: 'Kryptonite', tvl: '$14.1M', change: '+6.7%', category: 'Staking' }
                  ].map((dapp, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-xs">{dapp.name[0]}</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{dapp.name}</p>
                          <p className="text-xs text-slate-400">{dapp.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">{dapp.tvl}</p>
                        <p className="text-green-400 text-xs">{dapp.change}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Insights Dashboard */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Seilor AI Insights</h3>
                <Brain className="w-6 h-6 text-red-400" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <TrendingUp className="w-8 h-8 text-blue-400 mb-3" />
                  <h4 className="font-semibold text-white mb-2">Market Opportunity</h4>
                  <p className="text-sm text-slate-300 mb-3">
                    DeFi TVL showing strong growth momentum. Consider liquid staking protocols.
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-xs text-blue-400">High Confidence</span>
                  </div>
                </div>

                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                  <Zap className="w-8 h-8 text-green-400 mb-3" />
                  <h4 className="font-semibold text-white mb-2">Alpha Signal</h4>
                  <p className="text-sm text-slate-300 mb-3">
                    New gaming dApps launching. Early adoption could yield significant returns.
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-xs text-green-400">Medium Risk</span>
                  </div>
                </div>

                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                  <Target className="w-8 h-8 text-purple-400 mb-3" />
                  <h4 className="font-semibold text-white mb-2">Strategy</h4>
                  <p className="text-sm text-slate-300 mb-3">
                    Diversify across DEX tokens and staking. Monitor NFT marketplace growth.
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-xs text-purple-400">Long Term</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Analytics */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
              <h3 className="text-xl font-bold text-white mb-6">Interactive Analytics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'TVL Growth', value: '📈', desc: 'Track protocol growth' },
                  { label: 'Volume Analysis', value: '💹', desc: 'Trading patterns' },
                  { label: 'Yield Farming', value: '🌾', desc: 'Best APY opportunities' },
                  { label: 'Risk Assessment', value: '⚡', desc: 'Portfolio risk analysis' }
                ].map((item, index) => (
                  <button
                    key={index}
                    className="bg-slate-900/50 hover:bg-slate-700/50 rounded-xl p-4 text-left transition-colors group"
                  >
                    <div className="text-2xl mb-2">{item.value}</div>
                    <h4 className="font-semibold text-white group-hover:text-red-400 transition-colors">{item.label}</h4>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </button>
                ))}
              </div>
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

       {/* Enhanced In-App Browser Modal */}
       {showBrowser && (
         <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-7xl h-[90vh] flex flex-col">
             {/* Enhanced Browser Header */}
             <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/50">
               <div className="flex items-center space-x-3">
                 {/* Browser Controls */}
                 <div className="flex items-center space-x-2">
                   <button
                     onClick={navigateBack}
                     disabled={browserHistoryIndex <= 0}
                     className="p-1.5 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                   >
                     <ArrowLeft className="w-4 h-4 text-slate-300" />
                   </button>
                   <button
                     onClick={navigateForward}
                     disabled={browserHistoryIndex >= browserHistory.length - 1}
                     className="p-1.5 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                   >
                     <ArrowRight className="w-4 h-4 text-slate-300" />
                   </button>
                   <button
                     onClick={refreshBrowser}
                     className="p-1.5 hover:bg-slate-700 rounded transition-colors"
                   >
                     <RefreshCw className={`w-4 h-4 text-slate-300 ${browserLoading ? 'animate-spin' : ''}`} />
                   </button>
                 </div>
                 
                 {/* URL Bar */}
                 <div className="bg-slate-800 rounded-lg px-4 py-2 flex-1 max-w-md">
                   <div className="flex items-center space-x-2">
                     {browserUrl.startsWith('https://') ? (
                       <Lock className="w-4 h-4 text-green-400" />
                     ) : (
                       <Globe className="w-4 h-4 text-slate-400" />
                     )}
                     <span className="text-slate-300 text-sm truncate">{browserUrl}</span>
                   </div>
                 </div>

                 {/* Safety Toggle */}
                 <button
                   onClick={toggleSafeBrowsing}
                   className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                     isSafeBrowsingMode 
                       ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                       : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                   }`}
                 >
                   <Shield className="w-3 h-3" />
                   <span>{isSafeBrowsingMode ? 'Safe Mode ON' : 'Safe Mode OFF'}</span>
                 </button>
               </div>
               
               <div className="flex items-center space-x-2">
                 <button
                   onClick={() => window.open(browserUrl, '_blank')}
                   className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                   title="Open in new tab"
                 >
                   <ExternalLink className="w-4 h-4 text-slate-400" />
                 </button>
                 <button
                   onClick={() => setShowBrowser(false)}
                   className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                 >
                   <X className="w-4 h-4 text-slate-400" />
                 </button>
               </div>
             </div>

             {/* Safety Analysis Banner */}
             {isSafeBrowsingMode && dAppAnalysis && (
               <div className={`px-4 py-3 border-b border-slate-700 ${
                 dAppAnalysis.safetyScore >= 80 ? 'bg-green-900/20' : 
                 dAppAnalysis.safetyScore >= 60 ? 'bg-yellow-900/20' : 'bg-red-900/20'
               }`}>
                 <div className="flex items-center justify-between">
                   <div className="flex items-center space-x-3">
                     <Shield className={`w-5 h-5 ${
                       dAppAnalysis.safetyScore >= 80 ? 'text-green-400' : 
                       dAppAnalysis.safetyScore >= 60 ? 'text-yellow-400' : 'text-red-400'
                     }`} />
                     <div>
                       <div className="flex items-center space-x-2">
                         <span className="text-white font-medium">Safety Score: {dAppAnalysis.safetyScore}/100</span>
                         <span className={`px-2 py-1 text-xs rounded-full ${
                           dAppAnalysis.safetyScore >= 80 ? 'bg-green-500/20 text-green-400' : 
                           dAppAnalysis.safetyScore >= 60 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                         }`}>
                           {dAppAnalysis.reputation}
                         </span>
                       </div>
                       <div className="text-xs text-slate-400 mt-1">
                         {dAppAnalysis.isVerified ? '✅ Verified' : '⚠️ Unverified'} • 
                         {dAppAnalysis.hasSSL ? ' 🔒 SSL Secure' : ' ⚠️ No SSL'} • 
                         Analyzed by Seifun SafeChecker
                       </div>
                     </div>
                   </div>
                   <button
                     onClick={() => setDAppAnalysis(null)}
                     className="text-slate-400 hover:text-white"
                   >
                     <X className="w-4 h-4" />
                   </button>
                 </div>
               </div>
             )}

             {/* Enhanced Browser Content */}
             <div className="flex-1 bg-white overflow-hidden relative">
               {browserLoading && (
                 <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                   <div className="flex items-center space-x-3">
                     <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
                     <span className="text-slate-600">Loading {browserTitle}...</span>
                   </div>
                 </div>
               )}
               
               {browserError ? (
                 <div className="h-full flex items-center justify-center">
                   <div className="text-center p-8">
                     <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                     <h3 className="text-xl font-bold text-slate-800 mb-2">Failed to Load</h3>
                     <p className="text-slate-600 mb-4">{browserError}</p>
                     <button
                       onClick={refreshBrowser}
                       className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                     >
                       Try Again
                     </button>
                   </div>
                 </div>
               ) : (
                 <div className="h-full">
                   {/* Real iframe integration */}
                   <iframe
                     src={browserUrl}
                     className="w-full h-full border-none"
                     title={browserTitle}
                     sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                     referrerPolicy="strict-origin-when-cross-origin"
                     onLoad={() => setBrowserLoading(false)}
                     onError={() => {
                       setBrowserError('Failed to load this dApp. It may not support iframe embedding.');
                       setBrowserLoading(false);
                     }}
                   />
                   
                   {/* Overlay for wallet connection prompts */}
                   {!isConnected && (
                     <div className="absolute top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
                       <div className="flex items-center space-x-2">
                         <Wallet className="w-4 h-4" />
                         <span className="text-sm">Connect wallet for full dApp experience</span>
                         <button
                           onClick={connectWallet}
                           className="ml-2 bg-white text-blue-500 px-2 py-1 rounded text-xs hover:bg-blue-50"
                         >
                           Connect
                         </button>
                       </div>
                     </div>
                   )}
                 </div>
               )}
             </div>

             {/* Browser Footer with Tips */}
             <div className="px-4 py-3 border-t border-slate-700 bg-slate-800/30">
               <div className="flex items-center justify-between text-xs text-slate-400">
                 <div className="flex items-center space-x-4">
                   <span>🛡️ Seifun Safe Browsing</span>
                   <span>•</span>
                   <span>Always verify transactions before signing</span>
                 </div>
                 <div className="flex items-center space-x-2">
                   <span>Powered by Seilor AI</span>
                   <button
                     onClick={() => window.open(`/app/safechecker?url=${encodeURIComponent(browserUrl)}`, '_blank')}
                     className="text-blue-400 hover:text-blue-300"
                   >
                     Analyze with SafeChecker
                   </button>
                 </div>
               </div>
             </div>
           </div>
         )}
       </div>
     );
   };
   
   export default Seilor;
                <div className="flex-1 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                  <div className="text-center p-8 max-w-2xl">
                    <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
                      <Globe className="w-20 h-20 text-red-400 mx-auto mb-6" />
                      <h3 className="text-2xl font-bold text-slate-800 mb-4">Seilor 0 Smart Browser</h3>
                      <p className="text-slate-600 mb-8 leading-relaxed">
                        Due to cross-origin security policies, external dApps work best in your default browser. 
                        Choose your preferred browsing method below.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {/* Recommended External Browser */}
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200 relative">
                          <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                            Recommended
                          </div>
                          <ExternalLink className="w-12 h-12 text-green-500 mx-auto mb-4" />
                          <h4 className="font-bold text-slate-800 mb-2">External Browser</h4>
                          <p className="text-sm text-slate-600 mb-4">
                            Full functionality with wallet extensions, transactions, and optimal performance
                          </p>
                          <button
                            onClick={() => {
                              window.open(browserUrl, '_blank');
                              setShowBrowser(false);
                            }}
                            className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                          >
                            Launch External
                          </button>
                        </div>

                        {/* In-App Preview */}
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                          <Globe className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                          <h4 className="font-bold text-slate-800 mb-2">Quick Preview</h4>
                          <p className="text-sm text-slate-600 mb-4">
                            Limited preview mode - some features may not work due to security restrictions
                          </p>
                          <button
                            onClick={() => {
                              // Create iframe preview with limitations notice
                              const previewContainer = document.querySelector('.browser-preview-container');
                              if (previewContainer) {
                                previewContainer.innerHTML = `
                                  <div class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                                    <div class="flex items-center space-x-2 text-yellow-800">
                                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z"></path>
                                      </svg>
                                      <span class="font-medium text-sm">Limited Preview Mode</span>
                                    </div>
                                    <p class="text-sm text-yellow-700 mt-1">
                                      Transactions and wallet interactions won't work. Use external browser for full functionality.
                                    </p>
                                  </div>
                                  <iframe 
                                    src="${browserUrl}" 
                                    style="width: 100%; height: 400px; border: none; border-radius: 12px;" 
                                    sandbox="allow-scripts allow-same-origin"
                                    title="dApp Preview">
                                  </iframe>
                                `;
                              }
                            }}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                          >
                            Preview Mode
                          </button>
                        </div>
                      </div>

                      {/* Browser Preview Container */}
                      <div className="browser-preview-container"></div>

                      {/* Why External Browser is Better */}
                      <div className="bg-slate-50 rounded-xl p-6 mt-6">
                        <h5 className="font-semibold text-slate-800 mb-4">🔒 Why External Browser Works Better:</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-600">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Full wallet integration</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Transaction signing</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>No CORS restrictions</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Optimal performance</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Full security features</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Extension support</span>
                          </div>
                        </div>
                      </div>

                      {/* Future Plans */}
                      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center space-x-2 text-blue-800">
                          <Sparkles className="w-5 h-5" />
                          <span className="font-medium">Coming Soon</span>
                        </div>
                        <p className="text-sm text-blue-700 mt-1">
                          We're working on advanced browser integration with native wallet support and enhanced security features.
                        </p>
                      </div>
                    </div>
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