import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, Activity, BarChart3, LineChart, CandlestickChart, Search, Filter } from 'lucide-react';
import { unifiedTokenService, TokenData } from '../services/UnifiedTokenService';

// Chart types available
type ChartType = 'line' | 'candlestick' | 'area' | 'bar';

// Price history data point
interface PricePoint {
  timestamp: number;
  price: number;
  volume: number;
}

// Chart configuration
interface ChartConfig {
  type: ChartType;
  timeframe: '1H' | '4H' | '1D' | '1W' | '1M';
  showVolume: boolean;
  showIndicators: boolean;
}

const RealTimeChart: React.FC = () => {
  const [selectedToken, setSelectedToken] = useState<string>('');
  const [chartType, setChartType] = useState<ChartType>('line');
  const [timeframe, setTimeframe] = useState<'1H' | '4H' | '1D' | '1W' | '1M'>('1D');
  const [showVolume, setShowVolume] = useState(true);
  const [showIndicators, setShowIndicators] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [priceData, setPriceData] = useState<PricePoint[]>([]);
  const [tokenInfo, setTokenInfo] = useState<TokenData | null>(null);
  const [allTokens, setAllTokens] = useState<TokenData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'verified' | 'trending' | 'new'>('all');
  
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Load all tokens from the unified service
  useEffect(() => {
    loadAllTokens();
    
    // Listen for new token creation events
    unifiedTokenService.on('tokenCreated', loadAllTokens);
    unifiedTokenService.on('tokenUpdated', loadAllTokens);
    
    return () => {
      unifiedTokenService.off('tokenCreated', loadAllTokens);
      unifiedTokenService.off('tokenUpdated', loadAllTokens);
    };
  }, []);

  const loadAllTokens = async () => {
    try {
      const tokens = await unifiedTokenService.getAllTokens();
      setAllTokens(tokens);
      
      // If no token is selected, select the first one
      if (!selectedToken && tokens.length > 0) {
        setSelectedToken(tokens[0].address);
      }
    } catch (error) {
      console.error('Failed to load tokens:', error);
    }
  };

  // Filter tokens based on search and category
  const filteredTokens = allTokens.filter(token => {
    const matchesSearch = searchTerm === '' || 
      token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' ||
      (filterCategory === 'verified' && token.verified) ||
      (filterCategory === 'trending' && token.volume24h > 1000) ||
      (filterCategory === 'new' && (Date.now() - token.createdAt.getTime()) < 7 * 24 * 60 * 60 * 1000);
    
    return matchesSearch && matchesCategory;
  });

  // Load price data for selected token
  useEffect(() => {
    if (!selectedToken) return;
    
    setIsLoading(true);
    
    // Get chart data from unified service
    const loadChartData = async () => {
      try {
        const chartData = unifiedTokenService.getChartData(selectedToken);
        const token = allTokens.find(t => t.address === selectedToken);
        
        if (token) {
          setTokenInfo(token);
          
          // Convert chart data to price points
          const pricePoints: PricePoint[] = chartData.map(point => ({
            timestamp: point.timestamp,
            price: point.close,
            volume: point.volume
          }));
          
          setPriceData(pricePoints);
        }
      } catch (error) {
        console.error('Failed to load chart data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadChartData();
  }, [selectedToken, allTokens]);

  // Render chart based on type
  const renderChart = () => {
    if (!priceData.length) return null;
    
    const maxPrice = Math.max(...priceData.map(p => p.price));
    const minPrice = Math.min(...priceData.map(p => p.price));
    const priceRange = maxPrice - minPrice;
    
    const maxVolume = Math.max(...priceData.map(p => p.volume));
    
    return (
      <div className="w-full h-96 bg-slate-800 rounded-lg p-4">
        {/* Chart Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-white">
              {tokenInfo?.symbol}/USD Chart
            </h3>
            <span className="text-sm text-slate-400">
              {timeframe} • {chartType}
            </span>
          </div>
          
          {/* Price Display */}
          {tokenInfo && (
            <div className="text-right">
              <div className="text-2xl font-bold text-white">
                ${tokenInfo.price.toFixed(6)}
              </div>
              <div className={`text-sm ${tokenInfo.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {tokenInfo.priceChange24h >= 0 ? '+' : ''}{tokenInfo.priceChange24h.toFixed(2)}%
              </div>
            </div>
          )}
        </div>
        
        {/* Chart Canvas */}
        <div className="relative w-full h-80 bg-slate-900 rounded border border-slate-700">
          {/* Price Chart */}
          <svg className="w-full h-full" viewBox={`0 0 ${priceData.length * 4} 300`}>
            {/* Grid Lines */}
            {Array.from({ length: 5 }).map((_, i) => (
              <g key={i}>
                <line
                  x1="0"
                  y1={i * 60}
                  x2={priceData.length * 4}
                  y2={i * 60}
                  stroke="rgba(148, 163, 184, 0.1)"
                  strokeWidth="1"
                />
                <text
                  x="0"
                  y={i * 60 + 15}
                  fill="rgba(148, 163, 184, 0.6)"
                  fontSize="12"
                >
                  ${(maxPrice - (i * priceRange / 4)).toFixed(6)}
                </text>
              </g>
            ))}
            
            {/* Price Line */}
            <path
              d={priceData.map((point, i) => {
                const x = i * 4;
                const y = 300 - ((point.price - minPrice) / priceRange) * 300;
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}
              stroke="#3B82F6"
              strokeWidth="2"
              fill="none"
            />
            
            {/* Volume Bars */}
            {showVolume && priceData.map((point, i) => {
              const x = i * 4;
              const volumeHeight = (point.volume / maxVolume) * 100;
              const y = 300 - volumeHeight;
              
              return (
                <rect
                  key={i}
                  x={x}
                  y={y}
                  width="3"
                  height={volumeHeight}
                  fill="rgba(59, 130, 246, 0.3)"
                />
              );
            })}
          </svg>
          
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center">
              <div className="text-white">Loading chart data...</div>
            </div>
          )}
        </div>
        
        {/* Chart Controls */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1 rounded text-sm ${
                chartType === 'line' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <LineChart className="w-4 h-4 inline mr-1" />
              Line
            </button>
            <button
              onClick={() => setChartType('candlestick')}
              className={`px-3 py-1 rounded text-sm ${
                chartType === 'candlestick' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <CandlestickChart className="w-4 h-4 inline mr-1" />
              Candlestick
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`px-3 py-1 rounded text-sm ${
                chartType === 'area' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-1" />
              Area
            </button>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setShowVolume(!showVolume)}
              className={`px-3 py-1 rounded text-sm ${
                showVolume 
                  ? 'bg-green-500 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Volume
            </button>
            <button
              onClick={() => setShowIndicators(!showIndicators)}
              className={`px-3 py-1 rounded text-sm ${
                showIndicators 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Indicators
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="app-card rounded-xl shadow-xl border app-border">
        {/* Header */}
        <div className="border-b app-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold app-text-primary flex items-center">
                <TrendingUp className="w-8 h-8 text-blue-500 mr-3" />
                Seifun Ecosystem Charts
              </h1>
              <p className="app-text-muted mt-2">
                Real-time charts for all tokens created on Seifun - SeiList, Dev++, and Launch
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm app-text-muted">Total Tokens</div>
                <div className="app-text-primary font-semibold">{allTokens.length}</div>
              </div>
              <div className="text-right">
                <div className="text-sm app-text-muted">Last Update</div>
                <div className="app-text-primary font-semibold">
                  {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Token Selection & Search */}
        <div className="p-6 border-b app-border">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search tokens by name or symbol..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 app-bg-secondary border app-border rounded-lg app-text-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 app-text-muted" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as any)}
                className="app-bg-secondary border app-border rounded-lg px-3 py-2 app-text-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Tokens</option>
                <option value="verified">Verified Only</option>
                <option value="trending">Trending</option>
                <option value="new">New Launches</option>
              </select>
            </div>
            
            {/* Token Selection */}
            <div className="min-w-[300px]">
              <select
                value={selectedToken}
                onChange={(e) => setSelectedToken(e.target.value)}
                className="w-full app-bg-secondary border app-border rounded-lg px-4 py-2 app-text-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choose a token...</option>
                {filteredTokens.map(token => (
                  <option key={token.address} value={token.address}>
                    {token.symbol} - {token.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Timeframe Selection */}
            <div className="flex space-x-1">
              {(['1H', '4H', '1D', '1W', '1M'] as const).map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-2 rounded text-sm font-medium ${
                    timeframe === tf
                      ? 'app-btn app-btn-primary'
                      : 'app-bg-tertiary app-text-secondary hover:app-bg-secondary'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Chart Display */}
        <div className="p-6">
          {selectedToken && tokenInfo ? (
            renderChart()
          ) : (
            <div className="text-center py-20">
              <Activity className="w-16 h-16 app-text-muted mx-auto mb-4" />
              <h3 className="text-xl font-semibold app-text-secondary mb-2">
                Select a token to view charts
              </h3>
              <p className="app-text-muted">
                Choose from {filteredTokens.length} available tokens in the Seifun ecosystem
              </p>
            </div>
          )}
        </div>
        
        {/* Token Information */}
        {tokenInfo && (
          <div className="border-t app-border p-6">
            <h3 className="text-lg font-semibold app-text-primary mb-4">Token Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="app-bg-secondary p-4 rounded-lg">
                <div className="text-sm app-text-muted">Market Cap</div>
                <div className="text-lg font-semibold app-text-primary">
                  ${(tokenInfo.marketCap / 1000000).toFixed(2)}M
                </div>
              </div>
              <div className="app-bg-secondary p-4 rounded-lg">
                <div className="text-sm app-text-muted">24h Volume</div>
                <div className="text-lg font-semibold app-text-primary">
                  ${(tokenInfo.volume24h / 1000000).toFixed(2)}M
                </div>
              </div>
              <div className="app-bg-secondary p-4 rounded-lg">
                <div className="text-sm app-text-muted">Liquidity</div>
                <div className="text-lg font-semibold app-text-primary">
                  ${(tokenInfo.liquidity / 1000000).toFixed(2)}M
                </div>
              </div>
              <div className="app-bg-secondary p-4 rounded-lg">
                <div className="text-sm app-text-muted">Price Change</div>
                <div className={`text-lg font-semibold ${
                  tokenInfo.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {tokenInfo.priceChange24h >= 0 ? '+' : ''}{tokenInfo.priceChange24h.toFixed(2)}%
                </div>
              </div>
            </div>
            
            {/* Additional Token Details */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="app-bg-secondary p-4 rounded-lg">
                <h4 className="font-semibold app-text-primary mb-3">Token Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="app-text-muted">Symbol:</span>
                    <span className="app-text-primary">{tokenInfo.symbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="app-text-muted">Total Supply:</span>
                    <span className="app-text-primary">{parseInt(tokenInfo.totalSupply).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="app-text-muted">Decimals:</span>
                    <span className="app-text-primary">{tokenInfo.decimals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="app-text-muted">Holders:</span>
                    <span className="app-text-primary">{tokenInfo.holders}</span>
                  </div>
                </div>
              </div>
              
              <div className="app-bg-secondary p-4 rounded-lg">
                <h4 className="font-semibold app-text-primary mb-3">Security & Status</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="app-text-muted">Verified:</span>
                    <span className={`${tokenInfo.verified ? 'text-green-400' : 'text-red-400'}`}>
                      {tokenInfo.verified ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="app-text-muted">Security Score:</span>
                    <span className={`font-semibold ${
                      tokenInfo.securityScore >= 80 ? 'text-green-400' : 
                      tokenInfo.securityScore >= 60 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {tokenInfo.securityScore}/100
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="app-text-muted">Trading:</span>
                    <span className={`${tokenInfo.tradingEnabled ? 'text-green-400' : 'text-yellow-400'}`}>
                      {tokenInfo.tradingEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="app-text-muted">Launch Date:</span>
                    <span className="app-text-primary">
                      {tokenInfo.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealTimeChart;