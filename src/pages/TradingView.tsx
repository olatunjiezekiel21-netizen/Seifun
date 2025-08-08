import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  DollarSign,
  Users,
  Clock,
  ExternalLink,
  RefreshCw,
  Eye,
  Volume2,
  Zap,
  Globe,
  Twitter,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCircle
} from 'lucide-react';
import { tradingDataService, TokenPair, OHLCVData, TradingMetrics, RecentTrade } from '../utils/tradingDataService';

interface TradingViewProps {}

const TradingView: React.FC<TradingViewProps> = () => {
  const { chainId, pairAddress } = useParams<{ chainId: string; pairAddress: string }>();
  const [searchParams] = useSearchParams();
  
  // State management
  const [pairData, setPairData] = useState<TokenPair | null>(null);
  const [ohlcvData, setOhlcvData] = useState<OHLCVData[]>([]);
  const [tradingMetrics, setTradingMetrics] = useState<TradingMetrics | null>(null);
  const [recentTrades, setRecentTrades] = useState<RecentTrade[]>([]);
  const [trendingPairs, setTrendingPairs] = useState<TokenPair[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'5m' | '15m' | '1h' | '4h' | '1d'>('1h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showTrades, setShowTrades] = useState(true);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // Refs for auto-refresh
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get token address from search params or derive from pair data
  const tokenAddress = searchParams.get('token') || pairData?.baseToken.address;

  useEffect(() => {
    if (chainId && pairAddress) {
      loadTradingData();
    }
  }, [chainId, pairAddress, selectedTimeframe]);

  useEffect(() => {
    // Auto-refresh setup
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        refreshData();
      }, 30000); // Refresh every 30 seconds
    } else {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, chainId, pairAddress]);

  const loadTradingData = async () => {
    if (!chainId || !pairAddress) return;

    setLoading(true);
    setError(null);

    try {
      // Load all data in parallel
      const [pair, ohlcv, trending] = await Promise.all([
        tradingDataService.getTokenPairData(chainId, pairAddress),
        tradingDataService.getOHLCVData(chainId, pairAddress, selectedTimeframe, 100),
        tradingDataService.getTrendingPairs(chainId, 10)
      ]);

      if (!pair) {
        setError('Token pair not found. Please check the address and try again.');
        return;
      }

      setPairData(pair);
      setOhlcvData(ohlcv);
      setTrendingPairs(trending);

      // Load additional data if we have token address
      if (pair.baseToken.address) {
        const [metrics, trades] = await Promise.all([
          tradingDataService.getTradingMetrics(chainId, pair.baseToken.address),
          tradingDataService.getRecentTrades(chainId, pairAddress, 50)
        ]);

        setTradingMetrics(metrics);
        setRecentTrades(trades);
      }
    } catch (err) {
      console.error('Error loading trading data:', err);
      setError('Failed to load trading data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    if (!chainId || !pairAddress || loading) return;

    try {
      // Refresh key data without showing loading state
      const [pair, trades] = await Promise.all([
        tradingDataService.getTokenPairData(chainId, pairAddress),
        tradingDataService.getRecentTrades(chainId, pairAddress, 50)
      ]);

      if (pair) setPairData(pair);
      setRecentTrades(trades);
    } catch (err) {
      console.error('Error refreshing data:', err);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(type);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getPriceChangeColor = (change: number): string => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  const getPriceChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4" />;
    if (change < 0) return <TrendingDown className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen app-bg-primary">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
              <h2 className="app-heading-md mb-2">Loading Trading Data</h2>
              <p className="app-text-muted">Fetching real-time market information...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !pairData) {
    return (
      <div className="min-h-screen app-bg-primary">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="app-card p-8 max-w-md mx-auto">
              <div className="text-red-500 mb-4">
                <Activity className="w-12 h-12 mx-auto" />
              </div>
              <h2 className="app-heading-md mb-4">Unable to Load Trading Data</h2>
              <p className="app-text-muted mb-6">{error}</p>
              <button
                onClick={loadTradingData}
                className="app-button-primary"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen app-bg-primary">
      <div className="container mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="app-card p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={pairData.info?.imageUrl || `/tokens/${pairData.baseToken.symbol.toLowerCase()}.png`}
                  alt={`${pairData.baseToken.name} logo`}
                  className="w-16 h-16 rounded-full border-2 border-gray-200 bg-white"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/Seifu.png'; // Fallback to Seifun logo
                  }}
                />
              </div>
              <div>
                <h1 className="app-heading-lg mb-1">
                  {pairData.baseToken.name} ({pairData.baseToken.symbol})
                </h1>
                <div className="flex items-center space-x-4">
                  <span className="app-text-muted">
                    vs {pairData.quoteToken.symbol}
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {pairData.dexId.toUpperCase()}
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                    {pairData.chainId.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                  autoRefresh 
                    ? 'bg-green-50 border-green-200 text-green-700' 
                    : 'app-bg-secondary border-gray-200 app-text-muted'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                <span className="text-sm">Auto</span>
              </button>
              
              {pairData.url && (
                <a
                  href={pairData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-3 py-2 app-bg-secondary border border-gray-200 rounded-lg hover:app-bg-tertiary transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="text-sm">View on DexScreener</span>
                </a>
              )}
            </div>
          </div>

          {/* Price and Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <DollarSign className="w-5 h-5 text-green-500" />
                <span className="app-text-muted text-sm">Price USD</span>
              </div>
              <div className="text-2xl font-bold app-text-primary">
                ${tradingDataService.formatPrice(pairData.priceUsd)}
              </div>
              <div className={`flex items-center space-x-1 text-sm ${getPriceChangeColor(pairData.priceChange24h)}`}>
                {getPriceChangeIcon(pairData.priceChange24h)}
                <span>{tradingDataService.formatPercentage(pairData.priceChange24h)} (24h)</span>
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-1">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                <span className="app-text-muted text-sm">Volume 24h</span>
              </div>
              <div className="text-xl font-bold app-text-primary">
                ${tradingDataService.formatNumber(pairData.volume24h)}
              </div>
              <div className="app-text-muted text-sm">
                Liquidity: ${tradingDataService.formatNumber(pairData.liquidity.usd)}
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-1">
                <Activity className="w-5 h-5 text-purple-500" />
                <span className="app-text-muted text-sm">Transactions 24h</span>
              </div>
              <div className="text-xl font-bold app-text-primary">
                {pairData.txns.h24.buys + pairData.txns.h24.sells}
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-green-500">{pairData.txns.h24.buys} buys</span>
                <span className="text-red-500">{pairData.txns.h24.sells} sells</span>
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-1">
                <Clock className="w-5 h-5 text-orange-500" />
                <span className="app-text-muted text-sm">Pair Age</span>
              </div>
              <div className="text-xl font-bold app-text-primary">
                {pairData.pairCreatedAt ? formatTimeAgo(pairData.pairCreatedAt) : 'Unknown'}
              </div>
              {pairData.marketCap && (
                <div className="app-text-muted text-sm">
                  MCap: ${tradingDataService.formatNumber(pairData.marketCap)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart and Timeframe Selector */}
          <div className="lg:col-span-2">
            <div className="app-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="app-heading-md">Price Chart</h2>
                <div className="flex items-center space-x-2">
                  {(['5m', '15m', '1h', '4h', '1d'] as const).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setSelectedTimeframe(tf)}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                        selectedTimeframe === tf
                          ? 'bg-blue-500 text-white'
                          : 'app-bg-secondary app-text-muted hover:app-bg-tertiary'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart Placeholder */}
              <div className="h-80 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Interactive Chart</h3>
                  <p className="text-gray-500 mb-4">
                    OHLCV data loaded: {ohlcvData.length} candles
                  </p>
                  <div className="text-sm text-gray-400">
                    Chart integration with TradingView, Chart.js, or similar library would go here
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Token Information */}
            <div className="app-card p-6">
              <h3 className="app-heading-sm mb-4">Token Information</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="app-text-muted text-sm">Contract Address</span>
                    <button
                      onClick={() => copyToClipboard(pairData.baseToken.address, 'token')}
                      className="flex items-center space-x-1 text-blue-500 hover:text-blue-600"
                    >
                      {copiedAddress === 'token' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="app-text-primary text-sm font-mono">
                    {pairData.baseToken.address.slice(0, 6)}...{pairData.baseToken.address.slice(-4)}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <span className="app-text-muted text-sm">Pair Address</span>
                    <button
                      onClick={() => copyToClipboard(pairData.pairAddress, 'pair')}
                      className="flex items-center space-x-1 text-blue-500 hover:text-blue-600"
                    >
                      {copiedAddress === 'pair' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="app-text-primary text-sm font-mono">
                    {pairData.pairAddress.slice(0, 6)}...{pairData.pairAddress.slice(-4)}
                  </div>
                </div>

                {pairData.info?.websites && (
                  <div>
                    <span className="app-text-muted text-sm">Links</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {pairData.info.websites.map((website, index) => (
                        <a
                          key={index}
                          href={website.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1 text-blue-500 hover:text-blue-600 text-sm"
                        >
                          <Globe className="w-3 h-3" />
                          <span>{website.label}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {pairData.info?.socials && (
                  <div>
                    <span className="app-text-muted text-sm">Social</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {pairData.info.socials.map((social, index) => (
                        <a
                          key={index}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1 text-blue-500 hover:text-blue-600 text-sm"
                        >
                          {social.type === 'twitter' && <Twitter className="w-3 h-3" />}
                          {social.type === 'telegram' && <MessageCircle className="w-3 h-3" />}
                          <span className="capitalize">{social.type}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Trading Activity */}
            <div className="app-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="app-heading-sm">Recent Activity</h3>
                <button
                  onClick={() => setShowTrades(!showTrades)}
                  className="flex items-center space-x-1 text-blue-500 hover:text-blue-600"
                >
                  <Eye className="w-4 h-4" />
                  {showTrades ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {showTrades && (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {recentTrades.length > 0 ? (
                    recentTrades.slice(0, 10).map((trade, index) => (
                      <div key={index} className="flex items-center justify-between p-3 app-bg-secondary rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${trade.type === 'buy' ? 'bg-green-500' : 'bg-red-500'}`} />
                          <div>
                            <div className="text-sm font-medium app-text-primary">
                              {trade.type.toUpperCase()}
                            </div>
                            <div className="text-xs app-text-muted">
                              {formatTimeAgo(trade.timestamp)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium app-text-primary">
                            ${tradingDataService.formatNumber(trade.amountUsd)}
                          </div>
                          <div className="text-xs app-text-muted">
                            {tradingDataService.formatPrice(trade.price)}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="app-text-muted text-sm">No recent trades available</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Trending Pairs */}
            {trendingPairs.length > 0 && (
              <div className="app-card p-6">
                <h3 className="app-heading-sm mb-4">Trending on {chainId?.toUpperCase()}</h3>
                <div className="space-y-3">
                  {trendingPairs.slice(0, 5).map((pair, index) => (
                    <div key={pair.pairAddress} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-xs app-text-muted w-4">{index + 1}</span>
                        <div>
                          <div className="text-sm font-medium app-text-primary">
                            {pair.baseToken.symbol}/{pair.quoteToken.symbol}
                          </div>
                          <div className="text-xs app-text-muted">{pair.dexId}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium app-text-primary">
                          ${tradingDataService.formatPrice(pair.priceUsd)}
                        </div>
                        <div className={`text-xs ${getPriceChangeColor(pair.priceChange24h)}`}>
                          {tradingDataService.formatPercentage(pair.priceChange24h)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingView;