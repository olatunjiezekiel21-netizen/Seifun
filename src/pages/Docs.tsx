import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Shield, 
  Rocket, 
  Bot, 
  Users, 
  Code, 
  Search,
  ChevronRight,
  ExternalLink,
  Zap,
  Lock,
  TrendingUp,
  Star,
  MessageCircle,
  Github,
  Twitter,
  Moon,
  Sun,
  Menu,
  X,
  Copy,
  Check,
  Terminal,
  FileText,
  Settings,
  Layers,
  Database,
  Globe,
  Smartphone,
  Cpu,
  Activity
} from 'lucide-react';

const Docs = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [activeSection, setActiveSection] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Theme classes
  const themeClasses = {
    light: {
      bg: 'bg-white',
      bgSecondary: 'bg-gray-50',
      bgTertiary: 'bg-gray-100',
      text: 'text-gray-900',
      textSecondary: 'text-gray-600',
      textMuted: 'text-gray-500',
      border: 'border-gray-200',
      borderLight: 'border-gray-100',
      card: 'bg-white border border-gray-200 shadow-sm',
      cardHover: 'hover:shadow-md hover:border-gray-300',
      accent: 'text-blue-600',
      accentBg: 'bg-blue-50',
      accentHover: 'hover:bg-blue-100',
      codeBlock: 'bg-gray-900 text-gray-100',
      sidebar: 'bg-gray-50 border-gray-200'
    },
    dark: {
      bg: 'bg-slate-900',
      bgSecondary: 'bg-slate-800',
      bgTertiary: 'bg-slate-700',
      text: 'text-white',
      textSecondary: 'text-slate-300',
      textMuted: 'text-slate-400',
      border: 'border-slate-700',
      borderLight: 'border-slate-600',
      card: 'bg-slate-800/50 border border-slate-700 backdrop-blur-sm',
      cardHover: 'hover:bg-slate-800/70 hover:border-slate-600',
      accent: 'text-red-400',
      accentBg: 'bg-red-500/10',
      accentHover: 'hover:bg-red-500/20',
      codeBlock: 'bg-slate-800 text-slate-100',
      sidebar: 'bg-slate-800/50 border-slate-700'
    }
  };

  const t = themeClasses[theme];

  const navigation = [
    {
      title: 'Getting Started',
      items: [
        { id: 'overview', title: 'Overview', icon: BookOpen },
        { id: 'installation', title: 'Installation', icon: Terminal },
        { id: 'quickstart', title: 'Quick Start', icon: Zap },
        { id: 'authentication', title: 'Authentication', icon: Lock }
      ]
    },
    {
      title: 'Core Features',
      items: [
        { id: 'seilor', title: 'Seilor 0 AI', icon: Bot },
        { id: 'safechecker', title: 'SafeChecker', icon: Shield },
        { id: 'seilist', title: 'SeiList', icon: Rocket },
        { id: 'trading', title: 'Trading Tools', icon: TrendingUp }
      ]
    },
    {
      title: 'API Reference',
      items: [
        { id: 'rest-api', title: 'REST API', icon: Globe },
        { id: 'websocket', title: 'WebSocket', icon: Activity },
        { id: 'sdk', title: 'JavaScript SDK', icon: Code },
        { id: 'mobile', title: 'Mobile SDK', icon: Smartphone }
      ]
    },
    {
      title: 'Advanced',
      items: [
        { id: 'architecture', title: 'Architecture', icon: Layers },
        { id: 'database', title: 'Database Schema', icon: Database },
        { id: 'deployment', title: 'Deployment', icon: Settings },
        { id: 'contributing', title: 'Contributing', icon: Users }
      ]
    }
  ];

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const CodeBlock = ({ code, language, id }: { code: string; language: string; id: string }) => (
    <div className={`relative rounded-lg overflow-hidden ${t.codeBlock} mb-4`}>
      <div className="flex items-center justify-between px-4 py-2 bg-slate-700 border-b border-slate-600">
        <span className="text-sm font-medium text-slate-300">{language}</span>
        <button
          onClick={() => copyToClipboard(code, id)}
          className="flex items-center space-x-1 text-slate-300 hover:text-white transition-colors"
        >
          {copiedCode === id ? <Check size={16} /> : <Copy size={16} />}
          <span className="text-xs">{copiedCode === id ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="text-sm">{code}</code>
      </pre>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-8">
            <div>
              <h1 className={`text-4xl font-bold ${t.text} mb-4`}>Seifun Documentation</h1>
              <p className={`text-xl ${t.textSecondary} leading-relaxed mb-8`}>
                Welcome to Seifun, the ultimate Sei blockchain toolkit. Build, analyze, and trade tokens safely with our comprehensive suite of tools and AI-powered features.
              </p>
            </div>

            <div className={`${t.card} rounded-xl p-6`}>
              <h2 className={`text-2xl font-bold ${t.text} mb-4`}>What is Seifun?</h2>
              <p className={`${t.textSecondary} mb-4`}>
                Seifun is a comprehensive platform that combines advanced token analysis, AI-powered insights, and professional trading tools specifically designed for the Sei blockchain ecosystem.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className={`${t.accentBg} rounded-lg p-4`}>
                  <Shield className={`${t.accent} mb-2`} size={24} />
                  <h3 className={`font-semibold ${t.text} mb-2`}>Security First</h3>
                  <p className={`text-sm ${t.textMuted}`}>Advanced token scanning and honeypot detection</p>
                </div>
                <div className={`${t.accentBg} rounded-lg p-4`}>
                  <Bot className={`${t.accent} mb-2`} size={24} />
                  <h3 className={`font-semibold ${t.text} mb-2`}>AI-Powered</h3>
                  <p className={`text-sm ${t.textMuted}`}>Seilor 0 AI provides intelligent insights</p>
                </div>
                <div className={`${t.accentBg} rounded-lg p-4`}>
                  <Code className={`${t.accent} mb-2`} size={24} />
                  <h3 className={`font-semibold ${t.text} mb-2`}>Developer Tools</h3>
                  <p className={`text-sm ${t.textMuted}`}>Complete SDK and API access</p>
                </div>
              </div>
            </div>

            <div className={`${t.card} rounded-xl p-6`}>
              <h2 className={`text-2xl font-bold ${t.text} mb-4`}>Key Features</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className={`${t.accent} mt-1`}>
                    <ChevronRight size={16} />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${t.text}`}>Seilor 0 AI Assistant</h3>
                    <p className={`${t.textSecondary} text-sm`}>Intelligent AI that provides real-time analysis, dApp discovery, and trading insights</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className={`${t.accent} mt-1`}>
                    <ChevronRight size={16} />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${t.text}`}>SafeChecker Scanner</h3>
                    <p className={`${t.textSecondary} text-sm`}>Advanced token security analysis with real-time risk assessment</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className={`${t.accent} mt-1`}>
                    <ChevronRight size={16} />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${t.text}`}>SeiList Directory</h3>
                    <p className={`${t.textSecondary} text-sm`}>Curated list of verified tokens and projects on Sei blockchain</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className={`${t.accent} mt-1`}>
                    <ChevronRight size={16} />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${t.text}`}>Professional Trading Tools</h3>
                    <p className={`${t.textSecondary} text-sm`}>Advanced charts, analytics, and portfolio management</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'installation':
        return (
          <div className="space-y-8">
            <div>
              <h1 className={`text-4xl font-bold ${t.text} mb-4`}>Installation</h1>
              <p className={`text-xl ${t.textSecondary} leading-relaxed mb-8`}>
                Get started with Seifun by installing our SDK or using our web interface directly.
              </p>
            </div>

            <div className={`${t.card} rounded-xl p-6`}>
              <h2 className={`text-2xl font-bold ${t.text} mb-4`}>Web Interface</h2>
              <p className={`${t.textSecondary} mb-4`}>
                The easiest way to get started is by using our web interface directly at:
              </p>
              <div className={`${t.accentBg} rounded-lg p-4 mb-4`}>
                <a href="https://seifun.netlify.app" className={`${t.accent} font-mono font-semibold`}>
                  https://seifun.netlify.app
                </a>
              </div>
            </div>

            <div className={`${t.card} rounded-xl p-6`}>
              <h2 className={`text-2xl font-bold ${t.text} mb-4`}>JavaScript SDK</h2>
              <p className={`${t.textSecondary} mb-4`}>
                Install the Seifun SDK for programmatic access to our features:
              </p>
              <CodeBlock
                code={`npm install @seifun/sdk

# or with yarn
yarn add @seifun/sdk

# or with pnpm
pnpm add @seifun/sdk`}
                language="bash"
                id="install-sdk"
              />
            </div>

            <div className={`${t.card} rounded-xl p-6`}>
              <h2 className={`text-2xl font-bold ${t.text} mb-4`}>Requirements</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${t.accent.replace('text-', 'bg-')}`}></div>
                  <span className={t.textSecondary}>Node.js 16.0 or higher</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${t.accent.replace('text-', 'bg-')}`}></div>
                  <span className={t.textSecondary}>Modern web browser with Web3 support</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${t.accent.replace('text-', 'bg-')}`}></div>
                  <span className={t.textSecondary}>Sei-compatible wallet (MetaMask, Keplr, etc.)</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'quickstart':
        return (
          <div className="space-y-8">
            <div>
              <h1 className={`text-4xl font-bold ${t.text} mb-4`}>Quick Start</h1>
              <p className={`text-xl ${t.textSecondary} leading-relaxed mb-8`}>
                Get up and running with Seifun in minutes.
              </p>
            </div>

            <div className={`${t.card} rounded-xl p-6`}>
              <h2 className={`text-2xl font-bold ${t.text} mb-4`}>Basic Usage</h2>
              <p className={`${t.textSecondary} mb-4`}>
                Here's how to get started with the Seifun SDK:
              </p>
              <CodeBlock
                code={`import { SeifunClient } from '@seifun/sdk';

// Initialize the client
const seifun = new SeifunClient({
  network: 'sei-mainnet', // or 'sei-testnet'
  apiKey: 'your-api-key' // optional for public endpoints
});

// Scan a token for security issues
const scanResult = await seifun.safechecker.scanToken({
  address: '0x1234567890abcdef1234567890abcdef12345678'
});

console.log('Security Score:', scanResult.securityScore);
console.log('Risk Level:', scanResult.riskLevel);

// Get AI insights from Seilor 0
const insights = await seifun.seilor.getInsights({
  query: 'What are the trending tokens on Sei?'
});

console.log('AI Response:', insights.response);`}
                language="javascript"
                id="basic-usage"
              />
            </div>

            <div className={`${t.card} rounded-xl p-6`}>
              <h2 className={`text-2xl font-bold ${t.text} mb-4`}>Next Steps</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className={`${t.bgSecondary} rounded-lg p-4`}>
                  <Bot className={`${t.accent} mb-2`} size={24} />
                  <h3 className={`font-semibold ${t.text} mb-2`}>Explore Seilor 0 AI</h3>
                  <p className={`text-sm ${t.textMuted} mb-3`}>Learn how to integrate AI-powered insights</p>
                  <button className={`text-sm ${t.accent} hover:underline`}>
                    View Seilor 0 Docs →
                  </button>
                </div>
                <div className={`${t.bgSecondary} rounded-lg p-4`}>
                  <Shield className={`${t.accent} mb-2`} size={24} />
                  <h3 className={`font-semibold ${t.text} mb-2`}>SafeChecker API</h3>
                  <p className={`text-sm ${t.textMuted} mb-3`}>Integrate token security scanning</p>
                  <button className={`text-sm ${t.accent} hover:underline`}>
                    View SafeChecker Docs →
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'seilor':
        return (
          <div className="space-y-8">
            <div>
              <h1 className={`text-4xl font-bold ${t.text} mb-4`}>Seilor 0 AI</h1>
              <p className={`text-xl ${t.textSecondary} leading-relaxed mb-8`}>
                Seilor 0 is our advanced AI assistant that provides intelligent insights, dApp discovery, and real-time analysis of the Sei ecosystem.
              </p>
            </div>

            <div className={`${t.card} rounded-xl p-6`}>
              <h2 className={`text-2xl font-bold ${t.text} mb-4`}>Features</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Bot className={`${t.accent} mt-1`} size={20} />
                  <div>
                    <h3 className={`font-semibold ${t.text}`}>Intelligent Analysis</h3>
                    <p className={`${t.textSecondary} text-sm`}>AI-powered token analysis and market insights</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Globe className={`${t.accent} mt-1`} size={20} />
                  <div>
                    <h3 className={`font-semibold ${t.text}`}>dApp Discovery</h3>
                    <p className={`${t.textSecondary} text-sm`}>Discover and navigate Sei ecosystem dApps</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <TrendingUp className={`${t.accent} mt-1`} size={20} />
                  <div>
                    <h3 className={`font-semibold ${t.text}`}>Market Analytics</h3>
                    <p className={`${t.textSecondary} text-sm`}>Real-time market data and trend analysis</p>
                  </div>
                </div>
              </div>
            </div>

            <div className={`${t.card} rounded-xl p-6`}>
              <h2 className={`text-2xl font-bold ${t.text} mb-4`}>API Usage</h2>
              <CodeBlock
                code={`// Get AI insights
const response = await seifun.seilor.chat({
  message: "What are the best performing tokens today?",
  context: "trading"
});

// Discover dApps
const dapps = await seifun.seilor.discoverDapps({
  category: "defi",
  limit: 10
});

// Get market analysis
const analysis = await seifun.seilor.analyzeMarket({
  timeframe: "24h",
  tokens: ["SEI", "SEIDOGE"]
});`}
                language="javascript"
                id="seilor-api"
              />
            </div>
          </div>
        );

      case 'rest-api':
        return (
          <div className="space-y-8">
            <div>
              <h1 className={`text-4xl font-bold ${t.text} mb-4`}>REST API</h1>
              <p className={`text-xl ${t.textSecondary} leading-relaxed mb-8`}>
                Access Seifun's features through our RESTful API endpoints.
              </p>
            </div>

            <div className={`${t.card} rounded-xl p-6`}>
              <h2 className={`text-2xl font-bold ${t.text} mb-4`}>Base URL</h2>
              <div className={`${t.accentBg} rounded-lg p-4 mb-4`}>
                <code className={`${t.accent} font-mono`}>https://api.seifun.app/v1</code>
              </div>
            </div>

            <div className={`${t.card} rounded-xl p-6`}>
              <h2 className={`text-2xl font-bold ${t.text} mb-4`}>Authentication</h2>
              <p className={`${t.textSecondary} mb-4`}>
                Include your API key in the Authorization header:
              </p>
              <CodeBlock
                code={`curl -H "Authorization: Bearer YOUR_API_KEY" \\
     -H "Content-Type: application/json" \\
     https://api.seifun.app/v1/tokens/scan`}
                language="bash"
                id="auth-example"
              />
            </div>

            <div className={`${t.card} rounded-xl p-6`}>
              <h2 className={`text-2xl font-bold ${t.text} mb-4`}>Endpoints</h2>
              <div className="space-y-4">
                <div className={`${t.bgSecondary} rounded-lg p-4`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-mono">GET</span>
                    <code className={`${t.text} font-mono`}>/tokens/{address}/scan</code>
                  </div>
                  <p className={`${t.textMuted} text-sm`}>Scan a token for security issues</p>
                </div>
                <div className={`${t.bgSecondary} rounded-lg p-4`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-mono">POST</span>
                    <code className={`${t.text} font-mono`}>/seilor/chat</code>
                  </div>
                  <p className={`${t.textMuted} text-sm`}>Chat with Seilor 0 AI assistant</p>
                </div>
                <div className={`${t.bgSecondary} rounded-lg p-4`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-mono">GET</span>
                    <code className={`${t.text} font-mono`}>/dapps</code>
                  </div>
                  <p className={`${t.textMuted} text-sm`}>Get list of Sei ecosystem dApps</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-8">
            <div>
              <h1 className={`text-4xl font-bold ${t.text} mb-4`}>Documentation</h1>
              <p className={`text-xl ${t.textSecondary} leading-relaxed`}>
                Select a section from the navigation to view detailed documentation.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen ${t.bg} transition-colors duration-200`}>
      {/* Header - Fixed with proper z-index */}
      <header className={`fixed top-0 left-0 right-0 z-50 ${t.bgSecondary} ${t.border} border-b backdrop-blur-md bg-opacity-95`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`lg:hidden ${t.text} hover:${t.textSecondary} p-2 rounded-lg ${t.bgTertiary}`}
              >
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <div>
                  <h1 className={`text-xl font-bold ${t.text}`}>Seifun</h1>
                  <p className={`text-xs ${t.textMuted}`}>Documentation</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden md:flex items-center space-x-2">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${t.textMuted}`} size={16} />
                  <input
                    type="text"
                    placeholder="Search docs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`pl-10 pr-4 py-2 rounded-lg ${t.bgTertiary} ${t.text} ${t.border} border focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent`}
                  />
                </div>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className={`p-2 rounded-lg ${t.bgTertiary} ${t.text} hover:${t.accentHover} transition-colors`}
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>

              {/* External Links */}
              <div className="flex items-center space-x-2">
                <a
                  href="https://github.com/Seifun1/Seifun"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-lg ${t.text} hover:${t.accentHover} transition-colors`}
                >
                  <Github size={20} />
                </a>
                <a
                  href="https://twitter.com/seifun"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-lg ${t.text} hover:${t.accentHover} transition-colors`}
                >
                  <Twitter size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - With proper top padding to account for fixed header */}
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Sidebar - Fixed positioning for desktop, overlay for mobile */}
            <aside className={`
              ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
              lg:translate-x-0 
              fixed lg:static 
              top-16 left-0 
              w-64 h-screen lg:h-auto 
              z-40 lg:z-auto 
              transition-transform duration-300 ease-in-out
              lg:shrink-0
            `}>
              <div className={`h-full lg:h-auto overflow-y-auto lg:overflow-visible ${t.sidebar} ${t.border} border rounded-none lg:rounded-xl p-4 backdrop-blur-sm`}>
                <nav className="space-y-6">
                  {navigation.map((section) => (
                    <div key={section.title}>
                      <h3 className={`text-sm font-semibold ${t.textMuted} uppercase tracking-wider mb-3`}>
                        {section.title}
                      </h3>
                      <ul className="space-y-1">
                        {section.items.map((item) => (
                          <li key={item.id}>
                            <button
                              onClick={() => {
                                setActiveSection(item.id);
                                setIsSidebarOpen(false);
                              }}
                              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                                activeSection === item.id
                                  ? `${t.accentBg} ${t.accent} font-medium`
                                  : `${t.textSecondary} hover:${t.accentHover} hover:${t.accent}`
                              }`}
                            >
                              <item.icon size={16} />
                              <span className="text-sm">{item.title}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Main Content - With proper margin for sidebar */}
            <main className="flex-1 min-w-0 lg:ml-0">
              <div className="prose prose-lg max-w-none">
                {renderContent()}
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Docs;