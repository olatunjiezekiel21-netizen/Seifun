import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Zap, TrendingUp, Shield, AlertCircle, CheckCircle } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'info' | 'warning' | 'success' | 'analysis';
}

interface AIResponse {
  text: string;
  type?: 'info' | 'warning' | 'success' | 'analysis';
}

const LocalAIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your local Sei AI assistant. I can help you with token analysis, trading strategies, and Sei ecosystem insights. What would you like to know?',
      isUser: false,
      timestamp: new Date(),
      type: 'info'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Local AI knowledge base and response generation
  const generateAIResponse = (userInput: string): AIResponse => {
    const input = userInput.toLowerCase();
    
    // Token analysis patterns
    if (input.includes('token') && (input.includes('safe') || input.includes('analyze') || input.includes('check'))) {
      return {
        text: 'For token safety analysis, I recommend checking: 1) Holder distribution (avoid >50% concentration), 2) Contract verification status, 3) Liquidity depth, 4) Trading fees (<10%), and 5) Ownership renunciation. Use our Token Scanner for comprehensive analysis.',
        type: 'analysis'
      };
    }
    
    if (input.includes('chips') || input.includes('0xbd82f3bfe1df0c84faec88a22ebc34c9a86595dc')) {
      return {
        text: 'CHIPS is a popular meme token on Sei Network. It has good liquidity and holder distribution. Always verify current metrics before trading. Current supply: ~933M tokens with 6 decimals.',
        type: 'info'
      };
    }
    
    if (input.includes('milli') || input.includes('0x95597eb8d227a7c4b4f5e807a815c5178ee6dbe1')) {
      return {
        text: 'MILLI is a token on Sei Network with 6 decimals and ~299B total supply. It has enhanced security features that prevent zero-address balance queries. Always use our scanner for latest analysis.',
        type: 'info'
      };
    }
    
    // Trading strategy patterns
    if (input.includes('trading') || input.includes('strategy') || input.includes('buy') || input.includes('sell')) {
      return {
        text: 'Key trading principles: 1) Never invest more than you can afford to lose, 2) Always DYOR (Do Your Own Research), 3) Check liquidity before large trades, 4) Monitor holder concentration, 5) Set stop-losses. Consider DCA for volatile assets.',
        type: 'warning'
      };
    }
    
    // Sei ecosystem patterns
    if (input.includes('sei') && (input.includes('network') || input.includes('ecosystem') || input.includes('blockchain'))) {
      return {
        text: 'Sei is a high-performance blockchain optimized for trading. Key features: 1) Sub-second finality, 2) Built-in orderbook, 3) EVM compatibility, 4) Low fees, 5) MEV protection. Native token: SEI. Great for DeFi and trading applications.',
        type: 'success'
      };
    }
    
    // Wallet and connection patterns
    if (input.includes('wallet') || input.includes('connect') || input.includes('metamask') || input.includes('keplr')) {
      return {
        text: 'Supported wallets for Sei: 1) Sei Wallet (native), 2) Compass Wallet, 3) Keplr, 4) MetaMask (with custom RPC). For best experience, use Sei Wallet or Compass. Add Sei Mainnet: Chain ID 1329, RPC: https://evm-rpc.sei-apis.com',
        type: 'info'
      };
    }
    
    // SeiList patterns
    if (input.includes('launch') || input.includes('create token') || input.includes('deploy') || input.includes('list') || input.includes('seilist')) {
      return {
        text: 'SeiList allows easy token creation and listing on Sei Network. Features: 1) Create & List new tokens, 2) List existing tokens with ownership verification, 3) Automatic security scanning, 4) Built-in safety checks. All tokens are ERC20 compatible and tradeable immediately.',
        type: 'success'
      };
    }
    
    // Risk and safety patterns
    if (input.includes('risk') || input.includes('scam') || input.includes('rug') || input.includes('honeypot')) {
      return {
        text: 'Red flags to watch: 1) >50% holder concentration, 2) Unverified contracts, 3) No liquidity locks, 4) High trading fees (>10%), 5) Anonymous teams, 6) Unrealistic promises. Always use multiple analysis tools!',
        type: 'warning'
      };
    }
    
    // Price and market patterns
    if (input.includes('price') || input.includes('market') || input.includes('cap') || input.includes('volume')) {
      return {
        text: 'For accurate price data, check: 1) SeiTrace explorer, 2) DEX aggregators, 3) Our Token Pulse feature, 4) Multiple sources for verification. Market cap = Price × Circulating Supply. Volume indicates trading activity.',
        type: 'analysis'
      };
    }
    
    // General help patterns
    if (input.includes('help') || input.includes('how') || input.includes('what') || input.includes('explain')) {
      return {
        text: 'I can help with: 🔍 Token analysis, 📊 Trading strategies, 🌐 Sei ecosystem info, 💰 DeFi guidance, 🚀 SeiList assistance, ⚠️ Risk assessment, 💼 Wallet setup. What specific topic interests you?',
        type: 'info'
      };
    }
    
    // Greeting patterns
    if (input.includes('hello') || input.includes('hi') || input.includes('hey') || input.includes('good')) {
      return {
        text: 'Hello! Great to see you exploring the Sei ecosystem. I\'m here to help you navigate tokens, trading, and DeFi safely. What would you like to learn about today?',
        type: 'success'
      };
    }
    
    // Default response with context awareness
    const responses = [
      'That\'s an interesting question about the Sei ecosystem. Could you be more specific? I can help with token analysis, trading strategies, or technical questions.',
      'I\'d love to help you with that! For the best assistance, try asking about specific tokens, trading concepts, or Sei network features.',
      'Great question! I specialize in Sei network insights, token safety analysis, and DeFi guidance. What specific aspect would you like to explore?',
      'I\'m here to help with your Sei journey! Whether it\'s about tokens, trading, or the ecosystem, feel free to ask more specific questions.',
    ];
    
    return {
      text: responses[Math.floor(Math.random() * responses.length)],
      type: 'info'
    };
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputText);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse.text,
        isUser: false,
        timestamp: new Date(),
        type: aiResponse.type
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1500); // 1-2.5s delay for realism
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getMessageIcon = (type?: string) => {
    switch (type) {
      case 'analysis':
        return <TrendingUp size={16} className="text-blue-400" />;
      case 'warning':
        return <AlertCircle size={16} className="text-yellow-400" />;
      case 'success':
        return <CheckCircle size={16} className="text-green-400" />;
      case 'info':
      default:
        return <Shield size={16} className="text-blue-400" />;
    }
  };

  const getMessageBorderColor = (type?: string) => {
    switch (type) {
      case 'analysis':
        return 'border-l-blue-400';
      case 'warning':
        return 'border-l-yellow-400';
      case 'success':
        return 'border-l-green-400';
      case 'info':
      default:
        return 'border-l-blue-400';
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 flex items-center space-x-3">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <Bot size={20} />
        </div>
        <div>
          <h3 className="font-semibold">Sei AI Assistant</h3>
          <p className="text-sm text-red-100">Local • Privacy-First • Real-time</p>
        </div>
        <div className="ml-auto">
          <Zap size={16} className="text-yellow-300" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] ${
                message.isUser
                  ? 'bg-red-500 text-white rounded-l-2xl rounded-tr-2xl'
                  : `bg-gray-50 text-gray-800 rounded-r-2xl rounded-tl-2xl border-l-4 ${getMessageBorderColor(message.type)}`
              } p-4 shadow-sm`}
            >
              {!message.isUser && (
                <div className="flex items-center space-x-2 mb-2">
                  {getMessageIcon(message.type)}
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {message.type || 'info'}
                  </span>
                </div>
              )}
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
              <div className="flex items-center justify-between mt-2">
                <span className={`text-xs ${message.isUser ? 'text-red-100' : 'text-gray-400'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {message.isUser && <User size={12} className="text-red-200" />}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-50 text-gray-800 rounded-r-2xl rounded-tl-2xl border-l-4 border-l-blue-400 p-4 shadow-sm">
              <div className="flex items-center space-x-2">
                <Bot size={16} className="text-blue-400" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex space-x-3">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about tokens, trading, or the Sei ecosystem..."
            className="flex-1 resize-none border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            rows={1}
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isTyping}
            className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors flex items-center justify-center"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          🔒 Local AI • No data sent to external servers • Privacy protected
        </p>
      </div>
    </div>
  );
};

export default LocalAIChat;