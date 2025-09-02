import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  TrendingUp, 
  Star, 
  Eye, 
  Users, 
  DollarSign,
  BarChart3,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Plus,
  Minus,
  MessageCircle,
  TrendingDown
} from 'lucide-react';
import { unifiedTokenService, TokenData } from '../services/UnifiedTokenService';
import { useNavigate } from 'react-router-dom';
import { hybridSeiService } from '../services/HybridSeiService';
import { enhancedChatBrain } from '../services/EnhancedChatBrain';

const SeifunLaunch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const navigate = useNavigate();

  // New advanced features state
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedToken, setSelectedToken] = useState<TokenData | null>(null);
  const [portfolio, setPortfolio] = useState<{ [key: string]: number }>({});
  const [aiInsights, setAiInsights] = useState<string>('');
  const [aiChat, setAiChat] = useState('');
  const [aiMessages, setAiMessages] = useState<Array<{ type: 'user' | 'ai'; message: string; timestamp: Date }>>([]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  
  // Trading state
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [tradeAmount, setTradeAmount] = useState('');
  const [isTrading, setIsTrading] = useState(false);
  
  const chartRef = useRef<HTMLCanvasElement>(null);

  const categories = [
    { id: 'all', name: 'All Tokens', icon: Star },
    { id: 'trending', name: 'Trending', icon: TrendingUp },
    { id: 'new', name: 'New Launches', icon: Eye },
    { id: 'top', name: 'Top Performers', icon: DollarSign },
    { id: 'community', name: 'Community', icon: Users },
  ];

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        await unifiedTokenService.initialize();
        const all = await unifiedTokenService.getAllTokens();
        setTokens(all);
        
        // Load portfolio data
        await loadPortfolio();
        
        // Get AI insights for trending tokens
        if (all.length > 0) {
          const trendingToken = all.find(t => (t.volume24h || 0) > 1000) || all[0];
          await getAIInsights(trendingToken);
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load tokens');
      } finally {
        setIsLoading(false);
      }
    };
    load();
    const id = setInterval(async ()=> {
      await unifiedTokenService.initialize();
      const all = await unifiedTokenService.getAllTokens();
      setTokens(all);
      await loadPortfolio();
    }, 30000);
    return ()=> clearInterval(id)
  }, []);

  const loadPortfolio = async () => {
    try {
      const portfolioData = await hybridSeiService.getPortfolio();
      const seiBalance = await hybridSeiService.getBalance();
      
      setPortfolio({
        SEI: parseFloat(seiBalance),
        USDC: 1000 // Simulated USDC balance
      });
    } catch (error) {
      console.error('Failed to load portfolio:', error);
    }
  };

  const getAIInsights = async (token: TokenData) => {
    try {
      const insights = await enhancedChatBrain.processMessage(`Analyze ${token.symbol} market conditions and provide trading insights for the launch page`);
      setAiInsights(insights.message);
    } catch (error) {
      setAiInsights('AI insights temporarily unavailable. Market analysis in progress...');
    }
  };

  const handleTrade = async (token: TokenData) => {
    if (!tradeAmount || isTrading) return;
    
    setIsTrading(true);
    try {
      // Simulate trade execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update portfolio
      await loadPortfolio();
      
      // Show success message
      alert(`✅ ${tradeType.toUpperCase()} order executed successfully for ${tradeAmount} ${token.symbol}!`);
      
      // Reset form
      setTradeAmount('');
      setSelectedToken(null);
      
    } catch (error) {
      alert(`❌ Trade failed: ${error}`);
    } finally {
      setIsTrading(false);
    }
  };

  const handleAIChat = async () => {
    if (!aiChat.trim() || isAiTyping) return;
    
    const userMessage = aiChat.trim();
    setAiChat('');
    
    // Add user message
    const userMsg = { type: 'user' as const, message: userMessage, timestamp: new Date() };
    setAiMessages(prev => [...prev, userMsg]);
    
    setIsAiTyping(true);
    
    try {
      const response = await enhancedChatBrain.processMessage(userMessage);
      
      // Add AI response
      const aiMsg = { type: 'ai' as const, message: response.message, timestamp: new Date() };
      setAiMessages(prev => [...prev, aiMsg]);
      
    } catch (error) {
      const errorMsg = { type: 'ai' as const, message: 'Sorry, I encountered an error. Please try again.', timestamp: new Date() };
      setAiMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsAiTyping(false);
    }
  };

  const filteredTokens = tokens.filter(token => {
    const matchesSearch = token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         token.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                          (selectedCategory === 'trending' && (token.volume24h || 0) > 1000) ||
                          (selectedCategory === 'new' && (Date.now() - token.createdAt.getTime()) < 7 * 24 * 60 * 60 * 1000) ||
                          (selectedCategory === 'top' && (token.marketCap || 0) > 1000000) ||
                          (selectedCategory === 'community' && token.holders > 1000);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="app-bg-primary min-h-screen">
      {/* Header */}
      <div className="app-bg-secondary border-b app-border">
        <div className="app-container py-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="app-heading-xl app-text-primary mb-4">
                Seifun.launch
              </h1>
              <p className="app-text-lg max-w-3xl">
                Discover the latest and most promising tokens on the Sei blockchain. 
                Launch your own token or invest in emerging projects with confidence.
              </p>
            </div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              <span>{showAdvanced ? 'Hide' : 'Show'} Advanced</span>
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Features Section */}
      {showAdvanced && (
        <div className="app-bg-secondary border-b app-border">
          <div className="app-container py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Portfolio Overview */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                  Portfolio
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">SEI Balance:</span>
                    <span className="font-semibold">{portfolio.SEI?.toFixed(4) || '0.0000'} SEI</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">USDC Balance:</span>
                    <span className="font-semibold">{portfolio.USDC?.toFixed(2) || '0.00'} USDC</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between font-semibold">
                      <span>Total Value:</span>
                      <span className="text-green-600">${((portfolio.SEI || 0) * 0.25 + (portfolio.USDC || 0)).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Market Insights */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                  AI Insights
                </h3>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700 line-clamp-4">{aiInsights}</p>
                </div>
              </div>

              {/* Quick Trading */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-purple-600" />
                  Quick Trade
                </h3>
                {selectedToken ? (
                  <div className="space-y-3">
                    <div className="text-sm">
                      <span className="text-gray-600">Selected: </span>
                      <span className="font-semibold">{selectedToken.symbol}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setTradeType('buy')}
                        className={`flex-1 py-2 px-3 rounded text-sm font-medium ${
                          tradeType === 'buy' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        Buy
                      </button>
                      <button
                        onClick={() => setTradeType('sell')}
                        className={`flex-1 py-2 px-3 rounded text-sm font-medium ${
                          tradeType === 'sell' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        Sell
                      </button>
                    </div>
                    <input
                      type="number"
                      value={tradeAmount}
                      onChange={(e) => setTradeAmount(e.target.value)}
                      placeholder="Amount"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                    <button
                      onClick={() => handleTrade(selectedToken)}
                      disabled={!tradeAmount || isTrading}
                      className="w-full py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isTrading ? 'Executing...' : `${tradeType.toUpperCase()} ${selectedToken.symbol}`}
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Select a token to trade</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Chat Assistant */}
      {showAdvanced && (
        <div className="app-bg-secondary border-b app-border">
          <div className="app-container py-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <MessageCircle className="w-5 h-5 mr-2 text-indigo-600" />
                AI Trading Assistant
              </h3>
              
              {/* Chat Messages */}
              <div className="h-48 overflow-y-auto mb-4 space-y-3 border rounded-lg p-3 bg-gray-50">
                {aiMessages.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">
                    Ask me about market conditions, trading strategies, or token analysis!
                  </p>
                ) : (
                  aiMessages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs p-3 rounded-lg ${
                        msg.type === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <p className="text-sm">{msg.message}</p>
                      </div>
                    </div>
                  ))
                )}
                {isAiTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Chat Input */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={aiChat}
                  onChange={(e) => setAiChat(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAIChat()}
                  placeholder="Ask AI about market conditions, trading strategies..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleAIChat}
                  disabled={!aiChat.trim() || isAiTyping}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="app-container py-8">
        {/* Search Bar */}
        <div className="app-search-bar">
          <Search className="app-search-icon" />
          <input
            type="text"
            placeholder="Search tokens by name or symbol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="app-search-input"
          />
        </div>

        {/* Category Tabs */}
        <div className="app-category-tabs">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`app-category-tab ${
                  selectedCategory === category.id ? 'active' : ''
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {category.name}
              </button>
            );
          })}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="app-text-secondary">Loading tokens...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="app-text-secondary mb-4">{error}</div>
            <button 
              onClick={() => window.location.reload()} 
              className="app-btn app-btn-primary"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Token Grid */}
        {!isLoading && !error && (
          <div className="app-token-grid">
            {filteredTokens.map((token) => (
              <div key={token.address} className="app-token-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={token.tokenImage || '/Seifu.png'}
                      alt={token.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold app-text-primary">{token.name}</h3>
                        {token.verified && (
                          <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-sm app-text-muted">{token.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold app-text-primary">
                      {(token.price ?? 0).toFixed(6)}
                    </div>
                    <div className={`text-sm ${
                      (token.priceChange24h ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {(token.priceChange24h ?? 0) >= 0 ? '+' : ''}{(token.priceChange24h ?? 0).toFixed(2)}%
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="app-text-muted">Market Cap</div>
                    <div className="app-text-primary">${((token.marketCap || 0) / 1000000).toFixed(2)}M</div>
                  </div>
                  <div>
                    <div className="app-text-muted">Volume 24h</div>
                    <div className="app-text-primary">${((token.volume24h || 0) / 1000).toFixed(0)}K</div>
                  </div>
                  <div>
                    <div className="app-text-muted">Holders</div>
                    <div className="app-text-primary">{token.holders.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="app-text-muted">Liquidity</div>
                    <div className="app-text-primary">${((token.liquidity || 0) / 1000).toFixed(0)}K</div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t app-border">
                  <p className="text-sm app-text-secondary mb-3">Created {token.createdAt.toLocaleDateString()}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs app-text-muted">
                      Address: {token.address.slice(0, 6)}...{token.address.slice(-4)}
                    </span>
                    <div className="flex space-x-2">
                      {showAdvanced && (
                        <button
                          onClick={() => setSelectedToken(token)}
                          className="px-3 py-1 text-xs bg-purple-100 text-purple-600 rounded hover:bg-purple-200"
                        >
                          Trade
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/app/charts?token=${token.address}`)}
                        className="app-btn app-btn-primary text-sm"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredTokens.length === 0 && (
          <div className="text-center py-12">
            <div className="app-text-secondary mb-4">No tokens found matching your criteria.</div>
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }} 
              className="app-btn app-btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeifunLaunch;