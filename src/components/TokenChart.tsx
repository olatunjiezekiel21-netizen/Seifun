import React, { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { TrendingUp, TrendingDown, BarChart3, Clock } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TokenChartProps {
  tokenAddress: string;
  tokenSymbol: string;
  className?: string;
}

interface PriceData {
  timestamp: number;
  price: number;
  volume: number;
}

const TokenChart: React.FC<TokenChartProps> = ({ tokenAddress, tokenSymbol, className = '' }) => {
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [timeframe, setTimeframe] = useState<'1H' | '1D' | '7D' | '30D'>('1D');
  const [loading, setLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [priceChange, setPriceChange] = useState<number>(0);

  // Generate realistic price data for demo
  const generatePriceData = (timeframe: string) => {
    const now = Date.now();
    const intervals = {
      '1H': { count: 60, step: 60 * 1000 }, // 1 minute intervals
      '1D': { count: 24, step: 60 * 60 * 1000 }, // 1 hour intervals
      '7D': { count: 168, step: 60 * 60 * 1000 }, // 1 hour intervals
      '30D': { count: 30, step: 24 * 60 * 60 * 1000 } // 1 day intervals
    };

    const { count, step } = intervals[timeframe];
    const basePrice = tokenSymbol === 'CHIPS' ? 0.00234 : 0.00567;
    const data: PriceData[] = [];

    for (let i = count; i >= 0; i--) {
      const timestamp = now - (i * step);
      const volatility = 0.1; // 10% volatility
      const trend = Math.sin(i / 10) * 0.05; // Slight trend
      const random = (Math.random() - 0.5) * volatility;
      const price = basePrice * (1 + trend + random);
      const volume = Math.random() * 100000 + 50000;

      data.push({
        timestamp,
        price: Math.max(price, basePrice * 0.5), // Prevent negative prices
        volume
      });
    }

    return data;
  };

  useEffect(() => {
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const data = generatePriceData(timeframe);
      setPriceData(data);
      
      if (data.length > 0) {
        const latest = data[data.length - 1];
        const previous = data[data.length - 2] || data[data.length - 1];
        setCurrentPrice(latest.price);
        setPriceChange(((latest.price - previous.price) / previous.price) * 100);
      }
      
      setLoading(false);
    }, 500);
  }, [tokenAddress, tokenSymbol, timeframe]);

  const chartData = {
    labels: priceData.map(d => {
      const date = new Date(d.timestamp);
      if (timeframe === '1H') return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      if (timeframe === '1D') return date.toLocaleTimeString('en-US', { hour: '2-digit' });
      if (timeframe === '7D') return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: `${tokenSymbol} Price`,
        data: priceData.map(d => d.price),
        borderColor: priceChange >= 0 ? '#10B981' : '#EF4444',
        backgroundColor: priceChange >= 0 
          ? 'rgba(16, 185, 129, 0.1)' 
          : 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: priceChange >= 0 ? '#10B981' : '#EF4444',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 2,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            return `$${context.parsed.y.toFixed(6)}`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12
          },
          maxTicksLimit: 8
        }
      },
      y: {
        display: true,
        position: 'right' as const,
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12
          },
          callback: function(value: any) {
            return `$${value.toFixed(6)}`;
          }
        }
      }
    },
    interaction: {
      mode: 'index' as const,
      intersect: false
    },
    elements: {
      point: {
        hoverRadius: 8
      }
    }
  };

  const timeframes = [
    { label: '1H', value: '1H' as const },
    { label: '1D', value: '1D' as const },
    { label: '7D', value: '7D' as const },
    { label: '30D', value: '30D' as const }
  ];

  if (loading) {
    return (
      <div className={`bg-white border border-gray-200 rounded-xl p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
            <div className="h-8 bg-gray-200 rounded w-48"></div>
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-gray-600" />
          <div>
            <h3 className="font-semibold text-gray-900">{tokenSymbol} Price Chart</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold text-gray-900">
                ${currentPrice.toFixed(6)}
              </span>
              <div className={`flex items-center gap-1 px-2 py-1 rounded text-sm font-medium ${
                priceChange >= 0 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {priceChange >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {Math.abs(priceChange).toFixed(2)}%
              </div>
            </div>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {timeframes.map((tf) => (
            <button
              key={tf.value}
              onClick={() => setTimeframe(tf.value)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                timeframe === tf.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <Line data={chartData} options={chartOptions} />
      </div>

      {/* Footer Stats */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>Updated just now</span>
        </div>
        <div className="text-sm text-gray-600">
          Volume: ${priceData[priceData.length - 1]?.volume.toLocaleString() || 0}
        </div>
      </div>
    </div>
  );
};

export default TokenChart;