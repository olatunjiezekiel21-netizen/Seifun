import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, Activity, BarChart3, LineChart, CandlestickChart } from 'lucide-react';

// Chart types available
type ChartType = 'line' | 'candlestick' | 'area' | 'bar';

// Token data interface
interface TokenData {
  symbol: string;
  name: string;
  price: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  volume24h: number;
  marketCap: number;
  liquidity: number;
  lastUpdated: Date;
}

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
  
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Mock token data for demonstration (replace with real API calls)
  const mockTokens: TokenData[] = [
    {
      symbol: 'SEI',
      name: 'Sei Network',
      price: 0.834,
      priceChange24h: 0.023,
      priceChangePercent24h: 2.84,
      volume24h: 12500000,
      marketCap: 2500000000,
      liquidity: 45000000,
      lastUpdated: new Date()
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      price: 1.00,
      priceChange24h: 0.001,
      priceChangePercent24h: 0.10,
      volume24h: 89000000,
      marketCap: 45000000000,
      liquidity: 120000000,
      lastUpdated: new Date()
    }
  ];

  // Generate mock price data
  const generateMockPriceData = (timeframe: string): PricePoint[] => {
    const now = Date.now();
    const data: PricePoint[] = [];
    let interval: number;
    
    switch (timeframe) {
      case '1H':
        interval = 5 * 60 * 1000; // 5 minutes
        break;
      case '4H':
        interval = 15 * 60 * 1000; // 15 minutes
        break;
      case '1D':
        interval = 60 * 60 * 1000; // 1 hour
        break;
      case '1W':
        interval = 4 * 60 * 60 * 1000; // 4 hours
        break;
      case '1M':
        interval = 24 * 60 * 60 * 1000; // 1 day
        break;
      default:
        interval = 60 * 60 * 1000;
    }
    
    let basePrice = 0.834; // SEI base price
    for (let i = 0; i < 100; i++) {
      const timestamp = now - (100 - i) * interval;
      const randomChange = (Math.random() - 0.5) * 0.02; // ±1% random change
      basePrice = Math.max(0.1, basePrice * (1 + randomChange));
      
      data.push({
        timestamp,
        price: basePrice,
        volume: Math.random() * 1000000 + 100000
      });
    }
    
    return data;
  };

  // Load price data for selected token
  useEffect(() => {
    if (!selectedToken) return;
    
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const data = generateMockPriceData(timeframe);
      setPriceData(data);
      
      // Find token info
      const token = mockTokens.find(t => t.symbol === selectedToken);
      if (token) {
        setTokenInfo(token);
      }
      
      setIsLoading(false);
    }, 1000);
  }, [selectedToken, timeframe]);

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
              {selectedToken}/USD Chart
            </h3>
            <span className="text-sm text-slate-400">
              {timeframe} • {chartType}
            </span>
          </div>
          
          {/* Price Display */}
          {tokenInfo && (
            <div className="text-right">
              <div className="text-2xl font-bold text-white">
                ${tokenInfo.price.toFixed(4)}
              </div>
              <div className={`text-sm ${tokenInfo.priceChangePercent24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {tokenInfo.priceChangePercent24h >= 0 ? '+' : ''}{tokenInfo.priceChangePercent24h.toFixed(2)}%
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
                  ${(maxPrice - (i * priceRange / 4)).toFixed(4)}
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
                  : 'app-bg-tertiary app-text-secondary hover:app-bg-secondary'
              }`}
            >
              Volume
            </button>
            <button
              onClick={() => setShowIndicators(!showIndicators)}
              className={`px-3 py-1 rounded text-sm ${
                showIndicators 
                  ? 'bg-purple-500 text-white' 
                  : 'app-bg-tertiary app-text-secondary hover:app-bg-secondary'
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
                Real-Time Charts
              </h1>
              <p className="app-text-muted mt-2">
                Professional charting powered by free tools - DexScreener alternative
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm app-text-muted">Network</div>
                <div className="app-text-primary font-semibold">Sei Testnet</div>
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
        
        {/* Token Selection */}
        <div className="p-6 border-b app-border">
          <div className="flex items-center space-x-4">
            <label className="app-text-primary font-medium">Select Token:</label>
            <select
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value)}
              className="app-bg-secondary border app-border rounded-lg px-4 py-2 app-text-primary focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Choose a token...</option>
              {mockTokens.map(token => (
                <option key={token.symbol} value={token.symbol}>
                  {token.symbol} - {token.name}
                </option>
              ))}
            </select>
            
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
          {selectedToken ? (
            renderChart()
          ) : (
            <div className="text-center py-20">
              <Activity className="w-16 h-16 app-text-muted mx-auto mb-4" />
              <h3 className="text-xl font-semibold app-text-secondary mb-2">
                Select a token to view charts
              </h3>
              <p className="app-text-muted">
                Choose from available tokens to see real-time price data and charts
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
                  tokenInfo.priceChangePercent24h >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {tokenInfo.priceChangePercent24h >= 0 ? '+' : ''}{tokenInfo.priceChangePercent24h.toFixed(2)}%
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