import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Sparkles, 
  Rocket, 
  BarChart3, 
  Bot,
  FileText,
  Code,
  ExternalLink,
  ArrowRight,
  Zap
} from 'lucide-react';

const AppDashboard = () => {
  const features = [
    {
      id: 'safechecker',
      title: 'SafeChecker',
      description: 'Advanced token analysis and security scanning for Sei blockchain',
      icon: Shield,
      path: '/app/safechecker',
      color: 'from-green-500 to-emerald-600',
      status: 'Live'
    },
    {
      id: 'seilor',
      title: 'Seilor 0',
      description: 'AI-powered Sei ecosystem navigator with real-time analysis',
      icon: Bot,
      path: '/app/seilor',
      color: 'from-red-500 to-pink-600',
      status: 'Beta'
    },
    {
      id: 'launch',
      title: 'Token Launchpad',
      description: 'Create and launch tokens safely on the Sei blockchain',
      icon: Rocket,
      path: '/app/seifun-launch',
      color: 'from-blue-500 to-cyan-600',
      status: 'Live'
    },
    {
      id: 'seilist',
      title: 'SeiList',
      description: 'Comprehensive token registry and listing platform',
      icon: FileText,
      path: '/app/seilist',
      color: 'from-purple-500 to-violet-600',
      status: 'Live'
    },
    {
      id: 'trading',
      title: 'Trading Tools',
      description: 'Advanced trading interface with real-time charts',
      icon: BarChart3,
      path: '/app/trading/1329/search',
      color: 'from-orange-500 to-red-600',
      status: 'Live'
    },
    {
      id: 'docs',
      title: 'Documentation',
      description: 'Complete developer guides and API documentation',
      icon: FileText,
      path: '/app/docs',
      color: 'from-slate-500 to-gray-600',
      status: 'Live'
    }
  ];

  const stats = [
    { label: 'Tokens Analyzed', value: '10,000+', color: 'text-green-400' },
    { label: 'Security Scans', value: '25,000+', color: 'text-blue-400' },
    { label: 'Active Users', value: '5,000+', color: 'text-purple-400' },
    { label: 'Sei dApps Listed', value: '50+', color: 'text-red-400' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-blue-500/10"></div>
        <div className="relative app-container py-16">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
              Welcome to Seifun
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              The ultimate platform for safe token creation, analysis, and trading on the Sei blockchain. 
              Powered by advanced AI and real-time blockchain data.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">All Systems Operational</span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full">
                <Zap className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 text-sm font-medium">Sei Network</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                  <div className={`text-3xl font-bold ${stat.color} mb-2`}>
                    {stat.value}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="app-container pb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Explore Seifun Features</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Discover our comprehensive suite of tools designed for the Sei blockchain ecosystem
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Link
              key={feature.id}
              to={feature.path}
              className="group block"
            >
              <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50 hover:border-red-500/50 transition-all duration-300 hover:transform hover:scale-105 h-full">
                <div className="flex items-start justify-between mb-6">
                  <div className={`p-4 bg-gradient-to-br ${feature.color} rounded-xl`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      feature.status === 'Live' 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    }`}>
                      {feature.status}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-red-400 transition-colors" />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-red-400 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-white mb-8">Quick Actions</h3>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              to="/app/safechecker"
              className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <Shield className="w-5 h-5" />
              <span>Analyze Token</span>
            </Link>
            
            <Link
              to="/app/seilor"
              className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <Bot className="w-5 h-5" />
              <span>AI Navigator</span>
            </Link>
            
            <Link
              to="/app/seifun-launch"
              className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <Rocket className="w-5 h-5" />
              <span>Launch Token</span>
            </Link>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-16 text-center">
          <div className="bg-slate-800/30 rounded-2xl p-8 border border-slate-700/30">
            <h4 className="text-lg font-semibold text-white mb-3">Need Help?</h4>
            <p className="text-gray-400 mb-4">
              Check out our documentation or join our community for support
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Link
                to="/app/docs"
                className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Documentation</span>
              </Link>
              <a
                href="https://discord.gg/seifun"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Discord</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppDashboard;