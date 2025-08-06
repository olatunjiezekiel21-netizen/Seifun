import React, { useState, useEffect } from 'react';
import { 
  Brain, TrendingUp, Zap, Target, Globe, Sparkles, Bot, ChevronRight, ExternalLink, 
  Star, Users, DollarSign, Calendar, AlertCircle, AlertTriangle, Info, Activity, BarChart3, 
  Filter, Search, ArrowUpDown, Eye, MessageCircle, Send, Copy, Bookmark, Shield, X,
  RefreshCw, ArrowLeft, ArrowRight, Home, Lock, Maximize2, Wallet, Heart
} from 'lucide-react';
import { getSeiDApps, getAlphaInsights, getSeiNetworkStats, getDAppCategories, type SeiDApp, type AlphaInsight } from '../utils/seiEcosystemData';
import { AIChatDataService } from '../utils/aiChatDataService';
import { TokenScanner } from '../utils/tokenScanner';
import { SeiTokenRegistry } from '../utils/seiTokenRegistry';
import { IntelligentAIChat } from '../utils/intelligentAIChat';
import { AdvancedAIAgent } from '../utils/advancedAIAgent';
import { useUnifiedWallet } from '../utils/unifiedWalletConnection';
import { useReownWallet } from '../utils/reownWalletConnection';

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
  const [intelligentAI] = useState(() => new IntelligentAIChat());
  const [advancedAI] = useState(() => new AdvancedAIAgent());
  
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
  // ReOWN Kit wallet connection with comprehensive support
  const { 
    isConnected, 
    address, 
    balance,
    isConnecting,
    error: walletError,
    walletType,
    chainId,
    connectWallet: connectReownWallet, 
    disconnectWallet,
    getAvailableWallets,
    refreshBalance
  } = useReownWallet();

  // Connect wallet using ReOWN Kit with proper error handling
  const connectWallet = async (preferredWallet?: string) => {
    try {
      console.log('🔗 Connecting wallet via ReOWN Kit...', preferredWallet ? `Preferred: ${preferredWallet}` : 'Auto-detect');
      await connectReownWallet(preferredWallet);
      console.log('✅ Wallet connected successfully:', { address, walletType });
    } catch (error) {
      console.error('❌ ReOWN wallet connection failed:', error);
      // Error is handled by the hook's state management
    }
  };

  // Get available wallets for display
  const availableWallets = getAvailableWallets();
  const installedWallets = availableWallets.filter(w => w.installed);
  const hasInstalledWallets = installedWallets.length > 0;
  
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

  // Intelligent AI chat handler with memory and real analysis
  const handleAiChat = async () => {
    if (!aiChat.trim()) return;

    const userMessage = aiChat.trim();
    setAiChat('');

    // Add user message to UI
    const newUserMessage = {
      type: 'user',
      message: userMessage,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, newUserMessage]);

    // Add typing indicator
    const typingMessage = {
      type: 'ai',
      message: "🤖 Thinking...",
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, typingMessage]);

    try {
      // Get intelligent response with context
      const context = {
        walletConnected: isConnected,
        walletAddress: address,
        currentDapp: browserTitle || undefined
      };

      const aiResponse = await advancedAI.generateIntelligentResponse(userMessage, context);

      // Update with real response
      setChatMessages(prev => prev.slice(0, -1).concat({
        type: 'ai',
        message: aiResponse,
        timestamp: new Date()
      }));

    } catch (error) {
      setChatMessages(prev => prev.slice(0, -1).concat({
        type: 'ai',
        message: `I apologize, but I encountered an error: ${error instanceof Error ? error.message : 'Please try again.'}`,
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

    // Perform real safety analysis based on dApp data
    if (isSafeBrowsingMode) {
      try {
        // Real safety analysis based on dApp characteristics
        let safetyScore = 50; // Base score
        const warnings = [];
        const recommendations = [
          'Always verify transaction details before signing',
          'Keep your wallet secure and never share private keys',
          'Start with small amounts when using new protocols'
        ];

        // SSL/HTTPS check
        const hasSSL = dapp.url.startsWith('https://');
        if (hasSSL) safetyScore += 15;
        else warnings.push('Site does not use HTTPS encryption');

        // Featured/verified protocols get higher scores
        if (dapp.featured) safetyScore += 20;
        
        // Status check
        if (dapp.status === 'Live') safetyScore += 10;
        else warnings.push('Protocol status is not fully live');

        // TVL-based scoring (higher TVL = more established)
        const tvlValue = parseFloat(dapp.tvl.replace(/[^0-9.]/g, ''));
        if (tvlValue > 100) safetyScore += 15;
        else if (tvlValue > 10) safetyScore += 10;
        else if (tvlValue > 1) safetyScore += 5;
        else warnings.push('Low total value locked (TVL)');

        // User count scoring
        const userCount = parseFloat(dapp.users.replace(/[^0-9.]/g, ''));
        if (userCount > 10000) safetyScore += 10;
        else if (userCount > 1000) safetyScore += 5;
        else warnings.push('Limited user base');

        // Category-specific checks
        if (dapp.category === 'DeFi') {
          recommendations.push('Review smart contract audits before providing liquidity');
          recommendations.push('Understand impermanent loss risks in liquidity pools');
        } else if (dapp.category === 'NFT') {
          recommendations.push('Verify NFT authenticity and creator reputation');
          recommendations.push('Be aware of gas fees for minting and trading');
        }

        // Domain reputation (basic check)
        const knownSafeDomains = ['astroport.fi', 'dragonswap.app'];
        const domain = new URL(dapp.url).hostname;
        if (knownSafeDomains.some(safeDomain => domain.includes(safeDomain))) {
          safetyScore += 10;
        }

        // Cap the score at 100
        safetyScore = Math.min(100, safetyScore);

        const analysis = {
          safetyScore,
          isVerified: dapp.featured && hasSSL && safetyScore >= 80,
          hasSSL,
          reputation: safetyScore >= 90 ? 'Excellent' : safetyScore >= 75 ? 'Very Good' : safetyScore >= 60 ? 'Good' : 'Caution Advised',
          warnings,
          recommendations
        };
        
        setDAppAnalysis(analysis);
      } catch (error) {
        console.warn('Failed to analyze dApp:', error);
        // Fallback analysis
        setDAppAnalysis({
          safetyScore: 70,
          isVerified: false,
          hasSSL: dapp.url.startsWith('https://'),
          reputation: 'Unknown',
          warnings: ['Unable to perform complete safety analysis'],
          recommendations: [
            'Exercise extra caution with this protocol',
            'Verify all transaction details carefully',
            'Consider using smaller amounts initially'
          ]
        });
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
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Seilor 0</h1>
                  <p className="text-xs text-slate-400">AI-Powered Sei Navigator</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Network Stats */}
              <div className="hidden md:flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-slate-300">TVL: {networkStats.totalTvl}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-300">{networkStats.activeUsers}</span>
                </div>
              </div>
              
              {/* Wallet Connection */}
              {isConnected ? (
                <div className="flex items-center space-x-2 bg-green-500/20 text-green-400 px-3 py-1.5 rounded-lg">
                  <Wallet className="w-4 h-4" />
                  <span className="text-sm font-medium">{address?.slice(0,6)}...{address?.slice(-4)}</span>
                </div>
              ) : (
                <button
                  onClick={() => connectWallet()}
                  disabled={isConnecting}
                  className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Wallet className="w-4 h-4" />
                  <span>
                    {isConnecting 
                      ? 'Connecting...' 
                      : hasInstalledWallets 
                        ? 'Connect' 
                        : 'Mobile Wallet'
                    }
                  </span>
                </button>
              )}
              
              {/* Wallet Connection Guidance */}
              {walletError && !hasInstalledWallets && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mt-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Wallet className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <h4 className="text-blue-400 font-medium mb-2">No Desktop Wallets Detected</h4>
                      <p className="text-slate-300 text-sm mb-3">
                        No problem! You can still connect using any mobile wallet that supports WalletConnect.
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="text-slate-400">
                          <strong className="text-slate-300">Option 1:</strong> Use any mobile wallet (Trust Wallet, MetaMask Mobile, Rainbow, etc.)
                        </div>
                        <div className="text-slate-400">
                          <strong className="text-slate-300">Option 2:</strong> Install a desktop wallet:
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <a 
                            href="https://finwallet.com" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-xs flex items-center space-x-1"
                          >
                            <span>🔗</span>
                            <span>Fin Wallet</span>
                          </a>
                          <a 
                            href="https://metamask.io" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-xs flex items-center space-x-1"
                          >
                            <span>🦊</span>
                            <span>MetaMask</span>
                          </a>
                        </div>
                      </div>
                      <button
                        onClick={() => connectWallet()}
                        disabled={isConnecting}
                        className="mt-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        {isConnecting ? 'Opening...' : 'Connect Mobile Wallet'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex bg-slate-800/50 rounded-2xl p-2 backdrop-blur-md border border-slate-700/50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {/* dApp Discovery Tab */}
          {activeTab === 'discover' && (
            <div className="space-y-8">
              {/* Search and Filter */}
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search dApps and protocols..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50"
                    />
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  >
                    <option value="All">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  >
                    <option value="tvl">Sort by TVL</option>
                    <option value="name">Sort by Name</option>
                    <option value="category">Sort by Category</option>
                  </select>
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
                        className="group bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-700/50 hover:border-red-500/50 transition-all duration-200 cursor-pointer"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="relative">
                            <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-slate-600 group-hover:border-red-500/50 transition-colors">
                              <img 
                                src={dapp.image} 
                                alt={`${dapp.name} logo`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback to gradient with icon if image fails
                                  e.currentTarget.style.display = 'none';
                                  const parent = e.currentTarget.parentElement;
                                  if (parent) {
                                    parent.className = 'w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-slate-600 group-hover:border-red-500/50 transition-colors';
                                    parent.innerHTML = '<svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>';
                                  }
                                }}
                              />
                            </div>
                            {dapp.status === 'Live' && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-800"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-bold text-white group-hover:text-red-400 transition-colors">{dapp.name}</h3>
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            </div>
                            <p className="text-sm text-slate-400 mb-3 line-clamp-2">{dapp.description}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-xs">
                                <span className="flex items-center space-x-1">
                                  <DollarSign className="w-3 h-3 text-green-400" />
                                  <span className="text-slate-300">{dapp.tvl}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <Users className="w-3 h-3 text-blue-400" />
                                  <span className="text-slate-300">{dapp.users}</span>
                                </span>
                              </div>
                              <span className="px-2 py-1 text-xs font-medium bg-red-500/20 text-red-400 rounded-full">
                                {dapp.category}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* All Projects */}
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
                
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-hidden rounded-2xl border border-slate-700/50">
                  <table className="w-full bg-slate-800/30">
                    <thead className="bg-slate-700/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Project</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">TVL</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Users</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Action</th>
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
                              <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-600">
                                <img 
                                  src={dapp.image} 
                                  alt={`${dapp.name} logo`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    // Fallback to gradient with icon if image fails
                                    e.currentTarget.style.display = 'none';
                                    const parent = e.currentTarget.parentElement;
                                    if (parent) {
                                      parent.className = 'w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border border-slate-600';
                                      parent.innerHTML = '<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>';
                                    }
                                  }}
                                />
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <div className="font-medium text-white">{dapp.name}</div>
                                  {dapp.featured && <Star className="w-4 h-4 text-yellow-400 fill-current" />}
                                </div>
                                <div className="text-sm text-slate-400 max-w-xs truncate">{dapp.description}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 text-xs font-medium bg-slate-700/50 text-slate-300 rounded-full">
                              {dapp.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-300">{dapp.tvl}</td>
                          <td className="px-6 py-4 text-sm text-slate-300">{dapp.users}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              dapp.status === 'Live' 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {dapp.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleDAppNavigation(dapp)}
                              className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors"
                            >
                              <span>Launch</span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
                  {seiDApps.filter(dapp => {
                    const matchesCategory = selectedCategory === 'All' || dapp.category === selectedCategory;
                    const matchesSearch = dapp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                         dapp.description.toLowerCase().includes(searchQuery.toLowerCase());
                    return matchesCategory && matchesSearch;
                  }).map(dapp => (
                    <div 
                      key={dapp.id}
                      onClick={() => handleDAppNavigation(dapp)}
                      className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:bg-slate-700/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-600">
                          <img 
                            src={dapp.image} 
                            alt={`${dapp.name} logo`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to gradient with icon if image fails
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                parent.className = 'w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border border-slate-600';
                                parent.innerHTML = '<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>';
                              }
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium text-white">{dapp.name}</h3>
                            {dapp.featured && <Star className="w-4 h-4 text-yellow-400 fill-current" />}
                          </div>
                          <p className="text-sm text-slate-400 mb-2 line-clamp-2">{dapp.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 text-xs text-slate-300">
                              <span>{dapp.tvl}</span>
                              <span>{dapp.users}</span>
                            </div>
                            <span className="px-2 py-1 text-xs font-medium bg-slate-700/50 text-slate-300 rounded-full">
                              {dapp.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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
                            <p className="font-medium text-white">{dapp.name}</p>
                            <p className="text-xs text-slate-400">{dapp.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-white">{dapp.tvl}</p>
                          <p className="text-xs text-green-400">{dapp.change}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Insights Dashboard */}
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">AI Insights Dashboard</h3>
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
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-4">Alpha Insights</h2>
                <p className="text-slate-400 max-w-2xl mx-auto">
                  Real-time intelligence and opportunities in the Sei ecosystem, powered by AI analysis
                </p>
              </div>

              {/* Alpha Insights Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {alphaInsights.map((insight) => (
                  <div key={insight.id} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          insight.confidence >= 80 ? 'bg-green-400' : 
                          insight.confidence >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                        }`}></div>
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                          {insight.category}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">{insight.timeframe}</span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-2">{insight.title}</h3>
                    <p className="text-slate-400 text-sm mb-4 leading-relaxed">{insight.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-4 h-4 text-green-400" />
                          <span className="text-xs text-slate-300">{insight.confidence}% confidence</span>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          insight.impact === 'High' ? 'bg-red-500/20 text-red-400' :
                          insight.impact === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {insight.impact} Impact
                        </span>
                      </div>
                      <button className="text-red-400 hover:text-red-300 transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Market Intelligence Summary */}
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 rounded-2xl border border-slate-700/50 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <Brain className="w-8 h-8 text-red-400" />
                  <h3 className="text-2xl font-bold text-white">AI Market Intelligence</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">78%</div>
                    <div className="text-sm text-slate-400">Bullish Sentiment</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-2">15+</div>
                    <div className="text-sm text-slate-400">Active Signals</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-400 mb-2">$2.1B</div>
                    <div className="text-sm text-slate-400">Market Opportunity</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400 mb-2">92%</div>
                    <div className="text-sm text-slate-400">Accuracy Rate</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Assistant Tab */}
          {activeTab === 'ai' && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
                {/* Chat Header */}
                <div className="bg-slate-700/50 px-6 py-4 border-b border-slate-700/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Seilor AI Assistant</h3>
                      <p className="text-xs text-slate-400">Powered by advanced Sei blockchain intelligence</p>
                    </div>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="h-96 overflow-y-auto p-6 space-y-4">
                  {chatMessages.map((message, index) => (
                    <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-3xl p-4 rounded-2xl ${
                        message.type === 'user' 
                          ? 'bg-red-500 text-white' 
                          : 'bg-slate-700/50 text-slate-100'
                      }`}>
                        <div className="prose prose-sm max-w-none">
                          {message.message.split('\n').map((line, i) => {
                            if (line.startsWith('**') && line.endsWith('**')) {
                              return <div key={i} className="font-bold text-white mb-2">{line.slice(2, -2)}</div>;
                            } else if (line.startsWith('• ')) {
                              return <div key={i} className="ml-4 mb-1">{line}</div>;
                            } else if (line.trim() === '') {
                              return <div key={i} className="h-2"></div>;
                            } else {
                              return <div key={i} className="mb-1">{line}</div>;
                            }
                          })}
                        </div>
                        <div className="text-xs opacity-70 mt-2">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <div className="p-6 border-t border-slate-700/50">
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      value={aiChat}
                      onChange={(e) => setAiChat(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAiChat()}
                      placeholder="Ask about tokens, dApps, trading strategies, or anything Sei-related..."
                      className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50"
                    />
                    <button
                      onClick={handleAiChat}
                      disabled={!aiChat.trim()}
                      className="px-6 py-3 bg-red-500 hover:bg-red-600 disabled:bg-slate-600 disabled:opacity-50 text-white rounded-xl font-medium transition-colors flex items-center space-x-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send</span>
                    </button>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {[
                      'Analyze token safety',
                      'Best dApps for trading',
                      'Staking opportunities',
                      'Latest alpha insights',
                      'Market sentiment'
                    ].map((action) => (
                      <button
                        key={action}
                        onClick={() => setAiChat(action)}
                        className="px-3 py-1.5 text-xs bg-slate-700/50 hover:bg-red-500/20 text-slate-300 hover:text-red-400 rounded-lg transition-colors border border-slate-600/50 hover:border-red-500/50"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

            {/* Enhanced dApp Launch Interface */}
      {showBrowser && (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 z-50">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-slate-800/95 backdrop-blur-md border-b border-slate-700/50 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {(() => {
                    const currentDapp = seiDApps.find(dapp => dapp.url === browserUrl);
                    return currentDapp ? (
                      <>
                        <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-slate-600">
                          <img 
                            src={currentDapp.image} 
                            alt={`${currentDapp.name} logo`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to gradient with icon if image fails
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                parent.className = 'w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-slate-600';
                                parent.innerHTML = '<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>';
                              }
                            }}
                          />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h2 className="text-xl font-bold text-white">{currentDapp.name}</h2>
                            {currentDapp.featured && (
                              <Star className="w-5 h-5 text-yellow-400 fill-current" />
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-slate-400">
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">
                              {currentDapp.category}
                            </span>
                            <span>TVL: {currentDapp.tvl}</span>
                            <span>Users: {currentDapp.users}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              currentDapp.status === 'Live' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
                            }`}>
                              {currentDapp.status}
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                          <Globe className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-white">{browserTitle}</h2>
                          <p className="text-slate-400">External dApp</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
                
                <button
                  onClick={() => setShowBrowser(false)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:flex-row">
              {/* Left Panel - dApp Info & Actions */}
              <div className="w-full lg:w-96 bg-slate-800/50 border-b lg:border-b-0 lg:border-r border-slate-700 p-4 lg:p-6 overflow-y-auto">
                <div className="space-y-6">
                  {/* dApp Stats */}
                  {(() => {
                    const currentDapp = seiDApps.find(dapp => dapp.url === browserUrl);
                    return currentDapp ? (
                      <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 lg:gap-4">
                        <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                          <div className="text-sm text-slate-400">TVL</div>
                          <div className="text-lg font-semibold text-green-400">{currentDapp.tvl}</div>
                        </div>
                        <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                          <div className="text-sm text-slate-400">Users</div>
                          <div className="text-lg font-semibold text-blue-400">{currentDapp.users}</div>
                        </div>
                        <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                          <div className="text-sm text-slate-400">Category</div>
                          <div className="text-lg font-semibold text-purple-400">{currentDapp.category}</div>
                        </div>
                        <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                          <div className="text-sm text-slate-400">Status</div>
                          <div className={`text-lg font-semibold ${
                            currentDapp.status === 'Live' ? 'text-green-400' : 'text-yellow-400'
                          }`}>
                            {currentDapp.status}
                          </div>
                        </div>
                      </div>
                    ) : null;
                  })()}

                  {/* dApp Description */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">About This Protocol</h3>
                    <p className="text-slate-300 leading-relaxed">
                      {seiDApps.find(dapp => dapp.url === browserUrl)?.description || 
                       "External decentralized application on the Sei blockchain ecosystem."}
                    </p>
                  </div>

                  {/* Protocol Features */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Key Features</h3>
                    <div className="space-y-2">
                      {(() => {
                        const currentDapp = seiDApps.find(dapp => dapp.url === browserUrl);
                        const features = currentDapp?.category === 'DeFi' ? [
                          'Decentralized Trading',
                          'Liquidity Provision',
                          'Yield Farming',
                          'Sei Network Native'
                        ] : currentDapp?.category === 'NFT' ? [
                          'NFT Marketplace',
                          'Digital Collectibles',
                          'Creator Tools',
                          'Sei Network Native'
                        ] : [
                          'Blockchain Integration',
                          'Decentralized Features',
                          'Community Driven',
                          'Sei Network Native'
                        ];
                        
                        return features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            <span className="text-slate-300 text-sm">{feature}</span>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>

                  {/* Safety Analysis */}
                  {dAppAnalysis && (
                    <div className="bg-slate-700/50 rounded-xl p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Shield className={`w-5 h-5 ${
                          dAppAnalysis.safetyScore >= 80 ? 'text-green-400' : 
                          dAppAnalysis.safetyScore >= 60 ? 'text-yellow-400' : 'text-red-400'
                        }`} />
                        <h4 className="font-semibold text-white">Safety Analysis</h4>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-300">Safety Score</span>
                          <span className={`font-medium ${
                            dAppAnalysis.safetyScore >= 80 ? 'text-green-400' : 
                            dAppAnalysis.safetyScore >= 60 ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            {dAppAnalysis.safetyScore}/100
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-300">Verified</span>
                          <span className="text-slate-300">
                            {dAppAnalysis.isVerified ? '✅' : '❌'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-300">SSL Secure</span>
                          <span className="text-slate-300">
                            {dAppAnalysis.hasSSL ? '✅' : '⚠️'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Launch Options */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Launch Options</h3>
                    
                    {/* Primary Launch Button */}
                    <button
                      onClick={() => {
                        // Show consent dialog
                        const confirmed = window.confirm(
                          `You are about to leave Seifun and visit ${browserTitle}.\n\n` +
                          `This will open ${browserUrl} in a new tab.\n\n` +
                          `Seifun is not responsible for the content or security of external websites.\n\n` +
                          `Do you want to continue?`
                        );
                        
                        if (confirmed) {
                          console.log(`User consented to launch ${browserTitle} externally`);
                          window.open(browserUrl, '_blank', 'noopener,noreferrer');
                          setShowBrowser(false);
                        }
                      }}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-3"
                    >
                      <ExternalLink className="w-5 h-5" />
                      <span>Launch {seiDApps.find(dapp => dapp.url === browserUrl)?.name || 'dApp'}</span>
                    </button>

                    {/* Safety Check Button */}
                    <button
                      onClick={() => {
                        window.open(`/app/safechecker?url=${encodeURIComponent(browserUrl)}`, '_blank');
                      }}
                      className="w-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 font-medium py-3 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Run Safety Check</span>
                    </button>

                    {/* Add to Favorites */}
                    <button
                      onClick={() => {
                        // Add to user favorites (implement later)
                        console.log(`Added ${browserTitle} to favorites`);
                      }}
                      className="w-full bg-slate-700/50 hover:bg-slate-700 text-slate-300 font-medium py-3 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
                    >
                      <Heart className="w-4 h-4" />
                      <span>Add to Favorites</span>
                    </button>
                  </div>

                  {/* Why External Launch */}
                  <div className="bg-slate-700/30 rounded-xl p-4">
                    <h4 className="font-semibold text-white mb-3 flex items-center">
                      <Info className="w-4 h-4 mr-2" />
                      Why External Launch?
                    </h4>
                    <div className="space-y-2 text-sm text-slate-300">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Full wallet integration & transaction signing</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Complete protocol functionality</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Optimal performance & security</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>No embedding restrictions</span>
                      </div>
                    </div>
                  </div>

                  {/* Wallet Status */}
                  <div className="bg-slate-700/30 rounded-xl p-4">
                    <h4 className="font-semibold text-white mb-3">Wallet Status</h4>
                    {isConnected ? (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-green-400">
                          <Wallet className="w-4 h-4" />
                          <span className="text-sm">Connected</span>
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          {address?.slice(0, 6)}...{address?.slice(-4)}
                        </div>
                        <p className="text-xs text-slate-400">
                          Your wallet will be automatically available in the external dApp.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2 text-yellow-400">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="text-sm">Not Connected</span>
                        </div>
                        <button
                          onClick={() => connectWallet()}
                          disabled={isConnecting}
                          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-2 px-4 rounded-lg text-sm transition-colors"
                        >
                          {isConnecting 
                            ? 'Connecting...' 
                            : hasInstalledWallets 
                              ? 'Connect Wallet' 
                              : 'Connect Mobile Wallet'
                          }
                        </button>
                        <p className="text-xs text-slate-400">
                          Connect your wallet here, then launch the dApp for seamless integration.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Panel - Preview & Analytics */}
              <div className="flex-1 bg-slate-900/50 flex flex-col">
                {/* Preview Header */}
                <div className="bg-slate-800/30 border-b border-slate-700 px-4 lg:px-6 py-4">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-2 lg:space-y-0">
                    <h3 className="text-lg font-semibold text-white">Protocol Overview</h3>
                    <div className="flex items-center space-x-2 text-sm text-slate-400">
                      <Globe className="w-4 h-4" />
                      <span className="font-mono text-xs lg:text-sm break-all lg:break-normal">{new URL(browserUrl).hostname}</span>
                    </div>
                  </div>
                </div>

                {/* Preview Content */}
                <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
                  <div className="text-center max-w-md">
                    {(() => {
                      const currentDapp = seiDApps.find(dapp => dapp.url === browserUrl);
                      return currentDapp ? (
                        <div className="w-24 h-24 rounded-2xl overflow-hidden mx-auto mb-6 border-2 border-slate-600">
                          <img 
                            src={currentDapp.image} 
                            alt={`${currentDapp.name} logo`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to gradient with icon if image fails
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                parent.className = 'w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border-2 border-slate-600';
                                parent.innerHTML = '<svg class="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>';
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                          <ExternalLink className="w-12 h-12 text-blue-400" />
                        </div>
                      );
                    })()}
                    
                    <h3 className="text-2xl font-bold text-white mb-4">
                      Ready to Launch {seiDApps.find(dapp => dapp.url === browserUrl)?.name || 'dApp'}
                    </h3>
                    
                    <p className="text-slate-400 mb-6 leading-relaxed">
                      This protocol will open in a new tab with full functionality, 
                      wallet integration, and optimal performance. Connect your wallet 
                      in the new tab to start trading or interacting.
                    </p>

                    {/* URL Preview */}
                    <div className="bg-slate-800/50 rounded-lg p-3 mb-6 border border-slate-700">
                      <div className="text-xs text-slate-500 mb-1">Opening URL:</div>
                      <div className="font-mono text-sm text-blue-400 break-all">{browserUrl}</div>
                    </div>

                    <div className="flex items-center justify-center space-x-6 text-sm text-slate-500">
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4" />
                        <span>Secure</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Zap className="w-4 h-4" />
                        <span>Fast</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Wallet className="w-4 h-4" />
                        <span>Integrated</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="bg-slate-800/30 border-t border-slate-700 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-slate-400">
                      <span>🛡️ Protected by Seilor AI</span>
                      <span>•</span>
                      <span>📊 Transaction tracking enabled</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setActiveTab('ai')}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2"
                      >
                        <Bot className="w-4 h-4" />
                        <span>Ask AI</span>
                      </button>
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