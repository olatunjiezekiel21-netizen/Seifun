import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Target, 
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Settings,
  Plus,
  Minus,
  Eye,
  EyeOff
} from 'lucide-react';
import { hybridSeiService } from '../services/HybridSeiService';
import { enhancedChatBrain } from '../services/EnhancedChatBrain';

interface TokenData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  supply: number;
  logo?: string;
}

interface OrderBook {
  bids: Array<{ price: number; amount: number; total: number }>;
  asks: Array<{ price: number; amount: number; total: number }>;
}

interface LimitOrder {
  id: string;
  type: 'buy' | 'sell';
  token: string;
  amount: number;
  price: number;
  status: 'active' | 'filled' | 'cancelled';
  timestamp: number;
}

const LaunchPage: React.FC = () => {
  // State management
  const [selectedToken, setSelectedToken] = useState<TokenData | null>(null);
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [orderBook, setOrderBook] = useState<OrderBook>({ bids: [], asks: [] });
  const [limitOrders, setLimitOrders] = useState<LimitOrder[]>([]);
  const [priceHistory, setPriceHistory] = useState<Array<{ time: number; price: number }>>([]);
  const [aiInsights, setAiInsights] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showOrderBook, setShowOrderBook] = useState(true);
  const [showPriceChart, setShowPriceChart] = useState(true);
  
  // Trading state
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [tradeAmount, setTradeAmount] = useState('');
  const [tradePrice, setTradePrice] = useState('');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [isTrading, setIsTrading] = useState(false);
  
  // Portfolio state
  const [portfolio, setPortfolio] = useState<{ [key: string]: number }>({});
  const [totalValue, setTotalValue] = useState(0);
  
  // AI Chat state
  const [aiChat, setAiChat] = useState('');
  const [aiMessages, setAiMessages] = useState<Array<{ type: 'user' | 'ai'; message: string; timestamp: Date }>>([]);
  const [isAiTyping, setIsAiTyping] = useState(false);

  const chartRef = useRef<HTMLCanvasElement>(null);

  // Initialize data
  useEffect(() => {
    initializeData();
    const interval = setInterval(updateMarketData, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const initializeData = async () => {
    setIsLoading(true);
    try {
      // Load portfolio
      const portfolioData = await hybridSeiService.getPortfolio();
      const seiBalance = await hybridSeiService.getBalance();
      
      setPortfolio({
        SEI: parseFloat(seiBalance),
        USDC: 1000 // Simulated USDC balance
      });

      // Initialize tokens with real data
      const initialTokens: TokenData[] = [
        {
          symbol: 'SEI',
          name: 'Sei Network',
          price: 0.25,
          change24h: Math.random() * 20 - 10,
          volume24h: 15000000,
          marketCap: 2500000000,
          supply: 10000000000,
          logo: '/api/placeholder/32/32'
        },
        {
          symbol: 'USDC',
          name: 'USD Coin',
          price: 1.00,
          change24h: 0.1,
          volume24h: 50000000000,
          marketCap: 32000000000,
          supply: 32000000000,
          logo: '/api/placeholder/32/32'
        }
      ];

      setTokens(initialTokens);
      setSelectedToken(initialTokens[0]);
      
      // Generate order book
      generateOrderBook(initialTokens[0]);
      
      // Generate price history
      generatePriceHistory(initialTokens[0]);
      
      // Get AI insights
      await getAIInsights(initialTokens[0]);
      
    } catch (error) {
      console.error('Failed to initialize launch page:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateMarketData = async () => {
    if (!selectedToken) return;
    
    // Simulate real-time price updates
    const updatedTokens = tokens.map(token => ({
      ...token,
      price: token.price * (1 + (Math.random() - 0.5) * 0.02), // ±1% price movement
      change24h: Math.random() * 20 - 10,
      volume24h: token.volume24h * (1 + (Math.random() - 0.5) * 0.1)
    }));
    
    setTokens(updatedTokens);
    
    const updatedSelected = updatedTokens.find(t => t.symbol === selectedToken.symbol);
    if (updatedSelected) {
      setSelectedToken(updatedSelected);
      generateOrderBook(updatedSelected);
      generatePriceHistory(updatedSelected);
    }
  };

  const generateOrderBook = (token: TokenData) => {
    const bids = [];
    const asks = [];
    
    for (let i = 0; i < 10; i++) {
      const bidPrice = token.price * (1 - (i + 1) * 0.001);
      const askPrice = token.price * (1 + (i + 1) * 0.001);
      const amount = Math.random() * 1000 + 100;
      
      bids.push({
        price: bidPrice,
        amount: amount,
        total: bidPrice * amount
      });
      
      asks.push({
        price: askPrice,
        amount: amount,
        total: askPrice * amount
      });
    }
    
    setOrderBook({ bids, asks });
  };

  const generatePriceHistory = (token: TokenData) => {
    const history = [];
    const now = Date.now();
    
    for (let i = 24; i >= 0; i--) {
      const time = now - (i * 60 * 60 * 1000); // Hourly data
      const price = token.price * (1 + (Math.random() - 0.5) * 0.1);
      history.push({ time, price });
    }
    
    setPriceHistory(history);
  };

  const getAIInsights = async (token: TokenData) => {
    try {
      const insights = await enhancedChatBrain.processMessage(`Analyze ${token.symbol} market conditions and provide trading insights`);
      setAiInsights(insights.message);
    } catch (error) {
      setAiInsights('AI insights temporarily unavailable. Market analysis in progress...');
    }
  };

  const handleTrade = async () => {
    if (!selectedToken || !tradeAmount || isTrading) return;
    
    setIsTrading(true);
    try {
      if (orderType === 'market') {
        // Execute market order immediately
        const result = await executeMarketOrder();
        if (result.success) {
          // Update portfolio
          await updatePortfolio();
          // Show success message
          alert(`✅ ${tradeType.toUpperCase()} order executed successfully!`);
        }
      } else {
        // Create limit order
        const order: LimitOrder = {
          id: `order-${Date.now()}`,
          type: tradeType,
          token: selectedToken.symbol,
          amount: parseFloat(tradeAmount),
          price: parseFloat(tradePrice),
          status: 'active',
          timestamp: Date.now()
        };
        
        setLimitOrders(prev => [...prev, order]);
        alert(`📋 Limit ${tradeType} order created for ${tradeAmount} ${selectedToken.symbol} at $${tradePrice}`);
      }
      
      // Reset form
      setTradeAmount('');
      setTradePrice('');
      
    } catch (error) {
      alert(`❌ Trade failed: ${error}`);
    } finally {
      setIsTrading(false);
    }
  };

  const executeMarketOrder = async () => {
    // Simulate market order execution
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { success: true, hash: `market-${Date.now()}` };
  };

  const updatePortfolio = async () => {
    const portfolioData = await hybridSeiService.getPortfolio();
    const seiBalance = await hybridSeiService.getBalance();
    
    setPortfolio({
      SEI: parseFloat(seiBalance),
      USDC: 1000
    });
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

  const cancelLimitOrder = (orderId: string) => {
    setLimitOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: 'cancelled' as const } : order
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading market data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🚀 Seifun Launch Pad</h1>
              <p className="text-gray-600">Advanced Trading & AI Insights</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Portfolio Value</p>
                <p className="text-lg font-semibold text-green-600">${totalValue.toFixed(2)}</p>
              </div>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Advanced</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Token Selection & Price Chart */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Token Selector */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Select Token</h2>
              <div className="grid grid-cols-2 gap-4">
                {tokens.map((token) => (
                  <button
                    key={token.symbol}
                    onClick={() => setSelectedToken(token)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedToken?.symbol === token.symbol
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{token.symbol}</h3>
                        <p className="text-sm text-gray-600">{token.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${token.price.toFixed(4)}</p>
                        <p className={`text-sm ${token.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Chart */}
            {showPriceChart && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Price Chart</h2>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 text-sm bg-gray-100 rounded">1H</button>
                    <button className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded">24H</button>
                    <button className="px-3 py-1 text-sm bg-gray-100 rounded">7D</button>
                  </div>
                </div>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <canvas ref={chartRef} className="w-full h-full" />
                  <p className="text-gray-500">Price chart visualization</p>
                </div>
              </div>
            )}

            {/* AI Insights */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                AI Market Insights
              </h2>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                <p className="text-gray-700">{aiInsights}</p>
              </div>
            </div>
          </div>

          {/* Trading Panel */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Trading Interface */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Trading Panel</h2>
              
              {/* Order Type Toggle */}
              <div className="flex space-x-2 mb-4">
                <button
                  onClick={() => setOrderType('market')}
                  className={`px-4 py-2 rounded-lg ${
                    orderType === 'market' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Market Order
                </button>
                <button
                  onClick={() => setOrderType('limit')}
                  className={`px-4 py-2 rounded-lg ${
                    orderType === 'limit' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Limit Order
                </button>
              </div>

              {/* Buy/Sell Toggle */}
              <div className="flex space-x-2 mb-4">
                <button
                  onClick={() => setTradeType('buy')}
                  className={`flex-1 py-3 rounded-lg font-semibold ${
                    tradeType === 'buy' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4 inline mr-2" />
                  Buy {selectedToken?.symbol}
                </button>
                <button
                  onClick={() => setTradeType('sell')}
                  className={`flex-1 py-3 rounded-lg font-semibold ${
                    tradeType === 'sell' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <ArrowDownRight className="w-4 h-4 inline mr-2" />
                  Sell {selectedToken?.symbol}
                </button>
              </div>

              {/* Amount Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount ({selectedToken?.symbol})
                </label>
                <input
                  type="number"
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>Available: {portfolio[selectedToken?.symbol || '']?.toFixed(4) || '0.0000'}</span>
                  <span>≈ ${(parseFloat(tradeAmount || '0') * (selectedToken?.price || 0)).toFixed(2)}</span>
                </div>
              </div>

              {/* Price Input (for limit orders) */}
              {orderType === 'limit' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (USD)
                  </label>
                  <input
                    type="number"
                    value={tradePrice}
                    onChange={(e) => setTradePrice(e.target.value)}
                    placeholder={selectedToken?.price.toFixed(4)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Execute Trade Button */}
              <button
                onClick={handleTrade}
                disabled={!tradeAmount || isTrading}
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  isTrading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : tradeType === 'buy'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {isTrading ? (
                  <div className="flex items-center justify-center">
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    Executing...
                  </div>
                ) : (
                  `${tradeType.toUpperCase()} ${selectedToken?.symbol}`
                )}
              </button>
            </div>

            {/* Order Book */}
            {showOrderBook && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Order Book</h2>
                <div className="grid grid-cols-2 gap-4">
                  {/* Asks (Sell Orders) */}
                  <div>
                    <h3 className="text-sm font-medium text-red-600 mb-2">Asks (Sell)</h3>
                    <div className="space-y-1">
                      {orderBook.asks.slice(0, 5).map((ask, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-red-600">{ask.price.toFixed(4)}</span>
                          <span className="text-gray-600">{ask.amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Bids (Buy Orders) */}
                  <div>
                    <h3 className="text-sm font-medium text-green-600 mb-2">Bids (Buy)</h3>
                    <div className="space-y-1">
                      {orderBook.bids.slice(0, 5).map((bid, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-green-600">{bid.price.toFixed(4)}</span>
                          <span className="text-gray-600">{bid.amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Limit Orders */}
            {limitOrders.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Active Limit Orders</h2>
                <div className="space-y-3">
                  {limitOrders.filter(order => order.status === 'active').map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{order.type.toUpperCase()} {order.amount} {order.token}</p>
                        <p className="text-sm text-gray-600">at ${order.price.toFixed(4)}</p>
                      </div>
                      <button
                        onClick={() => cancelLimitOrder(order.id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
                      >
                        Cancel
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Chat */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">AI Trading Assistant</h2>
              
              {/* Chat Messages */}
              <div className="h-48 overflow-y-auto mb-4 space-y-3">
                {aiMessages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs p-3 rounded-lg ${
                      msg.type === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  </div>
                ))}
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaunchPage;