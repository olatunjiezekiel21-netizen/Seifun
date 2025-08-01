import React from 'react';
import LocalAIChat from '../components/LocalAIChat';
import { Brain, Zap, Shield, MessageCircle } from 'lucide-react';

const AIChat: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center">
              <Brain size={32} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Sei AI Assistant</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your local, privacy-first AI companion for navigating the Sei ecosystem. 
            Get instant insights on tokens, trading strategies, and DeFi opportunities.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
              <Shield size={24} className="text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Privacy First</h3>
            <p className="text-gray-600">
              All processing happens locally. No data is sent to external servers, ensuring your privacy and security.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Zap size={24} className="text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Responses</h3>
            <p className="text-gray-600">
              Get immediate answers about token analysis, trading strategies, and Sei network insights.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <MessageCircle size={24} className="text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Contextual Help</h3>
            <p className="text-gray-600">
              Specialized knowledge about Sei ecosystem, DeFi protocols, and risk assessment strategies.
            </p>
          </div>
        </div>

        {/* AI Chat Interface */}
        <div className="max-w-4xl mx-auto">
          <LocalAIChat />
        </div>

        {/* Tips */}
        <div className="max-w-4xl mx-auto mt-12">
          <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-2xl p-8 border border-red-200">
            <h3 className="text-xl font-semibold text-red-900 mb-4 flex items-center">
              <Brain size={20} className="mr-2" />
              Tips for Better Conversations
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-red-800 mb-2">Ask About:</h4>
                <ul className="text-red-700 space-y-1 text-sm">
                  <li>• Token safety analysis</li>
                  <li>• Trading strategies and risk management</li>
                  <li>• Sei network features and benefits</li>
                  <li>• Wallet setup and configuration</li>
                  <li>• DeFi protocols and opportunities</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-red-800 mb-2">Example Questions:</h4>
                <ul className="text-red-700 space-y-1 text-sm">
                  <li>• "How do I analyze CHIPS token safety?"</li>
                  <li>• "What are the risks of trading meme coins?"</li>
                  <li>• "How do I connect MetaMask to Sei?"</li>
                  <li>• "What makes Sei different from other blockchains?"</li>
                  <li>• "How do I spot rug pulls and scams?"</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;