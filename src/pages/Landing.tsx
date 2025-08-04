import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Rocket, 
  Shield, 
  TrendingUp, 
  Users, 
  Zap, 
  BarChart3, 
  ArrowRight, 
  Star,
  CheckCircle,
  Play,
  Code,
  Gift
} from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen landing-bg-primary">
      {/* Navigation */}
      <nav className="landing-nav sticky top-0 z-50">
        <div className="landing-container">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-3">
              <div className="relative">
                <img 
                  src="/Seifu.png" 
                  alt="Seifun Logo" 
                  className="w-10 h-10 rounded-full"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold landing-text-primary">
                  Seifun
                </span>
                <span className="text-xs landing-text-muted -mt-1">Launch Platform</span>
              </div>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="landing-nav-link">Features</a>
              <a href="#about" className="landing-nav-link">About</a>
              <a href="#contact" className="landing-nav-link">Contact</a>
            </div>

            <Link to="/app" className="landing-btn landing-btn-primary">
              Launch App
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="landing-section">
        <div className="landing-container">
          <div className="text-center landing-fade-in">
            <h1 className="landing-heading-xl mb-6">
              Launch Safe Meme Tokens on{' '}
              <span className="landing-sei-blue">Sei</span>
            </h1>
            <p className="landing-text-lg max-w-3xl mx-auto mb-8">
              Discover, launch, and trade tokens on the fastest Layer 1 blockchain. 
              Built for developers, traders, and creators who want to build the future of DeFi.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/app" className="launch-app-btn">
                <Rocket className="w-5 h-5 mr-2" />
                Launch App
              </Link>
              <button className="landing-btn landing-btn-secondary">
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="landing-section-sm">
        <div className="landing-container">
          <div className="text-center mb-16 landing-slide-up">
            <h2 className="landing-heading-lg mb-4">Why Choose Seifun?</h2>
            <p className="landing-text-lg max-w-2xl mx-auto">
              Experience the next generation of token launching with advanced features and security.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="landing-card p-6 landing-fade-in">
              <div className="w-12 h-12 landing-gradient-sei-blue rounded-lg flex items-center justify-center mb-4">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <h3 className="landing-heading-md mb-3">Instant Token Launch</h3>
              <p className="landing-text-secondary">
                Launch your token in minutes with our streamlined process. No coding required.
              </p>
            </div>

            <div className="landing-card p-6 landing-fade-in">
              <div className="w-12 h-12 landing-gradient-sei-blue rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="landing-heading-md mb-3">Advanced Security</h3>
              <p className="landing-text-secondary">
                Built-in honeypot detection and security scanning to protect your investments.
              </p>
            </div>

            <div className="landing-card p-6 landing-fade-in">
              <div className="w-12 h-12 landing-gradient-sei-blue rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="landing-heading-md mb-3">Real-time Analytics</h3>
              <p className="landing-text-secondary">
                Track token performance with comprehensive analytics and market insights.
              </p>
            </div>

            <div className="landing-card p-6 landing-fade-in">
              <div className="w-12 h-12 landing-gradient-sei-blue rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="landing-heading-md mb-3">Community Driven</h3>
              <p className="landing-text-secondary">
                Join a vibrant community of creators, traders, and developers.
              </p>
            </div>

            <div className="landing-card p-6 landing-fade-in">
              <div className="w-12 h-12 landing-gradient-sei-blue rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="landing-heading-md mb-3">Lightning Fast</h3>
              <p className="landing-text-secondary">
                Built on Sei's high-performance blockchain for instant transactions.
              </p>
            </div>

            <div className="landing-card p-6 landing-fade-in">
              <div className="w-12 h-12 landing-gradient-sei-blue rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="landing-heading-md mb-3">Developer Tools</h3>
              <p className="landing-text-secondary">
                Advanced tools for developers to build and manage their tokens.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="landing-section-sm">
        <div className="landing-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center landing-fade-in">
              <div className="landing-heading-xl landing-sei-blue mb-2">$50M+</div>
              <div className="landing-text-secondary">Total Volume</div>
            </div>
            <div className="text-center landing-fade-in">
              <div className="landing-heading-xl landing-sei-blue mb-2">1,247</div>
              <div className="landing-text-secondary">Tokens Launched</div>
            </div>
            <div className="text-center landing-fade-in">
              <div className="landing-heading-xl landing-sei-blue mb-2">8,920</div>
              <div className="landing-text-secondary">Active Users</div>
            </div>
            <div className="text-center landing-fade-in">
              <div className="landing-heading-xl landing-sei-blue mb-2">99.9%</div>
              <div className="landing-text-secondary">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-section-sm">
        <div className="landing-container">
          <div className="landing-card p-12 text-center landing-slide-up">
            <h2 className="landing-heading-lg mb-4">Ready to Launch Your Token?</h2>
            <p className="landing-text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of creators who have already launched their tokens on Seifun. 
              Start your journey today and be part of the future of DeFi.
            </p>
            <Link to="/app" className="launch-app-btn">
              <Rocket className="w-5 h-5 mr-2" />
              Launch App Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-bg-secondary border-t landing-border">
        <div className="landing-container py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img src="/Seifu.png" alt="Seifun Logo" className="w-8 h-8 rounded-full" />
                <span className="text-xl font-bold landing-text-primary">Seifun</span>
              </div>
              <p className="landing-text-secondary">
                The premier platform for launching and trading tokens on the Sei blockchain.
              </p>
            </div>
            
            <div>
              <h4 className="landing-heading-md mb-4">Platform</h4>
              <ul className="space-y-2">
                <li><a href="#" className="landing-text-secondary hover:landing-text-primary">Launchpad</a></li>
                <li><a href="#" className="landing-text-secondary hover:landing-text-primary">Token Discovery</a></li>
                <li><a href="#" className="landing-text-secondary hover:landing-text-primary">Analytics</a></li>
                <li><a href="#" className="landing-text-secondary hover:landing-text-primary">Developer Tools</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="landing-heading-md mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="landing-text-secondary hover:landing-text-primary">Documentation</a></li>
                <li><a href="#" className="landing-text-secondary hover:landing-text-primary">API Reference</a></li>
                <li><a href="#" className="landing-text-secondary hover:landing-text-primary">Community</a></li>
                <li><a href="#" className="landing-text-secondary hover:landing-text-primary">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="landing-heading-md mb-4">Connect</h4>
              <ul className="space-y-2">
                <li><a href="#" className="landing-text-secondary hover:landing-text-primary">Twitter</a></li>
                <li><a href="#" className="landing-text-secondary hover:landing-text-primary">Discord</a></li>
                <li><a href="#" className="landing-text-secondary hover:landing-text-primary">Telegram</a></li>
                <li><a href="#" className="landing-text-secondary hover:landing-text-primary">Blog</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t landing-border mt-8 pt-8 text-center">
            <p className="landing-text-muted">
              © 2024 Seifun. Built on the Sei blockchain.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;