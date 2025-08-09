import React from 'react';

// Interface for search results
export interface SearchResult {
  id: string;
  title: string;
  description: string;
  section: string;
  relevanceScore: number;
  matchType: 'title' | 'content' | 'keyword';
  highlightedText?: string;
}

// Comprehensive documentation content for search
export const searchableDocumentation = {
  'introduction': {
    title: 'Welcome to Seifun',
    content: `Welcome to Seifun - the ultimate DeFi platform on Sei Network. Seifun combines AI-powered trading, token creation, security analysis, and developer tools into one comprehensive ecosystem. Our platform features Seilor 0 AI trading agent, SeiList token launcher, SafeChecker security scanner, and Dev++ developer dashboard. Experience the future of decentralized finance with ChatGPT-level intelligence, real-time blockchain interactions, and professional-grade security tools.`,
    keywords: ['seifun', 'defi', 'sei network', 'ai trading', 'token creation', 'security', 'blockchain', 'cryptocurrency', 'web3']
  },
  'getting-started': {
    title: 'Getting Started',
    content: `Get started with Seifun in minutes. Connect your wallet using MetaMask, WalletConnect, or Coinbase Wallet. Make sure you're connected to the Sei Network for full functionality. Once connected, explore our core features: Seilor 0 AI agent for trading insights, SeiList for token creation, SafeChecker for security analysis, and Dev++ for project management.`,
    keywords: ['getting started', 'wallet connection', 'metamask', 'walletconnect', 'coinbase wallet', 'sei network', 'setup']
  },
  'seilor-ai': {
    title: 'Seilor 0 - AI Trading Agent',
    content: `Seilor 0 is your intelligent AI trading companion powered by ChatGPT-level intelligence and CambrianAgents technology. Get real-time wallet balance and transaction history, analyze tokens for security and investment potential, receive AI-powered trading recommendations, access your todo list and project management, execute token swaps on Symphony DEX, stake tokens on Silo protocol, lend and borrow on Takara protocol, and trade on Citrex perpetual exchange. Seilor 0 combines natural language processing with blockchain expertise to provide professional trading guidance.`,
    keywords: ['seilor 0', 'ai agent', 'trading', 'chatgpt', 'cambrian agents', 'balance', 'token analysis', 'recommendations', 'symphony', 'silo', 'takara', 'citrex', 'nlp']
  },
  'seilist': {
    title: 'SeiList - Token Creation Platform',
    content: `SeiList is your professional token creation and launch platform on Sei Network. Create ERC-20 tokens with custom names, symbols, and total supply. Upload custom logos and branding materials. Preview your token before deployment with our advanced preview system. Add liquidity to DEX protocols for trading. Implement burn functionality for deflationary tokenomics. Manage token ownership and permissions. Deploy to Sei mainnet or testnet for testing. All token creations are verified and secured through our smart contract system.`,
    keywords: ['seilist', 'token creation', 'erc-20', 'token launch', 'logo', 'branding', 'liquidity', 'burn', 'deflationary', 'smart contract', 'mainnet', 'testnet']
  },
  'safechecker': {
    title: 'SafeChecker - Security Analysis Tool',
    content: `SafeChecker is your comprehensive security analysis tool for Sei Network tokens. Scan any token contract for security vulnerabilities and risks. Get detailed risk scores from 0-100 with professional analysis. Identify potential rug pulls, honeypots, and malicious contracts. Analyze tokenomics including supply, distribution, and liquidity. Check contract ownership and renounced status. Verify source code and audit history. Get real-time price and trading data. SafeChecker displays high risk warnings for scores below 40 to protect investors.`,
    keywords: ['safechecker', 'security', 'analysis', 'risk score', 'rug pull', 'honeypot', 'malicious', 'tokenomics', 'audit', 'verification', 'price data', 'high risk']
  },
  'dev-plus-plus': {
    title: 'Dev++ - Developer Dashboard',
    content: `Dev++ is your comprehensive developer dashboard for managing blockchain projects on Sei. Track your created tokens and their performance metrics. Manage token liquidity across multiple DEX protocols. Implement and execute token burn operations for supply management. Monitor wallet balances and transaction history. Access advanced developer tools and APIs. Integrate with external services and protocols. View detailed analytics and reporting. Dev++ provides everything developers need to build and manage successful DeFi projects.`,
    keywords: ['dev++', 'developer dashboard', 'project management', 'token tracking', 'liquidity management', 'burn operations', 'analytics', 'apis', 'integration', 'metrics']
  },
  'wallet-integration': {
    title: 'Wallet Integration & Connection',
    content: `Seifun supports multiple wallet types for seamless Web3 integration. Connect using MetaMask browser extension, WalletConnect for mobile wallets, Coinbase Wallet for self-custody, or ReOWN Kit for advanced wallet features. Ensure you're connected to Sei Network (Chain ID: 1329) for full functionality. Our wallet integration supports real-time balance updates, transaction signing, and multi-account management. All wallet connections use industry-standard security protocols.`,
    keywords: ['wallet', 'integration', 'connection', 'metamask', 'walletconnect', 'coinbase', 'reown', 'chain id', 'balance', 'transaction', 'security']
  },
  'trading-features': {
    title: 'Trading & DeFi Features',
    content: `Experience comprehensive DeFi trading on Sei Network. Execute token swaps on Symphony DEX with optimal routing and minimal slippage. Stake SEI tokens on Silo protocol for yield generation. Lend and borrow assets on Takara protocol with competitive rates. Trade perpetual contracts on Citrex with leverage up to 100x. All trading features include AI-powered recommendations, risk analysis, and safety checks through Seilor 0 integration.`,
    keywords: ['trading', 'defi', 'swaps', 'symphony dex', 'staking', 'silo', 'lending', 'borrowing', 'takara', 'perpetual', 'citrex', 'leverage', 'yield', 'risk analysis']
  },
  'api-reference': {
    title: 'API Reference & Integration',
    content: `Integrate with Seifun using our comprehensive API suite. Access real-time token data, execute trades programmatically, manage wallets and balances, create and deploy tokens, perform security analysis, and integrate AI trading recommendations. Our APIs support REST and WebSocket protocols with comprehensive authentication and rate limiting. Full documentation includes code examples in JavaScript, Python, and other popular languages.`,
    keywords: ['api', 'integration', 'rest', 'websocket', 'authentication', 'rate limiting', 'javascript', 'python', 'documentation', 'code examples', 'programmatic']
  },
  'security-best-practices': {
    title: 'Security Best Practices',
    content: `Follow security best practices when using Seifun and DeFi protocols. Never share your private keys or seed phrases. Always verify contract addresses before transactions. Use hardware wallets for large amounts. Enable two-factor authentication where available. Regularly update your wallet software. Be cautious of phishing attempts and fake websites. Always use SafeChecker to analyze tokens before investing. Start with small amounts when testing new features.`,
    keywords: ['security', 'best practices', 'private keys', 'seed phrase', 'hardware wallet', '2fa', 'phishing', 'fake websites', 'contract verification', 'testing']
  },
  'troubleshooting': {
    title: 'Troubleshooting & Support',
    content: `Common troubleshooting solutions for Seifun platform issues. Wallet connection problems: Clear browser cache, disable conflicting extensions, switch networks manually. Transaction failures: Check gas fees, verify network connection, ensure sufficient balance. AI agent not responding: Verify OpenAI API key configuration, check internet connection, restart browser. Token creation errors: Validate input parameters, check contract permissions, verify network selection. For additional support, contact our team through Discord, Twitter, or GitHub issues.`,
    keywords: ['troubleshooting', 'support', 'wallet problems', 'transaction failures', 'gas fees', 'ai agent', 'openai api', 'token creation errors', 'discord', 'twitter', 'github']
  }
};

export class DocumentationSearchService {
  private static instance: DocumentationSearchService;
  
  public static getInstance(): DocumentationSearchService {
    if (!DocumentationSearchService.instance) {
      DocumentationSearchService.instance = new DocumentationSearchService();
    }
    return DocumentationSearchService.instance;
  }

  // Main search function
  public search(query: string): SearchResult[] {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const normalizedQuery = query.toLowerCase().trim();
    const results: SearchResult[] = [];

    // Search through all documentation sections
    Object.entries(searchableDocumentation).forEach(([sectionId, section]) => {
      // Title search (highest priority)
      if (section.title.toLowerCase().includes(normalizedQuery)) {
        results.push({
          id: `${sectionId}-title`,
          title: section.title,
          description: this.extractRelevantText(section.content, normalizedQuery, 150),
          section: section.title,
          relevanceScore: this.calculateTitleRelevance(section.title, normalizedQuery),
          matchType: 'title',
          highlightedText: this.highlightMatch(section.title, normalizedQuery)
        });
      }

      // Content search
      if (section.content.toLowerCase().includes(normalizedQuery)) {
        const relevantText = this.extractRelevantText(section.content, normalizedQuery, 200);
        results.push({
          id: `${sectionId}-content`,
          title: `${section.title} (Content Match)`,
          description: relevantText,
          section: section.title,
          relevanceScore: this.calculateContentRelevance(section.content, normalizedQuery),
          matchType: 'content',
          highlightedText: this.highlightMatch(relevantText, normalizedQuery)
        });
      }

      // Keyword search
      const keywordMatch = section.keywords.find(keyword => 
        keyword.toLowerCase().includes(normalizedQuery) || 
        normalizedQuery.includes(keyword.toLowerCase())
      );
      
      if (keywordMatch) {
        results.push({
          id: `${sectionId}-keyword`,
          title: `${section.title} (Related)`,
          description: this.extractRelevantText(section.content, keywordMatch, 150),
          section: section.title,
          relevanceScore: this.calculateKeywordRelevance(keywordMatch, normalizedQuery),
          matchType: 'keyword',
          highlightedText: this.highlightMatch(keywordMatch, normalizedQuery)
        });
      }
    });

    // Remove duplicates and sort by relevance
    const uniqueResults = this.removeDuplicates(results);
    return uniqueResults
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 10); // Limit to top 10 results
  }

  // Extract relevant text around the match
  private extractRelevantText(content: string, query: string, maxLength: number): string {
    const lowerContent = content.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const matchIndex = lowerContent.indexOf(lowerQuery);
    
    if (matchIndex === -1) {
      return content.substring(0, maxLength) + (content.length > maxLength ? '...' : '');
    }

    // Extract text around the match
    const start = Math.max(0, matchIndex - 50);
    const end = Math.min(content.length, matchIndex + query.length + 100);
    const excerpt = content.substring(start, end);
    
    return (start > 0 ? '...' : '') + excerpt + (end < content.length ? '...' : '');
  }

  // Highlight matching text
  private highlightMatch(text: string, query: string): string {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-300 text-black px-1 rounded">$1</mark>');
  }

  // Calculate relevance scores
  private calculateTitleRelevance(title: string, query: string): number {
    const lowerTitle = title.toLowerCase();
    const lowerQuery = query.toLowerCase();
    
    if (lowerTitle === lowerQuery) return 100;
    if (lowerTitle.startsWith(lowerQuery)) return 90;
    if (lowerTitle.includes(lowerQuery)) return 80;
    
    return 70;
  }

  private calculateContentRelevance(content: string, query: string): number {
    const lowerContent = content.toLowerCase();
    const lowerQuery = query.toLowerCase();
    
    // Count occurrences
    const matches = (lowerContent.match(new RegExp(lowerQuery, 'g')) || []).length;
    const baseScore = Math.min(60, matches * 10);
    
    // Bonus for early occurrence
    const firstMatch = lowerContent.indexOf(lowerQuery);
    const earlyBonus = firstMatch < 100 ? 10 : 0;
    
    return baseScore + earlyBonus;
  }

  private calculateKeywordRelevance(keyword: string, query: string): number {
    const lowerKeyword = keyword.toLowerCase();
    const lowerQuery = query.toLowerCase();
    
    if (lowerKeyword === lowerQuery) return 50;
    if (lowerKeyword.includes(lowerQuery) || lowerQuery.includes(lowerKeyword)) return 40;
    
    return 30;
  }

  // Remove duplicate results
  private removeDuplicates(results: SearchResult[]): SearchResult[] {
    const seen = new Set();
    return results.filter(result => {
      const key = `${result.section}-${result.matchType}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // Get suggestions based on popular searches
  public getSuggestions(query: string): string[] {
    const suggestions = [
      'seilor 0 ai agent',
      'token creation seilist',
      'security analysis safechecker', 
      'wallet connection',
      'trading symphony dex',
      'staking silo protocol',
      'lending takara protocol',
      'developer dashboard dev++',
      'api integration',
      'troubleshooting guide'
    ];

    if (!query || query.length < 2) {
      return suggestions.slice(0, 5);
    }

    const lowerQuery = query.toLowerCase();
    return suggestions
      .filter(suggestion => suggestion.toLowerCase().includes(lowerQuery))
      .slice(0, 5);
  }
}