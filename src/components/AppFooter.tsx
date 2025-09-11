import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Github, MessageCircle, Mail } from 'lucide-react';

const AppFooter = () => {
  return (
    <footer className="app-bg-secondary border-t app-border">
      <div className="app-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img src="/Seifu.png" alt="Seifun Logo" className="w-8 h-8 rounded-full" />
              <span className="text-xl font-bold app-text-primary">Seifun</span>
            </div>
            <p className="app-text-secondary">
              The premier platform for launching and trading tokens on the Sei blockchain.
            </p>
          </div>
          
          <div>
            <h4 className="app-heading-md mb-4">Platform</h4>
            <ul className="space-y-2">
              <li><Link to="/app/safechecker" className="app-text-secondary hover:app-text-primary">SafeChecker</Link></li>
              <li><Link to="/app/seilor" className="app-text-secondary hover:app-text-primary">Seilor 0</Link></li>
              <li><Link to="/app/docs" className="app-text-secondary hover:app-text-primary">Documentation</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="app-heading-md mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><Link to="/app/docs" className="app-text-secondary hover:app-text-primary">Documentation</Link></li>
              <li><a href="#" className="app-text-secondary hover:app-text-primary">API Reference (coming soon)</a></li>
              <li><a href="#" className="app-text-secondary hover:app-text-primary">Community (coming soon)</a></li>
              <li><a href="#" className="app-text-secondary hover:app-text-primary">Support (coming soon)</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="app-heading-md mb-4">Connect</h4>
            <div className="flex space-x-4">
              <a href="https://x.com/seifu_trade" target="_blank" rel="noreferrer" className="p-2 rounded-lg app-bg-tertiary hover:app-bg-primary transition-colors">
                <Twitter className="w-5 h-5 app-text-secondary" />
              </a>
              <a href="https://github.com/Milesno2/Seifun" target="_blank" rel="noreferrer" className="p-2 rounded-lg app-bg-tertiary hover:app-bg-primary transition-colors">
                <Github className="w-5 h-5 app-text-secondary" />
              </a>
              <a href="#" className="p-2 rounded-lg app-bg-tertiary hover:app-bg-primary transition-colors">
                <MessageCircle className="w-5 h-5 app-text-secondary" />
              </a>
              <a href="mailto:team@seifun.xyz" className="p-2 rounded-lg app-bg-tertiary hover:app-bg-primary transition-colors">
                <Mail className="w-5 h-5 app-text-secondary" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t app-border mt-8 pt-8 text-center">
          <p className="app-text-muted">
            © 2025 Seifun. Built on the Sei blockchain.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;