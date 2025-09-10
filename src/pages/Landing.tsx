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
  Gift,
  Clock
} from 'lucide-react';
import { getFeatureFlags, isFeatureEnabled } from '../config/featureFlags';

const Landing = () => {
  const features = getFeatureFlags();
  
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
                <span className="text-xs landing-text-muted -mt-1">Agentic AI Platform</span>
              </div>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="landing-nav-link">Features</a>
              <a href="#showcase" className="landing-nav-link">Showcase</a>
              <Link to="/app/docs" className="landing-nav-link">Docs</Link>
              <Link to="/app/seilor" className="landing-nav-link">AI Agent</Link>
            </div>

            {features.seifunLaunch ? (
              <Link to="/app/launch" className="landing-btn landing-btn-primary">
                Launch App
              </Link>
            ) : (
              <Link to="/app/launch" className="landing-btn landing-btn-primary opacity-75">
                <Clock className="w-4 h-4 mr-2" />
                Coming Soon
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Decorative bluish-black gradient background */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="landing-hero-orb absolute -top-24 -left-24 h-80 w-80" style={{background: 'radial-gradient(closest-side, rgba(59,130,246,0.25), rgba(15,23,42,0.0))'}} />
          <div className="landing-hero-orb absolute -bottom-24 -right-24 h-96 w-96" style={{background: 'radial-gradient(closest-side, rgba(37,99,235,0.18), rgba(2,6,23,0.0))'}} />
        </div>
        {/* Subtle brand logo animation */}
        <div className="landing-logo-hero">
          <img src="/Seifu.png" alt="Seifun Logo" className="animate-slow-rotate animate-float-y" />
        </div>
        <div className="landing-container">
          <div className="landing-section text-center landing-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border landing-border landing-text-muted mb-6">
              <span className="brand-blue-dot" /> Live on Sei Network
            </div>
            <h1 className="landing-heading-xl mb-6">
              Build, Trade, and Launch with
              <span className="block landing-sei-blue">Agentic AI for DeFi</span>
            </h1>
            <p className="landing-text-lg max-w-3xl mx-auto mb-8">
              Seifun combines real-time blockchain awareness with RAG knowledge and secure execution. Chat naturally with Seilor 0, analyze tokens, and automate DeFi workflows—fast, safe, and intuitive.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {features.seifunLaunch ? (
                <Link to="/app/launch" className="launch-app-btn">
                  <Rocket className="w-5 h-5 mr-2" />
                  Launch App
                </Link>
              ) : (
                <Link to="/app/launch" className="launch-app-btn opacity-75">
                  <Clock className="w-5 h-5 mr-2" />
                  Coming Soon
                </Link>
              )}
              <Link to="#showcase" className="landing-btn landing-btn-secondary">
                <Play className="w-5 h-5 mr-2" />
                See it in action
              </Link>
            </div>
            {/* Mini highlights */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
              <div className="landing-card px-4 py-3 text-sm landing-text-secondary">Agentic Workflows</div>
              <div className="landing-card px-4 py-3 text-sm landing-text-secondary">RAG Knowledge Base</div>
              <div className="landing-card px-4 py-3 text-sm landing-text-secondary">Security-first Execution</div>
            </div>
          </div>
        </div>
      </section>

      {/* Logo Band */}
      <section className="landing-section-sm">
        <div className="landing-container">
          <div className="landing-card py-6 px-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-6 items-center opacity-80">
              <div className="text-center landing-text-muted text-sm">Sei</div>
              <div className="text-center landing-text-muted text-sm">Astroport</div>
              <div className="text-center landing-text-muted text-sm">Dragonswap</div>
              <div className="text-center landing-text-muted text-sm">Yaka</div>
              <div className="text-center landing-text-muted text-sm">Nitro</div>
              <div className="text-center landing-text-muted text-sm">Kryptonite</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="landing-section-sm">
        <div className="landing-container">
          <div className="text-center mb-12 landing-slide-up">
            <h2 className="landing-heading-lg mb-4">Everything you need to ship AI agents</h2>
            <p className="landing-text-lg max-w-2xl mx-auto">
              From secure token scanning to intelligent chat and real on-chain actions—built with a professional bluish-dark UI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="landing-card p-6 landing-fade-in">
              <div className="w-12 h-12 landing-gradient-brand-blue rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="landing-heading-md mb-2">Agentic Workflows</h3>
              <p className="landing-text-secondary">
                Natural language to action. Seilor 0 plans, confirms, and executes DeFi tasks with safety rails.
              </p>
            </div>

            <div className="landing-card p-6 landing-fade-in">
              <div className="w-12 h-12 landing-gradient-brand-blue rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="landing-heading-md mb-2">RAG + Knowledge</h3>
              <p className="landing-text-secondary">
                MongoDB Atlas Vector Search powers fast, accurate answers grounded in your docs and on-chain context.
              </p>
            </div>

            <div className="landing-card p-6 landing-fade-in">
              <div className="w-12 h-12 landing-gradient-brand-blue rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="landing-heading-md mb-2">Security-first</h3>
              <p className="landing-text-secondary">
                Built-in SafeChecker, confirmations, and guardrails before any transfer, swap, or contract call.
              </p>
            </div>

            <div className="landing-card p-6 landing-fade-in">
              <div className="w-12 h-12 landing-gradient-brand-blue rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="landing-heading-md mb-2">Analytics-ready</h3>
              <p className="landing-text-secondary">
                Real-time balances, transaction previews, and token analysis for better decisions.
              </p>
            </div>

            <div className="landing-card p-6 landing-fade-in">
              <div className="w-12 h-12 landing-gradient-brand-blue rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="landing-heading-md mb-2">Collaborative</h3>
              <p className="landing-text-secondary">
                Share analyses, track tasks, and build together with a unified AI-first interface.
              </p>
            </div>

            <div className="landing-card p-6 landing-fade-in">
              <div className="w-12 h-12 landing-gradient-brand-blue rounded-lg flex items-center justify-center mb-4">
                <Code className="w-6 h-6 text-white" />
              </div>
              <h3 className="landing-heading-md mb-2">Developer-first</h3>
              <p className="landing-text-secondary">
                Clear APIs, LangChain agent, and serverless functions to extend actions and data sources.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Showcase */}
      <section id="showcase" className="landing-section">
        <div className="landing-container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            <div className="landing-card p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="landing-heading-md">Seilor 0 — Conversational Agent</h3>
                <span className="text-xs landing-text-muted">Realtime + RAG</span>
              </div>
              <div className="flex-1 rounded-xl border landing-border bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-6">
                <div className="h-64 w-full rounded-lg bg-slate-800/70 border border-slate-700/50 flex items-center justify-center text-slate-400">
                  AI Chat UI Preview
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <Link to="/app/seilor" className="landing-btn landing-btn-primary">Open Seilor 0</Link>
                <Link to="/app/docs" className="landing-btn landing-btn-secondary">Agent Docs</Link>
              </div>
            </div>

            <div className="landing-card p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="landing-heading-md">SafeChecker — Token Security</h3>
                <span className="text-xs landing-text-muted">Audits + Warnings</span>
              </div>
              <div className="flex-1 rounded-xl border landing-border bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-6">
                <div className="h-64 w-full rounded-lg bg-slate-800/70 border border-slate-700/50 flex items-center justify-center text-slate-400">
                  Security Scanner Preview
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <Link to="/app/safechecker" className="landing-btn landing-btn-primary">Launch SafeChecker</Link>
                <Link to="/app/docs" className="landing-btn landing-btn-secondary">Learn more</Link>
              </div>
            </div>

            <div className="landing-card p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="landing-heading-md">SeiList — Token Directory</h3>
                <span className="text-xs landing-text-muted">
                  {features.seilist ? "Live" : "Coming Soon"}
                </span>
              </div>
              <div className="flex-1 rounded-xl border landing-border bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-6">
                <div className="h-64 w-full rounded-lg bg-slate-800/70 border border-slate-700/50 flex items-center justify-center text-slate-400">
                  {features.seilist ? "Token Directory Preview" : "Coming Soon"}
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                {features.seilist ? (
                  <>
                    <Link to="/app/seilist" className="landing-btn landing-btn-primary">Launch SeiList</Link>
                    <Link to="/app/docs" className="landing-btn landing-btn-secondary">Learn more</Link>
                  </>
                ) : (
                  <>
                    <Link to="/app/seilist" className="landing-btn landing-btn-primary opacity-75">
                      <Clock className="w-4 h-4 mr-2" />
                      Coming Soon
                    </Link>
                    <Link to="/app/docs" className="landing-btn landing-btn-secondary">Learn more</Link>
                  </>
                )}
              </div>
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
            <h2 className="landing-heading-lg mb-4">Start building with Agentic AI on Sei</h2>
            <p className="landing-text-lg mb-8 max-w-2xl mx-auto">
              Launch the app to chat with Seilor 0, run SafeChecker scans, and compose on-chain actions instantly.
            </p>
            {features.seifunLaunch ? (
              <Link to="/app/launch" className="launch-app-btn">
                <Rocket className="w-5 h-5 mr-2" />
                Launch App Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            ) : (
              <Link to="/app/launch" className="launch-app-btn opacity-75">
                <Clock className="w-5 h-5 mr-2" />
                Coming Soon
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            )}
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
                Agentic AI for DeFi on Sei. Build safely, move faster.
              </p>
            </div>
            
            <div>
              <h4 className="landing-heading-md mb-4">Platform</h4>
              <ul className="space-y-2">
                <li><Link to="/app/safechecker" className="landing-text-secondary hover:landing-text-primary">SafeChecker</Link></li>
                <li><Link to="/app/seilor" className="landing-text-secondary hover:landing-text-primary">Seilor 0</Link></li>
                <li><Link to="/app/docs" className="landing-text-secondary hover:landing-text-primary">Docs</Link></li>
                {features.devPlus && (
                  <li><Link to="/app/devplus" className="landing-text-secondary hover:landing-text-primary">Dev Plus</Link></li>
                )}
              </ul>
            </div>
            
            <div>
              <h4 className="landing-heading-md mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="landing-text-secondary hover:landing-text-primary">Features</a></li>
                <li><a href="#showcase" className="landing-text-secondary hover:landing-text-primary">Showcase</a></li>
                <li><a href="https://seitrace.com" target="_blank" rel="noreferrer" className="landing-text-secondary hover:landing-text-primary">SeiTrace</a></li>
                <li><Link to="/app/docs" className="landing-text-secondary hover:landing-text-primary">API Reference</Link></li>
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
              © 2025 Seifun. Built on the Sei blockchain.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;