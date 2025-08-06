import React, { useEffect, useState } from 'react';
import { X, ExternalLink, Copy, Star, Sparkles, TrendingUp, Users, DollarSign, Zap } from 'lucide-react';
import { useTokenImage } from '../utils/tokenImageGenerator';

interface TokenSpotlightProps {
  isOpen: boolean;
  onClose: () => void;
  tokenData: {
    name: string;
    symbol: string;
    address: string;
    totalSupply: string;
    decimals: number;
    description?: string;
    website?: string;
    twitter?: string;
    telegram?: string;
    tokenImage?: string; // Optional custom token image
  };
  transactionHash?: string;
}

export const TokenSpotlight: React.FC<TokenSpotlightProps> = ({
  isOpen,
  onClose,
  tokenData,
  transactionHash
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  
  // Generate unique token image
  const generatedTokenImage = useTokenImage(tokenData.symbol, tokenData.name, tokenData.tokenImage);

  // Generate unique token colors based on token symbol
  const generateTokenColors = (symbol: string) => {
    const colors = [
      ['from-blue-500', 'to-purple-600'],
      ['from-green-500', 'to-emerald-600'],
      ['from-purple-500', 'to-pink-600'],
      ['from-orange-500', 'to-red-600'],
      ['from-cyan-500', 'to-blue-600'],
      ['from-indigo-500', 'to-purple-600'],
      ['from-pink-500', 'to-rose-600'],
      ['from-teal-500', 'to-green-600'],
      ['from-yellow-500', 'to-orange-600'],
      ['from-violet-500', 'to-purple-600']
    ];
    
    const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Generate token icon based on symbol and name
  const generateTokenIcon = (symbol: string, name: string) => {
    const [fromColor, toColor] = generateTokenColors(symbol);
    
    if (generatedTokenImage) {
      return (
        <img 
          src={generatedTokenImage} 
          alt={`${name} token`}
          className="w-16 h-16 rounded-full object-cover shadow-lg"
          onError={(e) => {
            // Fallback to generated icon if image fails to load
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }}
        />
      );
    }
    
    return (
      <div className={`w-16 h-16 bg-gradient-to-br ${fromColor} ${toColor} rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg`}>
        {symbol.charAt(0).toUpperCase()}
      </div>
    );
  };

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatSupply = (supply: string) => {
    const num = parseInt(supply);
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 max-w-2xl w-full mx-4 border border-slate-700/50 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-slate-700/50 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-slate-400" />
        </button>

        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mb-4 relative">
            <Sparkles className="w-10 h-10 text-white" />
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full animate-ping opacity-20"></div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Token Created Successfully! 🎉</h1>
          <p className="text-slate-400">Your token is now live on the Sei blockchain</p>
        </div>

        {/* Token Card */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 rounded-2xl p-6 border border-slate-600/50 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              {/* Token Avatar */}
              <div className="relative">
                {generateTokenIcon(tokenData.symbol, tokenData.name)}
                {/* Fallback icon (hidden by default, shown if image fails) */}
                {tokenData.tokenImage && (
                  <div className={`hidden w-16 h-16 bg-gradient-to-br ${generateTokenColors(tokenData.symbol)[0]} ${generateTokenColors(tokenData.symbol)[1]} rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg`}>
                    {tokenData.symbol.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{tokenData.name}</h2>
                <p className="text-xl text-slate-300">${tokenData.symbol}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <span className="text-sm text-slate-400">New Token</span>
            </div>
          </div>

          {/* Token Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-slate-700/30 rounded-xl">
              <DollarSign className="w-6 h-6 text-green-400 mx-auto mb-1" />
              <div className="text-sm text-slate-400">Total Supply</div>
              <div className="font-bold text-white">{formatSupply(tokenData.totalSupply)}</div>
            </div>
            <div className="text-center p-3 bg-slate-700/30 rounded-xl">
              <TrendingUp className="w-6 h-6 text-blue-400 mx-auto mb-1" />
              <div className="text-sm text-slate-400">Decimals</div>
              <div className="font-bold text-white">{tokenData.decimals}</div>
            </div>
            <div className="text-center p-3 bg-slate-700/30 rounded-xl">
              <Users className="w-6 h-6 text-purple-400 mx-auto mb-1" />
              <div className="text-sm text-slate-400">Holders</div>
              <div className="font-bold text-white">1</div>
            </div>
          </div>

          {/* Token Address */}
          <div className="bg-slate-700/20 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400 mb-1">Contract Address</div>
                <div className="font-mono text-white text-sm break-all">{tokenData.address}</div>
              </div>
              <button
                onClick={() => copyToClipboard(tokenData.address)}
                className="p-2 hover:bg-slate-600/50 rounded-lg transition-colors"
                title="Copy address"
              >
                {copiedAddress ? (
                  <div className="text-green-400 text-xs">Copied!</div>
                ) : (
                  <Copy className="w-4 h-4 text-slate-400" />
                )}
              </button>
            </div>
          </div>

          {/* Description */}
          {tokenData.description && (
            <div className="mb-4">
              <div className="text-sm text-slate-400 mb-2">Description</div>
              <p className="text-slate-300 text-sm leading-relaxed">{tokenData.description}</p>
            </div>
          )}
        </div>

        {/* SeiPump Branding */}
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-2xl p-4 border border-blue-500/20 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Powered by SeiPump</h3>
                <p className="text-sm text-slate-400">The premier token launchpad on Sei</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-400 font-medium">Like Pump.fun</div>
              <div className="text-xs text-slate-400">but for Sei Network</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => window.open(`https://seitrace.com/address/${tokenData.address}`, '_blank')}
            className="flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl font-medium transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>View on Explorer</span>
          </button>
          {transactionHash && (
            <button
              onClick={() => window.open(`https://seitrace.com/tx/${transactionHash}`, '_blank')}
              className="flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-xl font-medium transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View Transaction</span>
            </button>
          )}
        </div>

        {/* Social Links */}
        {(tokenData.website || tokenData.twitter || tokenData.telegram) && (
          <div className="border-t border-slate-700/50 pt-6">
            <div className="text-sm text-slate-400 mb-3">Connect with your community</div>
            <div className="flex items-center space-x-3">
              {tokenData.website && (
                <a
                  href={tokenData.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Website</span>
                </a>
              )}
              {tokenData.twitter && (
                <a
                  href={tokenData.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-slate-400 hover:text-blue-400 transition-colors"
                >
                  <span>🐦</span>
                  <span>Twitter</span>
                </a>
              )}
              {tokenData.telegram && (
                <a
                  href={tokenData.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-slate-400 hover:text-blue-400 transition-colors"
                >
                  <span>📱</span>
                  <span>Telegram</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Bottom Message */}
        <div className="text-center mt-6 p-4 bg-gradient-to-r from-green-500/10 to-emerald-600/10 rounded-xl border border-green-500/20">
          <p className="text-green-400 font-medium">🎉 Congratulations! Your token is now live on Sei!</p>
          <p className="text-slate-400 text-sm mt-1">Built with SeiPump - Share it with your community and start pumping! 🚀</p>
        </div>
      </div>
    </div>
  );
};