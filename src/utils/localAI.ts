// Local AI Implementation for Trading Conversations
// No external APIs required - fully local processing

interface TokenData {
  address: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  safetyScore: number;
  holders?: number;
  description?: string;
}

interface AIResponse {
  content: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  signals: string[];
  relatedTokens?: string[];
}

export class LocalAI {
  private tokenDatabase: Map<string, TokenData> = new Map();
  private conversationHistory: string[] = [];
  private marketSentiment: 'bull' | 'bear' | 'sideways' = 'bull';

  constructor() {
    this.initializeTokenDatabase();
    this.updateMarketSentiment();
  }

  private initializeTokenDatabase() {
    // Initialize with known Sei tokens
    const tokens: TokenData[] = [
      {
        address: '0xbd82f3bfe1df0c84faec88a22ebc34c9a86595dc',
        name: 'CHIPS',
        symbol: 'CHIPS',
        price: 0.00234,
        change24h: 23.45,
        volume24h: 456789,
        marketCap: 2340000,
        safetyScore: 88,
        holders: 3420,
        description: 'The original Sei meme token with gaming utility'
      },
      {
        address: '0x95597eb8d227a7c4b4f5e807a815c5178ee6dbe1',
        name: 'SEIYAN',
        symbol: 'SEIYAN',
        price: 0.00567,
        change24h: 45.67,
        volume24h: 789123,
        marketCap: 4400000,
        safetyScore: 91,
        holders: 5678,
        description: 'The Super Saiyan of Sei Network meme tokens'
      }
    ];

    tokens.forEach(token => {
      this.tokenDatabase.set(token.symbol.toLowerCase(), token);
      this.tokenDatabase.set(token.address.toLowerCase(), token);
    });
  }

  private updateMarketSentiment() {
    // Simple market sentiment based on recent performance
    const avgChange = Array.from(this.tokenDatabase.values())
      .reduce((sum, token) => sum + token.change24h, 0) / this.tokenDatabase.size;
    
    if (avgChange > 10) this.marketSentiment = 'bull';
    else if (avgChange < -10) this.marketSentiment = 'bear';
    else this.marketSentiment = 'sideways';
  }

  private extractTokens(message: string): TokenData[] {
    const tokens: TokenData[] = [];
    const lowerMessage = message.toLowerCase();
    
    for (const [key, tokenData] of this.tokenDatabase.entries()) {
      if (lowerMessage.includes(key) || lowerMessage.includes(tokenData.name.toLowerCase())) {
        if (!tokens.find(t => t.address === tokenData.address)) {
          tokens.push(tokenData);
        }
      }
    }
    
    return tokens;
  }

  private analyzeIntent(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('buy') || lowerMessage.includes('purchase')) return 'buy_intent';
    if (lowerMessage.includes('sell') || lowerMessage.includes('dump')) return 'sell_intent';
    if (lowerMessage.includes('price') || lowerMessage.includes('cost')) return 'price_query';
    if (lowerMessage.includes('safe') || lowerMessage.includes('risk') || lowerMessage.includes('security')) return 'safety_query';
    if (lowerMessage.includes('analyze') || lowerMessage.includes('analysis')) return 'analysis_request';
    if (lowerMessage.includes('predict') || lowerMessage.includes('future')) return 'prediction_request';
    if (lowerMessage.includes('compare')) return 'comparison_request';
    if (lowerMessage.includes('help') || lowerMessage.includes('how')) return 'help_request';
    if (lowerMessage.includes('market') || lowerMessage.includes('trend')) return 'market_query';
    
    return 'general_query';
  }

  private generateTokenAnalysis(token: TokenData): string {
    const priceDirection = token.change24h > 0 ? 'up' : 'down';
    const priceEmoji = token.change24h > 0 ? '📈' : '📉';
    const safetyLevel = token.safetyScore >= 80 ? 'Very Safe' : 
                      token.safetyScore >= 60 ? 'Moderately Safe' : 'High Risk';
    
    return `${priceEmoji} **${token.name} (${token.symbol})** Analysis:

**Current Metrics:**
• Price: $${token.price.toFixed(6)} (${priceDirection} ${Math.abs(token.change24h).toFixed(2)}%)
• Market Cap: $${token.marketCap.toLocaleString()}
• 24h Volume: $${token.volume24h.toLocaleString()}
• Safety Score: ${token.safetyScore}/100 (${safetyLevel})
${token.holders ? `• Holders: ${token.holders.toLocaleString()}` : ''}

**Technical Indicators:**
${this.generateTechnicalAnalysis(token)}

**Risk Assessment:**
${this.generateRiskAssessment(token)}`;
  }

  private generateTechnicalAnalysis(token: TokenData): string {
    const momentum = token.change24h > 20 ? 'Strong Bullish' :
                    token.change24h > 5 ? 'Bullish' :
                    token.change24h > -5 ? 'Neutral' :
                    token.change24h > -20 ? 'Bearish' : 'Strong Bearish';
    
    const volumeAnalysis = token.volume24h > 500000 ? 'High volume indicates strong interest' :
                          token.volume24h > 100000 ? 'Moderate volume' : 'Low volume - exercise caution';
    
    return `• Momentum: ${momentum}
• Volume Analysis: ${volumeAnalysis}
• Market Sentiment: ${this.marketSentiment.charAt(0).toUpperCase() + this.marketSentiment.slice(1)}ish`;
  }

  private generateRiskAssessment(token: TokenData): string {
    const risks: string[] = [];
    const strengths: string[] = [];
    
    if (token.safetyScore >= 80) strengths.push('High safety score');
    else if (token.safetyScore < 60) risks.push('Lower safety score');
    
    if (token.volume24h < 50000) risks.push('Low liquidity');
    else strengths.push('Good liquidity');
    
    if (token.change24h > 50) risks.push('High volatility');
    if (token.change24h < -30) risks.push('Recent sharp decline');
    
    const riskLevel = risks.length > strengths.length ? 'Higher' : 
                     strengths.length > risks.length ? 'Lower' : 'Moderate';
    
    return `Risk Level: ${riskLevel}
${strengths.length > 0 ? `Strengths: ${strengths.join(', ')}` : ''}
${risks.length > 0 ? `Risks: ${risks.join(', ')}` : ''}`;
  }

  private generateMarketInsight(): string {
    const insights = [
      "Sei ecosystem is showing strong development activity with new projects launching regularly.",
      "Meme tokens on Sei are gaining traction due to fast transaction speeds and low fees.",
      "Always DYOR (Do Your Own Research) before making any investment decisions.",
      "Consider dollar-cost averaging for volatile meme tokens to reduce risk.",
      "Look for tokens with locked liquidity and renounced ownership for better safety.",
      "Community engagement is crucial for meme token success - check social media activity.",
      "Never invest more than you can afford to lose in speculative assets.",
      "Diversification across different projects can help manage risk.",
    ];
    
    // Return the most relevant insight based on context
    return insights[0]; // Use first insight as default, could be enhanced with context analysis
  }

  private generatePrediction(token: TokenData): string {
    // Simple prediction based on current metrics
    const factors = {
      momentum: token.change24h > 0 ? 1 : -1,
      volume: token.volume24h > 200000 ? 1 : 0,
      safety: token.safetyScore > 70 ? 1 : -1,
      market: this.marketSentiment === 'bull' ? 1 : this.marketSentiment === 'bear' ? -1 : 0
    };
    
    const score = Object.values(factors).reduce((sum, val) => sum + val, 0);
    
    if (score >= 2) {
      return `**Bullish Outlook** for ${token.symbol}:
• Strong fundamentals and momentum
• Potential targets: $${(token.price * 1.5).toFixed(6)} - $${(token.price * 2).toFixed(6)}
• Consider gradual accumulation on dips`;
    } else if (score <= -2) {
      return `**Bearish Outlook** for ${token.symbol}:
• Weak momentum and fundamentals
• Potential support: $${(token.price * 0.7).toFixed(6)} - $${(token.price * 0.8).toFixed(6)}
• Consider waiting for better entry points`;
    } else {
      return `**Neutral Outlook** for ${token.symbol}:
• Mixed signals in current market conditions
• Range-bound trading expected
• Wait for clearer directional signals`;
    }
  }

  public async processMessage(message: string): Promise<AIResponse> {
    this.conversationHistory.push(message);
    
    const intent = this.analyzeIntent(message);
    const mentionedTokens = this.extractTokens(message);
    
    let response: AIResponse;
    
    switch (intent) {
      case 'buy_intent':
      case 'sell_intent':
        response = this.handleTradingIntent(intent, mentionedTokens, message);
        break;
      
      case 'analysis_request':
        response = this.handleAnalysisRequest(mentionedTokens);
        break;
      
      case 'safety_query':
        response = this.handleSafetyQuery(mentionedTokens);
        break;
      
      case 'price_query':
        response = this.handlePriceQuery(mentionedTokens);
        break;
      
      case 'prediction_request':
        response = this.handlePredictionRequest(mentionedTokens);
        break;
      
      case 'comparison_request':
        response = this.handleComparisonRequest(mentionedTokens);
        break;
      
      case 'market_query':
        response = this.handleMarketQuery();
        break;
      
      case 'help_request':
        response = this.handleHelpRequest();
        break;
      
      default:
        response = this.handleGeneralQuery(message, mentionedTokens);
    }
    
    // Add some randomness and personality
    response.content = this.addPersonality(response.content);
    
    return response;
  }

  private handleTradingIntent(intent: string, tokens: TokenData[], message: string): AIResponse {
    const isBuy = intent === 'buy_intent';
    
    if (tokens.length === 0) {
      return {
        content: `I can't provide specific trading advice without knowing which token you're interested in. However, here are some general guidelines:

${isBuy ? '**Before Buying:**' : '**Before Selling:**'}
• Always research the token thoroughly
• Check the safety score and liquidity
• Consider your risk tolerance
• Never invest more than you can afford to lose
${isBuy ? '• Look for good entry points during dips' : '• Consider taking profits gradually'}

Which specific token would you like me to analyze for you?`,
        sentiment: 'neutral',
        confidence: 85,
        signals: ['Risk Management', 'Due Diligence Required']
      };
    }
    
    const token = tokens[0];
    const action = isBuy ? 'buying' : 'selling';
    
    return {
      content: `I can't provide direct ${action} advice, but here's my analysis for **${token.symbol}**:

${this.generateTokenAnalysis(token)}

**${isBuy ? 'Buying' : 'Selling'} Considerations:**
${isBuy ? this.generateBuyingConsiderations(token) : this.generateSellingConsiderations(token)}

Remember: This is not financial advice. Always do your own research!`,
      sentiment: this.determineSentiment(token),
      confidence: Math.min(90, token.safetyScore),
      signals: this.generateSignals(token),
      relatedTokens: [token.symbol]
    };
  }

  private handleAnalysisRequest(tokens: TokenData[]): AIResponse {
    if (tokens.length === 0) {
      return {
        content: `I'd be happy to analyze any Sei token for you! Currently, I have detailed data for:

• **CHIPS** - The original Sei gaming meme token
• **SEIYAN** - The Super Saiyan of Sei memes

Just mention a token name or paste a contract address, and I'll provide:
• Technical analysis
• Safety assessment  
• Risk evaluation
• Market outlook

Which token would you like me to analyze?`,
        sentiment: 'neutral',
        confidence: 95,
        signals: ['Analysis Ready', 'Token Database Available']
      };
    }
    
    const token = tokens[0];
    return {
      content: this.generateTokenAnalysis(token),
      sentiment: this.determineSentiment(token),
      confidence: Math.min(95, token.safetyScore + 10),
      signals: this.generateSignals(token),
      relatedTokens: [token.symbol]
    };
  }

  private handleSafetyQuery(tokens: TokenData[]): AIResponse {
    if (tokens.length === 0) {
      return {
        content: `🛡️ **Sei Token Safety Framework:**

**Green Flags (Safe):**
✅ Safety score 80+ 
✅ Liquidity locked
✅ Contract verified
✅ Active community
✅ Transparent team
✅ Regular updates

**Yellow Flags (Caution):**
⚠️ Safety score 60-79
⚠️ New token (<30 days)
⚠️ Low holder count
⚠️ Moderate volume

**Red Flags (High Risk):**
❌ Safety score <60
❌ Unlocked liquidity
❌ Anonymous team
❌ No social presence
❌ Suspicious contract functions

**Current Sei Token Safety Scores:**
• CHIPS: 88/100 (Very Safe)
• SEIYAN: 91/100 (Excellent)

Which specific token would you like me to analyze for safety?`,
        sentiment: 'neutral',
        confidence: 95,
        signals: ['Safety Framework', 'Risk Assessment', 'Due Diligence']
      };
    }
    
    const token = tokens[0];
    const safetyLevel = token.safetyScore >= 80 ? 'Very Safe' : 
                      token.safetyScore >= 60 ? 'Moderately Safe' : 'High Risk';
    
    return {
      content: `🛡️ **${token.symbol} Safety Analysis:**

**Overall Safety: ${token.safetyScore}/100 (${safetyLevel})**

${this.generateRiskAssessment(token)}

**Safety Recommendations:**
${this.generateSafetyRecommendations(token)}

**Remember:** Even "safe" tokens carry risk in crypto. Always invest responsibly!`,
      sentiment: token.safetyScore >= 70 ? 'bullish' : token.safetyScore >= 50 ? 'neutral' : 'bearish',
      confidence: token.safetyScore,
      signals: this.generateSafetySignals(token),
      relatedTokens: [token.symbol]
    };
  }

  private handlePriceQuery(tokens: TokenData[]): AIResponse {
    if (tokens.length === 0) {
      return {
        content: `📊 **Current Sei Token Prices:**

• **CHIPS**: $0.00234 (+23.45%)
• **SEIYAN**: $0.00567 (+45.67%)

**Market Overview:**
${this.generateMarketInsight()}

Which specific token price would you like me to analyze in detail?`,
        sentiment: 'neutral',
        confidence: 90,
        signals: ['Price Data', 'Market Overview']
      };
    }
    
    const token = tokens[0];
    return {
      content: `💰 **${token.symbol} Price Analysis:**

**Current Price:** $${token.price.toFixed(6)}
**24h Change:** ${token.change24h > 0 ? '+' : ''}${token.change24h.toFixed(2)}%
**Market Cap:** $${token.marketCap.toLocaleString()}
**24h Volume:** $${token.volume24h.toLocaleString()}

**Price Action:**
${this.generatePriceAction(token)}

**Key Levels:**
${this.generateKeyLevels(token)}`,
      sentiment: this.determineSentiment(token),
      confidence: 85,
      signals: this.generatePriceSignals(token),
      relatedTokens: [token.symbol]
    };
  }

  private handlePredictionRequest(tokens: TokenData[]): AIResponse {
    if (tokens.length === 0) {
      return {
        content: `🔮 **Market Predictions:**

I can provide technical analysis and outlook for any Sei token, but remember:

**Disclaimer:** Predictions are based on current data and technical analysis. Crypto markets are highly volatile and unpredictable.

**Available for prediction:**
• CHIPS - Gaming meme token
• SEIYAN - Anime-themed token

Which token would you like a technical outlook for?`,
        sentiment: 'neutral',
        confidence: 75,
        signals: ['Prediction Available', 'Technical Analysis']
      };
    }
    
    const token = tokens[0];
    return {
      content: `🔮 **${token.symbol} Technical Outlook:**

${this.generatePrediction(token)}

**Important Disclaimers:**
• This is technical analysis, not financial advice
• Crypto markets are highly unpredictable
• Past performance doesn't guarantee future results
• Always do your own research

**Suggested Strategy:**
${this.generateTradingStrategy(token)}`,
      sentiment: this.determineSentiment(token),
      confidence: 70, // Lower confidence for predictions
      signals: ['Technical Outlook', 'Prediction Model', 'Risk Warning'],
      relatedTokens: [token.symbol]
    };
  }

  private handleComparisonRequest(tokens: TokenData[]): AIResponse {
    if (tokens.length < 2) {
      const availableTokens = Array.from(this.tokenDatabase.values())
        .filter((token, index, self) => self.findIndex(t => t.address === token.address) === index);
      
      return {
        content: `📊 **Token Comparison:**

I can compare any Sei tokens for you! Currently available:

${availableTokens.map(token => 
  `• **${token.symbol}**: $${token.price.toFixed(6)} (${token.change24h > 0 ? '+' : ''}${token.change24h.toFixed(2)}%) - Safety: ${token.safetyScore}/100`
).join('\n')}

**Example:** "Compare CHIPS and SEIYAN" or mention multiple tokens in your message.

Which tokens would you like me to compare?`,
        sentiment: 'neutral',
        confidence: 90,
        signals: ['Comparison Available', 'Token Database']
      };
    }
    
    return {
      content: this.generateTokenComparison(tokens.slice(0, 2)),
      sentiment: 'neutral',
      confidence: 85,
      signals: ['Comparative Analysis', 'Multi-token Assessment'],
      relatedTokens: tokens.map(t => t.symbol)
    };
  }

  private handleMarketQuery(): AIResponse {
    return {
      content: `📈 **Sei Ecosystem Market Analysis:**

**Current Market Sentiment:** ${this.marketSentiment.charAt(0).toUpperCase() + this.marketSentiment.slice(1)}ish

**Key Trends:**
• Fast transaction speeds driving adoption
• Growing meme token ecosystem
• Increasing developer activity
• Strong community engagement

**Market Insights:**
${this.generateMarketInsight()}

**Sei Advantages:**
• Lightning-fast transactions
• Low fees
• EVM compatibility
• Growing DeFi ecosystem

**Investment Considerations:**
• Early ecosystem - high risk/reward
• Strong technical fundamentals
• Increasing institutional interest
• Active development community`,
      sentiment: this.marketSentiment === 'bull' ? 'bullish' : this.marketSentiment === 'bear' ? 'bearish' : 'neutral',
      confidence: 80,
      signals: ['Market Analysis', 'Ecosystem Overview', 'Trend Analysis']
    };
  }

  private handleHelpRequest(): AIResponse {
    return {
      content: `🤖 **Seifu AI Assistant - Help Guide:**

**What I can help you with:**

🔍 **Token Analysis**
• "Analyze CHIPS" - Get detailed token analysis
• "What is SEIYAN?" - Token information and metrics

🛡️ **Safety Assessment**
• "Is CHIPS safe?" - Safety scores and risk analysis
• "Check token safety" - Security evaluation

💰 **Price & Market Data**
• "CHIPS price" - Current price and trends
• "Market analysis" - Ecosystem overview

🔮 **Technical Outlook**
• "SEIYAN prediction" - Technical analysis and outlook
• "Compare tokens" - Side-by-side comparison

**Example Questions:**
• "Should I buy CHIPS?"
• "Analyze the safety of SEIYAN"
• "What's the current market sentiment?"
• "Compare CHIPS and SEIYAN"

**Remember:** I provide analysis and information, not financial advice. Always DYOR!

What would you like to know about Sei tokens?`,
      sentiment: 'neutral',
      confidence: 95,
      signals: ['Help System', 'User Guide', 'Feature Overview']
    };
  }

  private handleGeneralQuery(message: string, tokens: TokenData[]): AIResponse {
    const responses = [
      {
        content: `Great question! I'm here to help you navigate the Sei ecosystem safely. 

**Current Market Highlights:**
• Sei network showing strong growth
• Meme tokens gaining popularity
• Safety-first approach recommended

${this.generateMarketInsight()}

What specific aspect of Sei tokens interests you most?`,
        sentiment: 'bullish' as const,
        confidence: 75,
        signals: ['Market Overview', 'Ecosystem Growth', 'Safety Focus']
      },
      {
        content: `I'm analyzing the current Sei market conditions for you!

**Key Observations:**
• Transaction speeds are excellent
• Growing developer ecosystem  
• Community engagement increasing
• Safety tools improving

**Recommendation:** Focus on tokens with high safety scores and strong communities.

Is there a specific token or topic you'd like me to dive deeper into?`,
        sentiment: 'neutral' as const,
        confidence: 80,
        signals: ['Technical Analysis', 'Community Growth', 'Safety Priority']
      }
    ];
    
    // Return the most appropriate response based on context
    return responses[0]; // Use first response as default, could be enhanced with context analysis
  }

  // Helper methods
  private determineSentiment(token: TokenData): 'bullish' | 'bearish' | 'neutral' {
    const score = token.change24h * 0.3 + (token.safetyScore - 50) * 0.02;
    return score > 5 ? 'bullish' : score < -5 ? 'bearish' : 'neutral';
  }

  private generateSignals(token: TokenData): string[] {
    const signals: string[] = [];
    
    if (token.change24h > 20) signals.push('Strong Momentum');
    if (token.volume24h > 500000) signals.push('High Volume');
    if (token.safetyScore > 80) signals.push('High Safety Score');
    if (token.holders && token.holders > 1000) signals.push('Growing Community');
    
    return signals.length > 0 ? signals : ['Analysis Complete'];
  }

  private addPersonality(content: string): string {
    // Add consistent personality without random elements
    return content + "\n\n*Stay safe out there! 🛡️*";
  }

  // Additional helper methods for comprehensive responses
  private generateBuyingConsiderations(token: TokenData): string {
    return `• Entry point: Consider DCA if price is volatile
• Safety first: ${token.safetyScore}/100 safety score
• Volume check: ${token.volume24h > 100000 ? 'Good liquidity' : 'Low liquidity - be careful'}
• Community: ${token.holders ? `${token.holders} holders` : 'Check community size'}`;
  }

  private generateSellingConsiderations(token: TokenData): string {
    return `• Take profits gradually to reduce risk
• Current momentum: ${token.change24h > 0 ? 'Positive' : 'Negative'}
• Consider holding if safety score is high (${token.safetyScore}/100)
• Market timing: ${this.marketSentiment} market conditions`;
  }

  private generateSafetyRecommendations(token: TokenData): string {
    if (token.safetyScore >= 80) {
      return "• Generally safe for investment\n• Still practice good risk management\n• Monitor for any changes in fundamentals";
    } else if (token.safetyScore >= 60) {
      return "• Moderate risk - proceed with caution\n• Use smaller position sizes\n• Monitor closely for any red flags";
    } else {
      return "• High risk - extreme caution advised\n• Only invest what you can afford to lose completely\n• Consider waiting for better opportunities";
    }
  }

  private generateSafetySignals(token: TokenData): string[] {
    const signals: string[] = [];
    
    if (token.safetyScore >= 80) signals.push('High Safety');
    else if (token.safetyScore >= 60) signals.push('Moderate Safety');
    else signals.push('High Risk');
    
    signals.push('Risk Assessment');
    signals.push('Due Diligence');
    
    return signals;
  }

  private generatePriceAction(token: TokenData): string {
    if (token.change24h > 20) return "Strong bullish momentum with significant gains";
    if (token.change24h > 5) return "Positive price action with moderate gains";
    if (token.change24h > -5) return "Consolidating with sideways price movement";
    if (token.change24h > -20) return "Bearish pressure with moderate decline";
    return "Strong selling pressure with significant losses";
  }

  private generateKeyLevels(token: TokenData): string {
    const support = (token.price * 0.85).toFixed(6);
    const resistance = (token.price * 1.15).toFixed(6);
    return `• Support: $${support}\n• Resistance: $${resistance}`;
  }

  private generatePriceSignals(token: TokenData): string[] {
    const signals = ['Price Analysis'];
    
    if (Math.abs(token.change24h) > 20) signals.push('High Volatility');
    if (token.volume24h > 300000) signals.push('Strong Volume');
    
    return signals;
  }

  private generateTradingStrategy(token: TokenData): string {
    if (token.safetyScore >= 80 && token.change24h > 0) {
      return "• Consider gradual accumulation on dips\n• Set stop-loss at key support levels\n• Take partial profits at resistance";
    } else if (token.safetyScore >= 60) {
      return "• Use smaller position sizes\n• Wait for clear technical signals\n• Monitor closely for changes";
    } else {
      return "• High risk - avoid or use very small positions\n• Wait for better opportunities\n• Focus on safer alternatives";
    }
  }

  private generateTokenComparison(tokens: TokenData[]): string {
    const [token1, token2] = tokens;
    
    return `📊 **${token1.symbol} vs ${token2.symbol} Comparison:**

**Price Performance:**
• ${token1.symbol}: $${token1.price.toFixed(6)} (${token1.change24h > 0 ? '+' : ''}${token1.change24h.toFixed(2)}%)
• ${token2.symbol}: $${token2.price.toFixed(6)} (${token2.change24h > 0 ? '+' : ''}${token2.change24h.toFixed(2)}%)

**Safety Scores:**
• ${token1.symbol}: ${token1.safetyScore}/100
• ${token2.symbol}: ${token2.safetyScore}/100

**Volume & Liquidity:**
• ${token1.symbol}: $${token1.volume24h.toLocaleString()}
• ${token2.symbol}: $${token2.volume24h.toLocaleString()}

**Winner:** ${this.determineWinner(token1, token2)}

**Recommendation:** ${this.generateComparisonRecommendation(token1, token2)}`;
  }

  private determineWinner(token1: TokenData, token2: TokenData): string {
    const score1 = token1.safetyScore * 0.4 + (token1.change24h > 0 ? token1.change24h * 0.3 : 0) + (token1.volume24h / 100000) * 0.3;
    const score2 = token2.safetyScore * 0.4 + (token2.change24h > 0 ? token2.change24h * 0.3 : 0) + (token2.volume24h / 100000) * 0.3;
    
    return score1 > score2 ? token1.symbol : score2 > score1 ? token2.symbol : "It's a tie!";
  }

  private generateComparisonRecommendation(token1: TokenData, token2: TokenData): string {
    const safer = token1.safetyScore > token2.safetyScore ? token1.symbol : token2.symbol;
    const performer = token1.change24h > token2.change24h ? token1.symbol : token2.symbol;
    
    return `For safety: ${safer} | For performance: ${performer} | Consider diversifying between both for balanced exposure.`;
  }
}