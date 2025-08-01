import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, TrendingUp, AlertTriangle, Shield, Zap } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: number;
  analysis?: {
    sentiment: 'bullish' | 'bearish' | 'neutral';
    confidence: number;
    signals: string[];
  };
}

interface AITraderChatProps {
  className?: string;
}

const AITraderChat: React.FC<AITraderChatProps> = ({ className = '' }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your AI trading assistant. I can help you analyze tokens, identify trends, and provide trading insights. Try asking me about CHIPS or SEIYAN!',
      timestamp: Date.now() - 60000,
      analysis: {
        sentiment: 'neutral',
        confidence: 95,
        signals: ['Market Analysis Ready', 'Real-time Data Connected']
      }
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = (userMessage: string): Message => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Token-specific responses
    if (lowerMessage.includes('chips')) {
      return {
        id: Date.now().toString(),
        type: 'ai',
        content: 'CHIPS is showing strong momentum! Based on my analysis:\n\n📈 **Technical Analysis:**\n- Price up 23.45% in 24h\n- Volume increasing (456K)\n- Strong community support\n\n🎯 **Key Levels:**\n- Support: $0.0019\n- Resistance: $0.0028\n\n⚠️ **Risk Assessment:** Medium risk due to meme token volatility. Consider position sizing carefully.',
        timestamp: Date.now(),
        analysis: {
          sentiment: 'bullish',
          confidence: 78,
          signals: ['Volume Surge', 'Social Sentiment +', 'Technical Breakout']
        }
      };
    }
    
    if (lowerMessage.includes('seiyan')) {
      return {
        id: Date.now().toString(),
        type: 'ai',
        content: 'SEIYAN is on fire! 🔥 Here\'s my analysis:\n\n📊 **Market Data:**\n- Price: $0.00567 (+45.67%)\n- Market Cap: $4.4M\n- 5,678 holders and growing\n\n🚀 **Bullish Indicators:**\n- Breaking key resistance\n- High trading volume\n- Strong anime/meme narrative\n\n💡 **Trading Suggestion:** Consider taking profits at $0.007 and setting stop-loss at $0.0045.',
        timestamp: Date.now(),
        analysis: {
          sentiment: 'bullish',
          confidence: 85,
          signals: ['Price Momentum', 'Volume Spike', 'Narrative Strength']
        }
      };
    }
    
    if (lowerMessage.includes('buy') || lowerMessage.includes('sell')) {
      return {
        id: Date.now().toString(),
        type: 'ai',
        content: 'I can\'t provide direct buy/sell advice, but I can help you analyze the data! 📊\n\n**Before any trade, consider:**\n- Risk tolerance\n- Position sizing (never risk more than 2-5%)\n- Market conditions\n- Token fundamentals\n\nWould you like me to analyze a specific token for you? Just mention the token name!',
        timestamp: Date.now(),
        analysis: {
          sentiment: 'neutral',
          confidence: 90,
          signals: ['Risk Management', 'Due Diligence Required']
        }
      };
    }
    
    if (lowerMessage.includes('risk') || lowerMessage.includes('safe')) {
      return {
        id: Date.now().toString(),
        type: 'ai',
        content: '🛡️ **Safety First!** Here\'s my risk assessment framework:\n\n**Green Flags:**\n✅ Liquidity locked\n✅ Ownership renounced\n✅ Contract verified\n✅ Active community\n\n**Red Flags:**\n❌ High holder concentration\n❌ Unlocked liquidity\n❌ Anonymous team\n❌ No utility/roadmap\n\n**Current Sei Tokens Safety:**\n- CHIPS: 88/100 (Very Safe)\n- SEIYAN: 91/100 (Excellent)',
        timestamp: Date.now(),
        analysis: {
          sentiment: 'neutral',
          confidence: 95,
          signals: ['Safety Analysis', 'Risk Framework', 'Due Diligence']
        }
      };
    }
    
    // Default responses
    const defaultResponses = [
      {
        content: 'Great question! I\'m analyzing the current market conditions. The Sei ecosystem is showing strong growth with increasing TVL and active development. What specific aspect would you like me to dive deeper into?',
        sentiment: 'bullish' as const,
        confidence: 72,
        signals: ['Market Analysis', 'Ecosystem Growth', 'Development Activity']
      },
      {
        content: 'I\'m seeing mixed signals in the current market. While some tokens show strength, others are consolidating. Risk management is key right now. What\'s your trading strategy?',
        sentiment: 'neutral' as const,
        confidence: 68,
        signals: ['Mixed Signals', 'Consolidation Phase', 'Risk Management']
      },
      {
        content: 'The data suggests we\'re in an interesting phase. Volume is picking up across Sei tokens, and social sentiment is improving. Perfect time for careful analysis!',
        sentiment: 'bullish' as const,
        confidence: 75,
        signals: ['Volume Increase', 'Sentiment Improvement', 'Analysis Opportunity']
      }
    ];
    
    const randomResponse = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    
    return {
      id: Date.now().toString(),
      type: 'ai',
      content: randomResponse.content,
      timestamp: Date.now(),
      analysis: {
        sentiment: randomResponse.sentiment,
        confidence: randomResponse.confidence,
        signals: randomResponse.signals
      }
    };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse = generateAIResponse(userMessage.content);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'bearish': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Shield className="w-4 h-4 text-blue-600" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'text-green-600 bg-green-50 border-green-200';
      case 'bearish': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-xl flex flex-col h-96 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-100">
        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">AI Trading Assistant</h3>
          <p className="text-sm text-gray-600">Real-time market analysis</p>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-xs text-gray-600">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
              <div className={`flex items-start gap-2 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0 ${
                  message.type === 'user' 
                    ? 'bg-gray-900' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-600'
                }`}>
                  {message.type === 'user' ? (
                    <User className="w-3 h-3 text-white" />
                  ) : (
                    <Bot className="w-3 h-3 text-white" />
                  )}
                </div>
                
                <div className={`rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-50 text-gray-900'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {message.analysis && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        {getSentimentIcon(message.analysis.sentiment)}
                        <span className={`text-xs font-medium px-2 py-1 rounded border ${getSentimentColor(message.analysis.sentiment)}`}>
                          {message.analysis.sentiment.toUpperCase()} ({message.analysis.confidence}%)
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {message.analysis.signals.map((signal, index) => (
                          <span key={index} className="text-xs bg-white border border-gray-200 rounded px-2 py-1">
                            {signal}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className={`text-xs text-gray-500 mt-1 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start gap-2">
              <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                <Bot className="w-3 h-3 text-white" />
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about token analysis, trends, or trading insights..."
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            disabled={isTyping}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="flex items-center justify-center w-10 h-10 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Zap className="w-3 h-3" />
            <span>Powered by AI</span>
          </div>
          <div className="text-xs text-gray-500">
            Try: "Analyze CHIPS" or "Is SEIYAN safe?"
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITraderChat;