import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Copy, 
  BarChart3, 
  ArrowUpDown, 
  Shield, 
  Users, 
  Zap,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Globe,
  MessageCircle
} from 'lucide-react';

interface TokenDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: {
    address: string;
    name: string;
    symbol: string;
    price?: string;
    change24h?: string;
    volume24h?: string;
    marketCap?: string;
    safetyScore?: number;
    verified?: boolean;
    description?: string;
    website?: string;
    logoUrl?: string;
    totalSupply?: string;
    holders?: number;
  } | null;
}

const TokenDetailsModal: React.FC<TokenDetailsModalProps> = ({ isOpen, onClose, token }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'swap'>('overview');
  const [copied, setCopied] = useState<string | null>(null);
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState<string>('');
  const [quote, setQuote] = useState<string>('');
  const [processing, setProcessing] = useState<boolean>(false);

  // Factory and dev wallet addresses
  const FACTORY_ADDRESS = '0xfDF1F5dA44B49a3FEf61B160A91B1241f761cf0C';
  const DEV_WALLET = '0x50C0b92b3BC34D7FeD7Da0C48a2F16a636D95C9F';

  if (!isOpen || !token) return null;

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getSafetyColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSafetyBg = (score?: number) => {
    if (!score) return 'bg-gray-100';
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'swap', label: 'Swap', icon: ArrowUpDown }
  ];

  const handleQuote = async () => {
    if (!token) return;
    try {
      setProcessing(true);
      const { seiAgentKit } = await import('../services/SeiAgentKit');
      const tokenTicker = token.address; // pass address; kit resolves addresses
      if (side === 'buy') {
        const q = await seiAgentKit.quote(amount, 'USDC', tokenTicker);
        setQuote(`${q.outputAmount.toFixed(6)} ${token.symbol}`);
      } else {
        const q = await seiAgentKit.quote(amount, tokenTicker, 'USDC');
        setQuote(`${q.outputAmount.toFixed(6)} USDC`);
      }
    } catch (e: any) {
      setQuote(`Quote failed: ${e.message || 'Error'}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleSwap = async () => {
    if (!token) return;
    try {
      setProcessing(true);
      const { seiAgentKit } = await import('../services/SeiAgentKit');
      const tokenTicker = token.address;
      let res: any;
      if (side === 'buy') {
        res = await seiAgentKit.swap(amount, 'USDC', tokenTicker);
      } else {
        res = await seiAgentKit.swap(amount, tokenTicker, 'USDC');
      }
      alert(typeof res === 'string' ? res : 'Swap executed');
    } catch (e: any) {
      alert(`Swap failed: ${e.message || 'Error'}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              {token.logoUrl ? (
                <img src={token.logoUrl} alt={token.symbol} className="w-8 h-8 rounded-full" />
              ) : (
                <span className="text-xl">{token.symbol.charAt(0)}</span>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{token.name}</h2>
              <p className="text-gray-600">{token.symbol}</p>
            </div>
            {token.verified && (
              <CheckCircle className="w-6 h-6 text-blue-500" />
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Price</div>
                  <div className="text-lg font-bold">{token.price || 'N/A'}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">24h Change</div>
                  <div className={`text-lg font-bold ${
                    token.change24h?.includes('+') ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {token.change24h || 'N/A'}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Volume 24h</div>
                  <div className="text-lg font-bold">{token.volume24h || 'N/A'}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Market Cap</div>
                  <div className="text-lg font-bold">{token.marketCap || 'N/A'}</div>
                </div>
              </div>

              {/* Safety Score */}
              {token.safetyScore && (
                <div className={`${getSafetyBg(token.safetyScore)} rounded-lg p-4`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className={`w-5 h-5 ${getSafetyColor(token.safetyScore)}`} />
                      <span className="font-medium">Safety Score</span>
                    </div>
                    <span className={`text-2xl font-bold ${getSafetyColor(token.safetyScore)}`}>
                      {token.safetyScore}/100
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    {token.safetyScore >= 80 && 'Very Safe - Low risk for trading'}
                    {token.safetyScore >= 60 && token.safetyScore < 80 && 'Moderately Safe - Medium risk'}
                    {token.safetyScore < 60 && 'High Risk - Exercise caution'}
                  </div>
                </div>
              )}

              {/* Contract Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contract Information</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">Token Contract</div>
                      <div className="text-sm text-gray-600 font-mono">{token.address}</div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(token.address, 'token')}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      {copied === 'token' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">Factory Contract</div>
                      <div className="text-sm text-gray-600 font-mono">{FACTORY_ADDRESS}</div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(FACTORY_ADDRESS, 'factory')}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      {copied === 'factory' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">Dev Wallet</div>
                      <div className="text-sm text-gray-600 font-mono">{DEV_WALLET}</div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(DEV_WALLET, 'dev')}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      {copied === 'dev' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              {token.description && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-gray-600">{token.description}</p>
                </div>
              )}

              {/* Links */}
              <div className="flex gap-4">
                {token.website && (
                  <a
                    href={token.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    Website
                  </a>
                )}
                <a
                  href={`https://seitrace.com/address/${token.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on Explorer
                </a>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Advanced Analytics</h3>
                <p className="text-gray-600 mb-6">
                  Comprehensive token analytics including price history, volume analysis, and holder distribution.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Zap className="w-5 h-5" />
                    <span className="font-medium">Coming Soon</span>
                  </div>
                  <p className="text-blue-600 text-sm mt-1">
                    Advanced charting and analytics features are being developed.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'swap' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 app-bg-tertiary rounded-xl border app-border p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <button onClick={() => setSide('buy')} className={`px-3 py-1 rounded ${side==='buy'?'bg-green-600 text-white':'bg-gray-200 text-gray-800'}`}>Buy</button>
                    <button onClick={() => setSide('sell')} className={`px-3 py-1 rounded ${side==='sell'?'bg-red-600 text-white':'bg-gray-200 text-gray-800'}`}>Sell</button>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <input value={amount} onChange={(e)=>setAmount(e.target.value)} type="number" placeholder={side==='buy'?'Amount USDC':'Amount '+token.symbol} className="flex-1 border rounded px-3 py-2" />
                    <button disabled={!amount || processing} onClick={handleQuote} className="px-3 py-2 bg-slate-800 text-white rounded">Quote</button>
                    <button disabled={!amount || processing} onClick={handleSwap} className="px-3 py-2 bg-blue-600 text-white rounded">Swap</button>
                  </div>
                  <div className="text-sm text-gray-600 min-h-[24px]">{quote}</div>
                  {processing && <div className="text-xs text-gray-500 mt-2">Processing...</div>}
                </div>
                <div className="app-bg-tertiary rounded-xl border app-border p-4">
                  <div className="font-medium mb-2">Manage</div>
                  <div className="space-y-2">
                    <a href={`/app/dev-plus?token=${token.address}`} className="block text-blue-600 hover:underline text-sm">Add Liquidity on Dev++</a>
                    <a href={`/app/dev-plus?token=${token.address}&action=burn`} className="block text-red-600 hover:underline text-sm">Burn Tokens on Dev++</a>
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-yellow-700">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">Note</span>
                </div>
                <p className="text-yellow-600 text-sm mt-1">
                  Swaps use available DEX liquidity. For tokens without a pool yet, add liquidity first in Dev++.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Always verify contract addresses and do your own research before trading.
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenDetailsModal;