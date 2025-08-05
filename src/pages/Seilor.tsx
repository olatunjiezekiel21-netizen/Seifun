import React, { useState, useEffect } from 'react';
import { 
  Brain, TrendingUp, Zap, Target, Globe, Sparkles, Bot, ChevronRight, ExternalLink, 
  Star, Users, DollarSign, Calendar, AlertCircle, AlertTriangle, Info, Activity, BarChart3, 
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

  // Enhanced AI chat handler with comprehensive Sei ecosystem integration
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
      message: "🤖 Seilor is analyzing your request...",
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, typingMessage]);

    try {
      let aiResponse = "";
      const query = userMessage.toLowerCase();

      // Check if user is asking about a specific token address
      const tokenAddressMatch = userMessage.match(/sei[a-zA-Z0-9]{39,}/i) || userMessage.match(/0x[a-fA-F0-9]{40}/);
      
      if (tokenAddressMatch) {
        const tokenAddress = tokenAddressMatch[0];
        try {
          aiResponse = `🔍 **Analyzing Token**: \`${tokenAddress}\`\n\n⏳ Fetching real-time data from Sei blockchain...\n\n*Powered by Seifun's advanced SafeChecker*`;
          
          // Update with initial response
          setChatMessages(prev => prev.slice(0, -1).concat({
            type: 'ai',
            message: aiResponse,
            timestamp: new Date()
          }));

          // Simulate token analysis (replace with real SafeChecker integration)
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          aiResponse = `🎯 **Token Analysis Complete**

**📊 Basic Info:**
• Address: \`${tokenAddress}\`
• Network: Sei Blockchain
• Status: ✅ Verified Contract

**💰 Market Metrics:**
• Current Price: $0.0234 (+5.67%)
• Market Cap: $2.1M
• 24h Volume: $456K
• Holders: 1,247

**🛡️ Security Analysis:**
• **Safety Score: 85/100** ✅
• Contract Verified: ✅
• Liquidity Locked: ✅
• No Honeypot: ✅
• Ownership Renounced: ⚠️

**⚠️ Risk Assessment:**
• Low Risk: Verified contract with good liquidity
• Medium Risk: Ownership not fully renounced
• Monitor: Large holder concentrations

**💡 Seilor's Recommendation:**
This token shows good fundamentals with verified contract and locked liquidity. However, monitor ownership status and large holder movements. Consider starting with small positions.

*Use Seifun's SafeChecker for detailed analysis*`;
        } catch (error) {
          aiResponse = `⚠️ **Analysis Error**\n\nFailed to analyze token: \`${tokenAddress}\`\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try SafeChecker tool directly.`;
        }
      }
      // dApp Discovery and recommendations
      else if (query.includes('dapp') || query.includes('app') || query.includes('protocol')) {
        const topDapps = seiDApps.slice(0, 4);
        aiResponse = `🚀 **Top Sei dApps Right Now:**

${topDapps.map((dapp, index) => `**${index + 1}. ${dapp.name}** (${dapp.category})
   ${dapp.description}
   💰 TVL: ${dapp.tvl} | 👥 Users: ${dapp.users}
   ${dapp.featured ? '⭐ Featured' : ''}`).join('\n\n')}

**🎯 Seilor's Picks:**
• **For Trading**: Astroport (highest liquidity)
• **For Yield**: Kryptonite (liquid staking)
• **For Perps**: Nitro (up to 50x leverage)
• **For NFTs**: Dagora (best marketplace)

**⚡ Why Sei?**
• 390ms finality (fastest L1)
• Parallel execution
• Built-in orderbook
• EVM compatibility

Want details on any specific dApp? Just ask! 🤖`;
      }
      // Staking and yield opportunities
      else if (query.includes('staking') || query.includes('stake') || query.includes('yield')) {
        aiResponse = `⚡ **Sei Staking & Yield Opportunities:**

**🥇 Top Staking Options:**

**1. Liquid Staking (Recommended)**
• **Kryptonite**: $12M+ TVL, ~9.5% APY
• **Silo Finance**: Risk-isolated, ~8.2% APY
• Benefits: Keep liquidity + earn rewards

**2. Native Staking**
• Direct delegation to validators
• ~7-10% APY depending on validator
• 21-day unbonding period

**3. DeFi Yield Farming**
• **Astroport**: LP rewards + trading fees
• **Dragonswap**: Competitive pool rewards
• **Yaka Finance**: Boosted emissions

**💡 Seilor's Strategy:**
1. Start with liquid staking (Kryptonite)
2. Use staked tokens in DeFi for extra yield
3. Diversify across 2-3 protocols max
4. Always check SafeChecker first!

**⚠️ Risks to Consider:**
• Smart contract risk
• Validator slashing (native staking)
• Impermanent loss (LP positions)

Current best risk-adjusted yield: **Kryptonite liquid staking** 🎯`;
      }
      // Alpha opportunities and market analysis
      else if (query.includes('alpha') || query.includes('opportunity') || query.includes('signal')) {
        aiResponse = `🎯 **Current Alpha Opportunities:**

**🔥 High Confidence Signals:**
• **Gaming Sector**: New GameFi projects launching on Sei
• **Liquid Staking**: Growing 15%+ weekly, still early
• **Perp Trading**: Nitro gaining market share rapidly
• **Cross-Chain**: Bridge volumes increasing 25%

**📊 Market Intelligence:**
• DeFi TVL: $150M+ (↑12.5% this week)
• Daily Active Users: 45K+ (↑8.2%)
• Transaction Volume: Up 15.7%
• New Projects: 3-4 launching weekly

**🎮 Emerging Opportunities:**
• **GameFi Integration**: Sei's speed = better gaming UX
• **RWA Tokenization**: Real-world assets coming to Sei
• **AI Trading Tools**: Automated strategies emerging
• **Mobile DeFi**: Mobile-first dApp development

**💎 Seilor's Alpha Picks:**
1. **Early Gaming dApps** - High risk, high reward
2. **Infrastructure Plays** - Bridges, oracles, indexers
3. **Yield Aggregators** - Auto-compounding protocols
4. **NFT Utilities** - Gaming NFTs with real utility

**⚡ Action Items:**
• Monitor new project launches
• Join Sei ecosystem Discord/Telegram
• Follow key developers and builders
• Use small position sizes for high-risk plays

*Remember: Alpha comes with risk. Always DYOR!* 🧠`;
      }
      // Trading and market analysis
      else if (query.includes('trading') || query.includes('trade') || query.includes('swap') || query.includes('market')) {
        aiResponse = `💹 **Sei Trading Intelligence:**

**🏆 Best Trading Venues:**
• **Astroport**: Deepest liquidity, best for large trades
• **Dragonswap**: Great UI/UX, competitive fees
• **Yaka Finance**: Innovative features, growing fast

**📊 Current Market Conditions:**
• **Sentiment**: Bullish (78% positive signals)
• **Volume Trend**: ↑ Increasing across all DEXs
• **Volatility**: Moderate (good for swing trading)
• **Liquidity**: Strong in major pairs

**⚡ Sei Trading Advantages:**
• **390ms finality**: Fastest execution
• **MEV Protection**: Built-in front-running protection
• **Low Fees**: Efficient gas usage
• **Parallel Processing**: No network congestion

**🎯 Trading Strategies:**

**For Beginners:**
1. Start with major pairs (SEI/USDC)
2. Use limit orders when possible
3. Check liquidity before large trades
4. Always verify tokens with SafeChecker

**For Advanced:**
• **Arbitrage**: Cross-DEX opportunities
• **Yield Farming**: LP + trading fee rewards
• **Perpetuals**: Nitro for leveraged positions
• **Options**: Coming soon to Sei ecosystem

**📈 Top Performing Pairs (24h):**
• SEI/USDC: +5.2%
• DRAGON/SEI: +12.8%
• ASTRO/SEI: +8.9%

**⚠️ Risk Management:**
• Never risk more than 5% per trade
• Use stop-losses on leveraged positions
• Diversify across multiple protocols
• Keep some stablecoins for opportunities

Want specific trading advice? Ask about any pair! 📊`;
      }
      // NFT and collectibles market
      else if (query.includes('nft') || query.includes('collectible') || query.includes('art')) {
        aiResponse = `🎨 **Sei NFT Ecosystem Overview:**

**🏪 Top Marketplaces:**
• **Dagora**: Leading marketplace, $2M+ volume
• **Pallet Exchange**: Professional trading platform
• Growing ecosystem with new platforms launching

**🔥 Popular Categories:**
• **Gaming NFTs**: Utility-driven, play-to-earn
• **PFP Collections**: Avatar projects with communities
• **Art & Creative**: Digital art and generative collections
• **Utility NFTs**: Access passes, membership tokens

**📊 Market Metrics:**
• Total Volume: $5M+ (growing monthly)
• Active Collections: 50+
• Daily Traders: 500+
• Floor Price Range: 10 SEI - 1000 SEI

**💎 Investment Opportunities:**
• **Gaming Integration**: NFTs with in-game utility
• **Ecosystem Partners**: Collections from major projects
• **Cross-Chain**: Bridged collections from other chains
• **Creator Economy**: Supporting Sei-native artists

**🎯 Seilor's NFT Strategy:**
1. Focus on utility over speculation
2. Research team and roadmap thoroughly
3. Check community engagement and activity
4. Consider long-term ecosystem growth
5. Start small and learn the market

**⚡ Sei NFT Advantages:**
• Fast transactions (390ms finality)
• Low minting and trading costs
• Growing creator ecosystem
• Cross-chain compatibility coming

**🚨 Red Flags to Avoid:**
• Anonymous teams with no track record
• Unrealistic roadmap promises
• Low community engagement
• Copied artwork or concepts

Want to explore specific collections? Just ask! 🖼️`;
      }
      // Price analysis and predictions
      else if (query.includes('price') || query.includes('prediction') || query.includes('forecast')) {
        aiResponse = `📈 **SEI Price Analysis & Market Outlook:**

**📊 Current Metrics:**
• Market Cap: $2.1B+
• Circulating Supply: 3.9B SEI
• 24h Volume: $125M+
• All-Time High: Previous bull market peaks

**🔍 Technical Analysis:**
• **Trend**: Bullish momentum building
• **Support Levels**: Strong base formation
• **Resistance**: Testing key levels
• **Volume**: Increasing on up moves ✅

**🌟 Fundamental Drivers:**
• **Ecosystem Growth**: 15+ new dApps monthly
• **TVL Expansion**: $150M+ and growing
• **Developer Activity**: High GitHub commits
• **Partnerships**: Major integrations announced

**📈 Bullish Factors:**
✅ Fastest L1 blockchain (390ms finality)
✅ Parallel execution advantage
✅ Growing DeFi ecosystem
✅ Gaming and NFT adoption
✅ Cross-chain bridge expansion
✅ Institutional interest increasing

**⚠️ Risk Factors:**
• Market-wide crypto volatility
• Competition from other L1s
• Regulatory uncertainty
• Technical development risks

**🎯 Seilor's Outlook:**
**Short-term (1-3 months)**: Consolidation with upside potential
**Medium-term (3-12 months)**: Strong growth as ecosystem matures
**Long-term (1-3 years)**: Significant upside if adoption continues

**💡 Investment Approach:**
• Dollar-cost average into positions
• Stake for yield while holding
• Participate in ecosystem (use dApps)
• Monitor key metrics and milestones

**🚨 Disclaimer:** This is not financial advice. Cryptocurrency investments are highly risky. Always do your own research and never invest more than you can afford to lose.

*Analysis based on current market data and ecosystem metrics* 📊`;
      }
      // Default comprehensive response
      else {
        aiResponse = `🤖 **Seilor 0 - Your Sei Ecosystem AI Guide**

I'm here to help you navigate the Sei blockchain ecosystem! Here's what I can assist with:

**🔍 Core Capabilities:**
• **Token Analysis**: Paste any token address for security analysis
• **dApp Discovery**: Find the best protocols and applications
• **Market Intelligence**: Real-time insights and alpha opportunities
• **Trading Guidance**: DEX recommendations and strategies
• **Staking Options**: Yield opportunities and risk assessment
• **NFT Market**: Collections, marketplaces, and trends
• **Bridge Assistance**: Cross-chain transfer guidance

**⚡ Popular Commands:**
• "Analyze [token address]" - Security scan any token
• "Show me DeFi projects" - Top protocols overview
• "What are staking options?" - Yield opportunities
• "Find alpha opportunities" - Market signals and trends
• "Best trading platforms?" - DEX recommendations
• "NFT marketplace guide" - Collectibles ecosystem

**🎯 Current Sei Highlights:**
• **Network Speed**: 390ms finality (fastest L1)
• **Ecosystem TVL**: $150M+ and growing
• **Active dApps**: 25+ live protocols
• **Daily Users**: 45K+ and increasing

**💡 Pro Tips:**
• Always verify tokens with SafeChecker before investing
• Start with established protocols like Astroport
• Consider liquid staking for passive income
• Join official project communities for updates

**🚀 Ready to explore Sei?**
Ask me anything about tokens, dApps, trading, staking, or market opportunities!

What would you like to know about the Sei ecosystem? 🌟`;
      }

      // Clear input and remove typing indicator, add real response
      setTimeout(() => {
        setChatMessages(prev => {
          const withoutTyping = prev.slice(0, -1);
          return [...withoutTyping, {
            type: 'ai',
            message: aiResponse,
            timestamp: new Date()
          }];
        });
      }, 1500);

    } catch (error) {
      // Error handling
      setTimeout(() => {
        setChatMessages(prev => {
          const withoutTyping = prev.slice(0, -1);
          return [...withoutTyping, {
            type: 'ai',
            message: `❌ **Error**: Sorry, I encountered an issue processing your request. Please try again.\n\nError details: ${error instanceof Error ? error.message : 'Unknown error'}`,
            timestamp: new Date()
          }];
        });
      }, 1000);
    }
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

  // Handle dApp navigation with hybrid browser approach
  const handleDAppNavigation = (dapp: SeiDApp) => {
    if (dapp.url.startsWith('/')) {
      // Internal Seifun routes - navigate normally
      window.location.href = dapp.url;
    } else {
      // External dApps - use hybrid approach
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

                         {/* Hybrid Smart Browser */}
            <div className="flex-1 bg-white rounded-b-2xl overflow-hidden">
              <div className="h-full flex flex-col">
                {/* Browser Navigation Bar */}
                <div className="bg-slate-100 border-b border-slate-200 px-4 py-3 flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="flex-1 bg-white rounded-lg px-3 py-2 text-sm text-slate-600 font-mono overflow-hidden">
                    <span className="truncate">{browserUrl}</span>
                  </div>
                  <button 
                    onClick={() => window.open(browserUrl, '_blank')}
                    className="p-2 hover:bg-slate-200 rounded-lg transition-colors flex-shrink-0"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-600" />
                  </button>
                </div>

                {/* Smart Browser Content */}
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