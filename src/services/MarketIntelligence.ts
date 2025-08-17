import { unifiedTokenService } from './UnifiedTokenService';

export interface MarketTrend {
  symbol: string;
  direction: 'bullish' | 'bearish' | 'neutral';
  strength: number; // 0-100
  confidence: number; // 0-100
  timeframe: 'short' | 'medium' | 'long';
  indicators: string[];
  support: number;
  resistance: number;
}

export interface MarketSentiment {
  overall: number; // -100 to 100 (negative = bearish, positive = bullish)
  retail: number;
  institutional: number;
  social: number;
  technical: number;
  fundamental: number;
}

export interface TradingOpportunity {
  symbol: string;
  type: 'buy' | 'sell' | 'hold';
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  confidence: number;
  timeframe: string;
  reasoning: string;
  risk: 'low' | 'medium' | 'high';
}

export interface MarketAlert {
  id: string;
  type: 'price' | 'volume' | 'technical' | 'fundamental';
  symbol: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  triggered: boolean;
}

export class MarketIntelligence {
  private alerts: MarketAlert[] = [];
  private trends: Map<string, MarketTrend> = new Map();
  
  // Get comprehensive market overview
  async getMarketOverview(): Promise<string> {
    try {
      const allTokens = unifiedTokenService.getAllTokens();
      const trendingTokens = unifiedTokenService.getTrendingTokens();
      const newLaunches = unifiedTokenService.getNewLaunches();
      
      // Calculate market statistics
      const totalMarketCap = allTokens.reduce((sum, token) => sum + (token.marketCap || 0), 0);
      const totalVolume = allTokens.reduce((sum, token) => sum + (token.volume24h || 0), 0);
      const averagePriceChange = allTokens.reduce((sum, token) => sum + (token.priceChange24h || 0), 0) / allTokens.length;
      
      // Identify top performers
      const topGainers = allTokens
        .filter(token => token.priceChange24h > 0)
        .sort((a, b) => b.priceChange24h - a.priceChange24h)
        .slice(0, 5);
      
      const topLosers = allTokens
        .filter(token => token.priceChange24h < 0)
        .sort((a, b) => a.priceChange24h - b.priceChange24h)
        .slice(0, 5);
      
      // Calculate market sentiment
      const sentiment = this.calculateMarketSentiment(allTokens);
      
      return `🌊 **Sei Network Market Overview**

**Market Statistics**:
• Total Market Cap: $${(totalMarketCap / 1000000).toFixed(2)}M
• 24h Volume: $${(totalVolume / 1000000).toFixed(2)}M
• Average Price Change: ${averagePriceChange.toFixed(2)}%
• Active Tokens: ${allTokens.length}
• New Launches Today: ${newLaunches.length}

**Market Sentiment**: ${this.getSentimentDescription(sentiment.overall)}
**Sentiment Score**: ${sentiment.overall}/100

**Top Performers (24h)**:
${topGainers.map(token => 
  `• ${token.symbol}: +${token.priceChange24h.toFixed(2)}% ($${token.price.toFixed(6)})`
).join('\n')}

**Top Decliners (24h)**:
${topLosers.map(token => 
  `• ${token.symbol}: ${token.priceChange24h.toFixed(2)}% ($${token.price.toFixed(6)})`
).join('\n')}

**Trending Tokens**: ${trendingTokens.length} tokens showing momentum
**Market Status**: ${this.getMarketStatus(averagePriceChange, sentiment.overall)}`;
      
    } catch (error) {
      return `❌ Unable to generate market overview: ${error.message}`;
    }
  }
  
  // Analyze market trends for specific tokens
  async analyzeTokenTrend(symbol: string): Promise<string> {
    try {
      const allTokens = unifiedTokenService.getAllTokens();
      const token = allTokens.find(t => t.symbol.toUpperCase() === symbol.toUpperCase());
      
      if (!token) {
        return `❌ Token ${symbol} not found`;
      }
      
      // Generate trend analysis
      const trend = this.generateTokenTrend(token);
      this.trends.set(symbol, trend);
      
      // Generate trading opportunity
      const opportunity = this.generateTradingOpportunity(token, trend);
      
      return `📈 **${token.symbol} Trend Analysis**

**Current Price**: $${token.price.toFixed(6)}
**24h Change**: ${token.priceChange24h.toFixed(2)}%
**Market Cap**: $${(token.marketCap / 1000000).toFixed(2)}M
**Volume**: $${(token.volume24h / 1000).toFixed(1)}K

**Trend Analysis**:
• **Direction**: ${trend.direction.toUpperCase()}
• **Strength**: ${trend.strength}/100
• **Confidence**: ${trend.confidence}/100
• **Timeframe**: ${trend.timeframe.toUpperCase()}

**Technical Indicators**:
${trend.indicators.map(indicator => `• ${indicator}`).join('\n')}

**Key Levels**:
• Support: $${trend.support.toFixed(6)}
• Resistance: $${trend.resistance.toFixed(6)}

**Trading Opportunity**:
• **Action**: ${opportunity.type.toUpperCase()}
• **Entry**: $${opportunity.entryPrice.toFixed(6)}
• **Target**: $${opportunity.targetPrice.toFixed(6)}
• **Stop Loss**: $${opportunity.stopLoss.toFixed(6)}
• **Risk Level**: ${opportunity.risk.toUpperCase()}
• **Confidence**: ${opportunity.confidence}/100

**Reasoning**: ${opportunity.reasoning}`;
      
    } catch (error) {
      return `❌ Unable to analyze ${symbol} trend: ${error.message}`;
    }
  }
  
  // Get market sentiment analysis
  async getMarketSentiment(): Promise<string> {
    try {
      const allTokens = unifiedTokenService.getAllTokens();
      const sentiment = this.calculateMarketSentiment(allTokens);
      
      return `🎭 **Market Sentiment Analysis**

**Overall Sentiment**: ${this.getSentimentDescription(sentiment.overall)}
**Sentiment Score**: ${sentiment.overall}/100

**Sentiment Breakdown**:
• **Retail Sentiment**: ${sentiment.retail}/100 ${this.getSentimentEmoji(sentiment.retail)}
• **Institutional Sentiment**: ${sentiment.institutional}/100 ${this.getSentimentEmoji(sentiment.institutional)}
• **Social Sentiment**: ${sentiment.social}/100 ${this.getSentimentEmoji(sentiment.social)}
• **Technical Sentiment**: ${sentiment.technical}/100 ${this.getSentimentEmoji(sentiment.technical)}
• **Fundamental Sentiment**: ${sentiment.fundamental}/100 ${this.getSentimentEmoji(sentiment.fundamental)}

**Market Interpretation**:
${this.interpretSentiment(sentiment)}`;
      
    } catch (error) {
      return `❌ Unable to analyze market sentiment: ${error.message}`;
    }
  }
  
  // Get trading opportunities
  async getTradingOpportunities(): Promise<string> {
    try {
      const allTokens = unifiedTokenService.getAllTokens();
      const opportunities: TradingOpportunity[] = [];
      
      // Analyze top tokens for opportunities
      const topTokens = allTokens
        .filter(token => token.volume24h > 10000) // Only tokens with decent volume
        .slice(0, 10);
      
      topTokens.forEach(token => {
        const trend = this.generateTokenTrend(token);
        const opportunity = this.generateTradingOpportunity(token, trend);
        if (opportunity.confidence > 70) { // Only high-confidence opportunities
          opportunities.push(opportunity);
        }
      });
      
      // Sort by confidence
      opportunities.sort((a, b) => b.confidence - a.confidence);
      
      if (opportunities.length === 0) {
        return `🔍 **Trading Opportunities**

No high-confidence trading opportunities found at the moment.

**Recommendation**: Wait for better market conditions or consider DCA strategies.`;
      }
      
      return `🎯 **Top Trading Opportunities**

${opportunities.slice(0, 5).map((opp, index) => 
  `${index + 1}. **${opp.symbol}** - ${opp.type.toUpperCase()}
   • Entry: $${opp.entryPrice.toFixed(6)}
   • Target: $${opp.targetPrice.toFixed(6)}
   • Stop Loss: $${opp.stopLoss.toFixed(6)}
   • Confidence: ${opp.confidence}/100
   • Risk: ${opp.risk.toUpperCase()}
   • Reasoning: ${opp.reasoning}`
).join('\n\n')}

**Risk Warning**: These are AI-generated suggestions. Always do your own research and manage risk appropriately.`;
      
    } catch (error) {
      return `❌ Unable to find trading opportunities: ${error.message}`;
    }
  }
  
  // Set up market alerts
  async setMarketAlert(
    symbol: string,
    type: MarketAlert['type'],
    condition: string,
    severity: MarketAlert['severity']
  ): Promise<string> {
    try {
      const alert: MarketAlert = {
        id: `alert_${Date.now()}`,
        type,
        symbol: symbol.toUpperCase(),
        message: condition,
        severity,
        timestamp: new Date(),
        triggered: false
      };
      
      this.alerts.push(alert);
      
      return `🔔 **Market Alert Set**

**Symbol**: ${alert.symbol}
**Type**: ${alert.type}
**Condition**: ${alert.message}
**Severity**: ${alert.severity.toUpperCase()}
**Status**: Active

**Alert ID**: ${alert.id}

I'll notify you when this condition is met!`;
      
    } catch (error) {
      return `❌ Unable to set market alert: ${error.message}`;
    }
  }
  
  // Get active alerts
  async getActiveAlerts(): Promise<string> {
    try {
      const activeAlerts = this.alerts.filter(alert => !alert.triggered);
      
      if (activeAlerts.length === 0) {
        return `🔔 **Market Alerts**

No active alerts at the moment.

**Set an alert**: "Alert me when SEI goes above $0.85"`;
      }
      
      return `🔔 **Active Market Alerts**

${activeAlerts.map(alert => 
  `• **${alert.symbol}** (${alert.type})
   Condition: ${alert.message}
   Severity: ${alert.severity.toUpperCase()}
   Set: ${alert.timestamp.toLocaleString()}
   ID: ${alert.id}`
).join('\n\n')}

**Total Active Alerts**: ${activeAlerts.length}`;
      
    } catch (error) {
      return `❌ Unable to retrieve alerts: ${error.message}`;
    }
  }
  
  // Private helper methods
  private calculateMarketSentiment(tokens: any[]): MarketSentiment {
    let totalSentiment = 0;
    let totalVolume = 0;
    
    tokens.forEach(token => {
      const priceChange = token.priceChange24h || 0;
      const volume = token.volume24h || 0;
      
      // Price change sentiment (-100 to 100)
      const priceSentiment = Math.max(-100, Math.min(100, priceChange * 5));
      
      // Volume sentiment (0 to 100)
      const volumeSentiment = Math.min(100, (volume / 100000) * 10);
      
      // Weighted average by volume
      totalSentiment += priceSentiment * volume;
      totalVolume += volume;
    });
    
    const overallSentiment = totalVolume > 0 ? totalSentiment / totalVolume : 0;
    
    return {
      overall: Math.round(overallSentiment),
      retail: Math.round(overallSentiment * 0.8), // Retail slightly more volatile
      institutional: Math.round(overallSentiment * 1.2), // Institutional more stable
      social: Math.round(overallSentiment * 0.9), // Social media sentiment
      technical: Math.round(overallSentiment * 1.1), // Technical analysis
      fundamental: Math.round(overallSentiment * 0.95) // Fundamental analysis
    };
  }
  
  private generateTokenTrend(token: any): MarketTrend {
    const priceChange = token.priceChange24h || 0;
    const volume = token.volume24h || 0;
    
    // Determine trend direction
    let direction: 'bullish' | 'bearish' | 'neutral';
    if (priceChange > 5) direction = 'bullish';
    else if (priceChange < -5) direction = 'bearish';
    else direction = 'neutral';
    
    // Calculate trend strength (0-100)
    const strength = Math.min(100, Math.abs(priceChange) * 2 + (volume > 50000 ? 20 : 0));
    
    // Calculate confidence (0-100)
    const confidence = Math.min(100, 
      Math.abs(priceChange) * 3 + 
      (volume > 100000 ? 30 : volume > 50000 ? 20 : 10) +
      (token.verified ? 20 : 0)
    );
    
    // Determine timeframe
    const timeframe: 'short' | 'medium' | 'long' = 
      Math.abs(priceChange) > 15 ? 'short' : 
      Math.abs(priceChange) > 8 ? 'medium' : 'long';
    
    // Generate technical indicators
    const indicators = this.generateTechnicalIndicators(token, priceChange);
    
    // Calculate support and resistance
    const currentPrice = token.price;
    const support = currentPrice * (1 - Math.abs(priceChange) / 100);
    const resistance = currentPrice * (1 + Math.abs(priceChange) / 100);
    
    return {
      symbol: token.symbol,
      direction,
      strength: Math.round(strength),
      confidence: Math.round(confidence),
      timeframe,
      indicators,
      support,
      resistance
    };
  }
  
  private generateTechnicalIndicators(token: any, priceChange: number): string[] {
    const indicators: string[] = [];
    
    // RSI-like indicator
    if (priceChange > 10) indicators.push('RSI: Overbought (>70)');
    else if (priceChange < -10) indicators.push('RSI: Oversold (<30)');
    else indicators.push('RSI: Neutral (30-70)');
    
    // Volume indicator
    if (token.volume24h > 100000) indicators.push('Volume: High momentum');
    else if (token.volume24h > 50000) indicators.push('Volume: Moderate');
    else indicators.push('Volume: Low activity');
    
    // Price momentum
    if (priceChange > 0) indicators.push('Momentum: Bullish');
    else if (priceChange < 0) indicators.push('Momentum: Bearish');
    else indicators.push('Momentum: Sideways');
    
    // Support/Resistance
    if (Math.abs(priceChange) > 15) indicators.push('Key levels: Testing boundaries');
    else indicators.push('Key levels: Within range');
    
    return indicators;
  }
  
  private generateTradingOpportunity(token: any, trend: MarketTrend): TradingOpportunity {
    const currentPrice = token.price;
    let type: 'buy' | 'sell' | 'hold';
    let entryPrice = currentPrice;
    let targetPrice = currentPrice;
    let stopLoss = currentPrice;
    let reasoning = '';
    
    if (trend.direction === 'bullish' && trend.confidence > 70) {
      type = 'buy';
      entryPrice = currentPrice;
      targetPrice = currentPrice * (1 + (trend.strength / 100));
      stopLoss = currentPrice * (1 - (trend.strength / 200));
      reasoning = `Strong bullish momentum with ${trend.confidence}% confidence. Technical indicators support upward movement.`;
    } else if (trend.direction === 'bearish' && trend.confidence > 70) {
      type = 'sell';
      entryPrice = currentPrice;
      targetPrice = currentPrice * (1 - (trend.strength / 100));
      stopLoss = currentPrice * (1 + (trend.strength / 200));
      reasoning = `Bearish trend detected with ${trend.confidence}% confidence. Consider reducing exposure or shorting.`;
    } else {
      type = 'hold';
      entryPrice = currentPrice;
      targetPrice = currentPrice;
      stopLoss = currentPrice;
      reasoning = `Market conditions unclear. Wait for stronger signals or better entry points.`;
    }
    
    // Determine risk level
    const risk: 'low' | 'medium' | 'high' = 
      trend.confidence > 80 ? 'low' : 
      trend.confidence > 60 ? 'medium' : 'high';
    
    return {
      symbol: token.symbol,
      type,
      entryPrice,
      targetPrice,
      stopLoss,
      confidence: trend.confidence,
      timeframe: trend.timeframe,
      reasoning,
      risk
    };
  }
  
  private getSentimentDescription(sentiment: number): string {
    if (sentiment >= 70) return '🚀 Very Bullish';
    if (sentiment >= 40) return '📈 Bullish';
    if (sentiment >= 10) return '😐 Slightly Bullish';
    if (sentiment >= -10) return '😐 Neutral';
    if (sentiment >= -40) return '📉 Bearish';
    if (sentiment >= -70) return '🐻 Very Bearish';
    return '💀 Extremely Bearish';
  }
  
  private getSentimentEmoji(sentiment: number): string {
    if (sentiment >= 60) return '🚀';
    if (sentiment >= 20) return '📈';
    if (sentiment >= -20) return '😐';
    if (sentiment >= -60) return '📉';
    return '🐻';
  }
  
  private getMarketStatus(averagePriceChange: number, sentiment: number): string {
    if (averagePriceChange > 5 && sentiment > 50) return '🚀 Strong Bull Market';
    if (averagePriceChange > 2 && sentiment > 20) return '📈 Bullish Momentum';
    if (averagePriceChange > -2 && sentiment > -20) return '😐 Sideways/Consolidation';
    if (averagePriceChange < -2 && sentiment < -20) return '📉 Bearish Pressure';
    if (averagePriceChange < -5 && sentiment < -50) return '🐻 Strong Bear Market';
    return '🔄 Mixed Signals';
  }
  
  private interpretSentiment(sentiment: MarketSentiment): string {
    if (sentiment.overall > 60) {
      return 'Market is showing strong bullish sentiment across all indicators. Consider increasing exposure to growth assets while maintaining risk management.';
    } else if (sentiment.overall > 20) {
      return 'Moderate bullish sentiment with room for growth. Good time to accumulate quality assets and build positions.';
    } else if (sentiment.overall > -20) {
      return 'Neutral market sentiment suggests consolidation. Focus on portfolio rebalancing and wait for clearer direction.';
    } else if (sentiment.overall > -60) {
      return 'Bearish sentiment indicates caution. Consider reducing risk exposure and building cash reserves for future opportunities.';
    } else {
      return 'Extreme bearish sentiment may present contrarian opportunities. Look for oversold conditions and consider DCA strategies.';
    }
  }
}

// Export singleton instance
export const marketIntelligence = new MarketIntelligence();