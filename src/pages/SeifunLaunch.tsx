import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, TrendingUp, TrendingDown, Star, Eye, Users, DollarSign, BarChart2 } from 'lucide-react';
import MemeTokenGrid from '../components/MemeTokenGrid';
import { tradingDataService, TokenPair, OHLCVData } from '../utils/tradingDataService';
import { createChart, IChartApi, ISeriesApi } from 'lightweight-charts';

const SeifunLaunch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pairs, setPairs] = useState<TokenPair[]>([]);
  const [selectedPair, setSelectedPair] = useState<TokenPair | null>(null);
  const [ohlcv, setOhlcv] = useState<OHLCVData[]>([]);
  const [timeframe, setTimeframe] = useState<'5m' | '15m' | '1h' | '4h' | '1d'>('15m');

  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  const categories = [
    { id: 'all', name: 'All Tokens', icon: Star },
    { id: 'trending', name: 'Trending', icon: TrendingUp },
    { id: 'new', name: 'New Launches', icon: Eye },
    { id: 'top', name: 'Top Performers', icon: DollarSign },
    { id: 'community', name: 'Community', icon: Users },
  ];

  // Fetch trending pairs for Sei network via serverless (more reliable in browsers)
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch('/.netlify/functions/seifun-trending?limit=30');
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json() as { pairs?: any[] };
        const list = (data.pairs || []) as unknown as TokenPair[];
        if (!isMounted) return;
        setPairs(list);
        if (list.length && !selectedPair) setSelectedPair(list[0]);
      } catch (e: any) {
        if (!isMounted) return;
        setError('Failed to load trending tokens');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  // Load OHLCV when pair or timeframe changes
  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (!selectedPair) return;
      try {
        const data = await tradingDataService.getOHLCVData('sei', selectedPair.pairAddress, timeframe, 96);
        if (!isMounted) return;
        setOhlcv(data);
      } catch (e) {
        if (!isMounted) return;
        setOhlcv([]);
      }
    })();
    return () => { isMounted = false; };
  }, [selectedPair, timeframe]);

  // Initialize/update chart
  useEffect(() => {
    if (!chartContainerRef.current) return;
    if (!chartRef.current) {
      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 280,
        layout: { background: { color: 'transparent' }, textColor: '#94a3b8' },
        grid: { vertLines: { color: 'rgba(148,163,184,0.1)' }, horzLines: { color: 'rgba(148,163,184,0.1)' } },
        timeScale: { borderColor: 'rgba(148,163,184,0.2)' },
        rightPriceScale: { borderColor: 'rgba(148,163,184,0.2)' }
      });
      chartRef.current = chart;
      const series = chart.addCandlestickSeries({
        upColor: '#22c55e', downColor: '#ef4444', borderDownColor: '#ef4444', borderUpColor: '#22c55e', wickDownColor: '#ef4444', wickUpColor: '#22c55e'
      });
      seriesRef.current = series;
      const handleResize = () => {
        if (!chartContainerRef.current || !chartRef.current) return;
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      };
      window.addEventListener('resize', handleResize);
    }
    if (seriesRef.current && ohlcv.length) {
      seriesRef.current.setData(ohlcv.map(c => ({ time: Math.floor(c.timestamp / 1000), open: c.open, high: c.high, low: c.low, close: c.close })));
      chartRef.current?.timeScale().fitContent();
    }
  }, [ohlcv]);

  const filteredPairs = useMemo(() => {
    return pairs.filter(pair => {
      const base = `${pair.baseToken.name} ${pair.baseToken.symbol}`.toLowerCase();
      const quote = `${pair.quoteToken.name} ${pair.quoteToken.symbol}`.toLowerCase();
      const matchesSearch = !searchTerm || base.includes(searchTerm.toLowerCase()) || quote.includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || 
        (selectedCategory === 'trending' && (Math.abs(pair.priceChange24h) >= 10 || pair.volume24h >= 100000)) ||
        (selectedCategory === 'top' && pair.liquidity.usd > 1_000_000);
      return matchesSearch && matchesCategory;
    });
  }, [pairs, searchTerm, selectedCategory]);

  return (
    <div className="app-bg-primary min-h-screen">
      {/* Header */}
      <div className="app-bg-secondary border-b app-border">
        <div className="app-container py-8">
          <h1 className="app-heading-xl app-text-primary mb-4">
            Seifun.launch
          </h1>
          <p className="app-text-lg max-w-3xl">
            Discover the latest and most promising tokens on the Sei blockchain. 
            Launch your own token or invest in emerging projects with confidence.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="app-container py-8">
        {/* Search Bar */}
        <div className="app-search-bar">
          <Search className="app-search-icon" />
          <input
            type="text"
            placeholder="Search tokens or pairs..."
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

        {/* Empty fetch hint */}
        {!isLoading && !error && pairs.length === 0 && (
          <div className="text-center py-12">
            <div className="app-text-secondary mb-2">No trending data yet.</div>
            <div className="text-sm app-text-muted">If this stays blank, your Netlify functions may be blocked from external APIs. We added a serverless endpoint `/.netlify/functions/seifun-trending`—ensure your site has outbound access.</div>
          </div>
        )}

        {/* Content */}
        {!isLoading && !error && filteredPairs.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pairs List */}
            <div className="lg:col-span-2">
              <div className="app-token-grid">
                {filteredPairs.map((pair) => (
                  <button
                    key={pair.pairAddress}
                    className={`app-token-card text-left ${selectedPair?.pairAddress === pair.pairAddress ? 'ring-1 ring-blue-500' : ''}`}
                    onClick={() => setSelectedPair(pair)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                          <BarChart2 className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold app-text-primary">{pair.baseToken.symbol}/{pair.quoteToken.symbol}</h3>
                            <span className={`text-xs px-2 py-1 rounded ${pair.priceChange24h >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                              {pair.priceChange24h >= 0 ? '+' : ''}{pair.priceChange24h.toFixed(2)}%
                            </span>
                          </div>
                          <p className="text-sm app-text-muted">{pair.baseToken.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold app-text-primary">${tradingDataService.formatPrice(pair.priceUsd)}</div>
                        <div className="text-xs app-text-muted">Liquidity ${tradingDataService.formatNumber(pair.liquidity.usd)}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div>
                        <div className="app-text-muted">Vol 24h</div>
                        <div className="app-text-primary">${tradingDataService.formatNumber(pair.volume24h)}</div>
                      </div>
                      <div>
                        <div className="app-text-muted">Tx 24h</div>
                        <div className="app-text-primary">B {pair.txns.h24.buys} / S {pair.txns.h24.sells}</div>
                      </div>
                      <div>
                        <div className="app-text-muted">FDV</div>
                        <div className="app-text-primary">{pair.fdv ? `$${tradingDataService.formatNumber(pair.fdv)}` : '—'}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chart + Details */}
            <div className="lg:col-span-1">
              <div className="app-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold app-text-primary">{selectedPair ? `${selectedPair.baseToken.symbol}/${selectedPair.quoteToken.symbol}` : 'Select a pair'}</div>
                    <div className="text-xs app-text-muted">{selectedPair?.dexId || ''}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {(['5m','15m','1h','4h','1d'] as const).map(tf => (
                      <button key={tf} onClick={() => setTimeframe(tf)} className={`text-xs px-2 py-1 rounded ${timeframe === tf ? 'bg-blue-600 text-white' : 'bg-slate-800 app-text-muted'}`}>
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>
                <div ref={chartContainerRef} className="w-full" />
                {selectedPair && (
                  <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="app-text-muted">Price</div>
                      <div className="app-text-primary">${tradingDataService.formatPrice(selectedPair.priceUsd)}</div>
                    </div>
                    <div>
                      <div className="app-text-muted">Liquidity</div>
                      <div className="app-text-primary">${tradingDataService.formatNumber(selectedPair.liquidity.usd)}</div>
                    </div>
                    <div>
                      <div className="app-text-muted">Vol 24h</div>
                      <div className="app-text-primary">${tradingDataService.formatNumber(selectedPair.volume24h)}</div>
                    </div>
                    <div>
                      <div className="app-text-muted">Change 24h</div>
                      <div className={`${selectedPair.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>{selectedPair.priceChange24h >= 0 ? '+' : ''}{selectedPair.priceChange24h.toFixed(2)}%</div>
                    </div>
                  </div>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <a href={selectedPair?.url || '#'} target="_blank" rel="noopener" className="app-btn app-btn-secondary text-xs">Open on explorer</a>
                  <a href="/app" className="app-btn app-btn-primary text-xs">Trade via Seilor</a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeifunLaunch;