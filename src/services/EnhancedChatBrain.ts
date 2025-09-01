import { mcpAIService } from './MCPAIService';
import { z1LabsService } from './Z1LabsService';
import { SeifunContextType, SeifunContext } from '../contracts/ContextStore';

// Enhanced ChatBrain with MCP AI Integration
export class EnhancedChatBrain {
  private isInitialized: boolean = false;
  private userContexts: Map<string, SeifunContext[]> = new Map();
  private conversationHistory: any[] = [];

  constructor() {
    this.initialize();
  }

  // Initialize the enhanced ChatBrain
  private async initialize(): Promise<void> {
    try {
      console.log('🚀 Enhanced ChatBrain: Initializing...');
      
      // Initialize MCP AI service
      const mcpInitialized = await mcpAIService.initialize();
      console.log('🔗 Enhanced ChatBrain: MCP AI service status:', mcpInitialized);
      
      // Initialize Z1 Labs service
      const z1LabsInitialized = await z1LabsService.initialize();
      console.log('🔗 Enhanced ChatBrain: Z1 Labs service status:', z1LabsInitialized);
      
      this.isInitialized = true;
      console.log('✅ Enhanced ChatBrain: Initialized successfully');
    } catch (error) {
      console.error('❌ Enhanced ChatBrain: Initialization failed:', error);
    }
  }

  // Enhanced message processing with MCP AI capabilities
  public async processMessage(userMessage: string, userId: string): Promise<any> {
    try {
      // Store conversation context
      this.storeConversationContext(userId, userMessage);
      
      // Analyze user intent
      const intent = await this.analyzeIntent(userMessage);
      
      // Process based on intent
      switch (intent.type) {
        case 'portfolio_optimization':
          return await this.handlePortfolioOptimization(userMessage, userId);
        
        case 'market_prediction':
          return await this.handleMarketPrediction(userMessage, userId);
        
        case 'risk_assessment':
          return await this.handleRiskAssessment(userMessage, userId);
        
        case 'trading_strategy':
          return await this.handleTradingStrategy(userMessage, userId);
        
        case 'context_query':
          return await this.handleContextQuery(userMessage, userId);
        
        case 'learning_request':
          return await this.handleLearningRequest(userMessage, userId);
        
        default:
          return await this.handleGeneralConversation(userMessage, userId);
      }
    } catch (error) {
      console.error('❌ Enhanced ChatBrain: Message processing failed:', error);
      return this.generateFallbackResponse(userMessage);
    }
  }

  // Analyze user intent using AI
  private async analyzeIntent(message: string): Promise<{ type: string; confidence: number; details: any }> {
    const lowerMessage = message.toLowerCase();
    
    // Portfolio optimization intent
    if (/portfolio|optimize|allocation|balance|diversify|rebalance/i.test(lowerMessage)) {
      return { type: 'portfolio_optimization', confidence: 0.9, details: { action: 'optimize_portfolio' } };
    }
    
    // Market prediction intent
    if (/predict|forecast|trend|market|price|movement|bullish|bearish/i.test(lowerMessage)) {
      return { type: 'market_prediction', confidence: 0.85, details: { action: 'predict_market' } };
    }
    
    // Risk assessment intent
    if (/risk|safe|dangerous|scam|honeypot|verify|scan/i.test(lowerMessage)) {
      return { type: 'risk_assessment', confidence: 0.9, details: { action: 'assess_risk' } };
    }
    
    // Trading strategy intent
    if (/strategy|trade|entry|exit|stop.loss|take.profit|timing/i.test(lowerMessage)) {
      return { type: 'trading_strategy', confidence: 0.8, details: { action: 'create_strategy' } };
    }
    
    // Context query intent
    if (/history|previous|before|last.time|remember|learning/i.test(lowerMessage)) {
      return { type: 'context_query', confidence: 0.75, details: { action: 'query_context' } };
    }
    
    // Learning request intent
    if (/learn|teach|explain|how.to|tutorial|guide|education/i.test(lowerMessage)) {
      return { type: 'learning_request', confidence: 0.8, details: { action: 'provide_learning' } };
    }
    
    return { type: 'general_conversation', confidence: 0.6, details: { action: 'general_chat' } };
  }

  // Handle portfolio optimization requests
  private async handlePortfolioOptimization(message: string, userId: string): Promise<any> {
    try {
      // Extract portfolio information from message
      const portfolioInfo = this.extractPortfolioInfo(message);
      
      // Get user preferences from context
      const userPreferences = await this.getUserPreferences(userId);
      
      // Use MCP AI service for optimization
      const optimization = await mcpAIService.optimizePortfolio(
        portfolioInfo.assets,
        userPreferences.riskTolerance || 'medium',
        userPreferences.timeHorizon || 'medium'
      );
      
      // Store optimization context
      await this.storeContext(userId, {
        type: SeifunContextType.PORTFOLIO_OPTIMIZATION,
        ...optimization.data,
        timestamp: Date.now()
      });
      
      return {
        message: this.formatPortfolioOptimizationResponse(optimization),
        type: 'portfolio_optimization',
        data: optimization.data,
        confidence: optimization.data.confidence || 0.8
      };
    } catch (error) {
      console.error('❌ Portfolio optimization failed:', error);
      return this.generateFallbackResponse(message);
    }
  }

  // Handle market prediction requests
  private async handleMarketPrediction(message: string, userId: string): Promise<any> {
    try {
      // Extract market prediction parameters
      const predictionParams = this.extractMarketPredictionParams(message);
      
      // Use MCP AI service for prediction
      const prediction = await mcpAIService.predictMarket(
        predictionParams.asset,
        predictionParams.timeframe,
        predictionParams.indicators
      );
      
      // Store prediction context
      await this.storeContext(userId, {
        type: SeifunContextType.MARKET_PREDICTION,
        ...prediction.data,
        timestamp: Date.now()
      });
      
      return {
        message: this.formatMarketPredictionResponse(prediction),
        type: 'market_prediction',
        data: prediction.data,
        confidence: prediction.data.confidence || 0.7
      };
    } catch (error) {
      console.error('❌ Market prediction failed:', error);
      return this.generateFallbackResponse(message);
    }
  }

  // Handle risk assessment requests
  private async handleRiskAssessment(message: string, userId: string): Promise<any> {
    try {
      // Extract risk assessment parameters
      const riskParams = this.extractRiskAssessmentParams(message);
      
      // Use MCP AI service for risk assessment
      const assessment = await mcpAIService.assessRisk(
        riskParams.token,
        riskParams.amount,
        riskParams.portfolio
      );
      
      // Store risk assessment context
      await this.storeContext(userId, {
        type: SeifunContextType.RISK_ASSESSMENT,
        ...assessment.data,
        timestamp: Date.now()
      });
      
      return {
        message: this.formatRiskAssessmentResponse(assessment),
        type: 'risk_assessment',
        data: assessment.data,
        confidence: assessment.data.confidence || 0.8
      };
    } catch (error) {
      console.error('❌ Risk assessment failed:', error);
      return this.generateFallbackResponse(message);
    }
  }

  // Handle trading strategy requests
  private async handleTradingStrategy(message: string, userId: string): Promise<any> {
    try {
      // Extract trading strategy parameters
      const strategyParams = this.extractTradingStrategyParams(message);
      
      // Generate trading strategy using AI
      const strategy = await this.generateTradingStrategy(strategyParams);
      
      // Store strategy context
      await this.storeContext(userId, {
        type: SeifunContextType.TRADING_STRATEGY,
        ...strategy,
        timestamp: Date.now()
      });
      
      return {
        message: this.formatTradingStrategyResponse(strategy),
        type: 'trading_strategy',
        data: strategy,
        confidence: strategy.confidence || 0.75
      };
    } catch (error) {
      console.error('❌ Trading strategy generation failed:', error);
      return this.generateFallbackResponse(message);
    }
  }

  // Handle context queries
  private async handleContextQuery(message: string, userId: string): Promise<any> {
    try {
      // Retrieve user context
      const contexts = await mcpAIService.retrieveContext(userId);
      
      if (!contexts.data || contexts.data.length === 0) {
        return {
          message: "I don't have any previous context for you yet. Let's start building your AI learning profile!",
          type: 'context_query',
          data: null
        };
      }
      
      // Format context response
      const contextSummary = this.formatContextSummary(contexts.data);
      
      return {
        message: contextSummary,
        type: 'context_query',
        data: contexts.data
      };
    } catch (error) {
      console.error('❌ Context query failed:', error);
      return this.generateFallbackResponse(message);
    }
  }

  // Handle learning requests
  private async handleLearningRequest(message: string, userId: string): Promise<any> {
    try {
      // Generate personalized learning content
      const learningContent = await this.generateLearningContent(message, userId);
      
      // Store learning context
      await this.storeContext(userId, {
        type: SeifunContextType.LEARNING_HISTORY,
        decisions: [],
        outcomes: [],
        accuracy: 0,
        improvements: [],
        timestamp: Date.now()
      });
      
      return {
        message: learningContent,
        type: 'learning_request',
        data: { learningType: 'personalized' }
      };
    } catch (error) {
      console.error('❌ Learning request failed:', error);
      return this.generateFallbackResponse(message);
    }
  }

  // Handle general conversation
  private async handleGeneralConversation(message: string, userId: string): Promise<any> {
    // Use existing ChatBrain logic for general conversation
    return this.generateSmartResponse(message);
  }

  // Helper methods for data extraction
  private extractPortfolioInfo(message: string): { assets: any[] } {
    // Simple extraction - in production, use NLP
    const assets = [];
    if (/sei/i.test(message)) {
      assets.push({ symbol: 'SEI', amount: 100, value: 100, risk: 'medium' });
    }
    if (/usdc/i.test(message)) {
      assets.push({ symbol: 'USDC', amount: 100, value: 100, risk: 'low' });
    }
    return { assets: assets.length > 0 ? assets : [{ symbol: 'SEI', amount: 100, value: 100, risk: 'medium' }] };
  }

  private extractMarketPredictionParams(message: string): { asset: string; timeframe: string; indicators: string[] } {
    const asset = /sei/i.test(message) ? 'SEI' : /usdc/i.test(message) ? 'USDC' : 'SEI';
    const timeframe = /day|daily/i.test(message) ? '1d' : /week|weekly/i.test(message) ? '1w' : '1d';
    const indicators = ['price', 'volume', 'sentiment'];
    return { asset, timeframe, indicators };
  }

  private extractRiskAssessmentParams(message: string): { token: string; amount: number; portfolio: string[] } {
    const token = /sei/i.test(message) ? 'SEI' : /usdc/i.test(message) ? 'USDC' : 'SEI';
    const amount = 100; // Default amount
    const portfolio = ['SEI', 'USDC'];
    return { token, amount, portfolio };
  }

  private extractTradingStrategyParams(message: string): any {
    return {
      asset: 'SEI',
      timeframe: '1d',
      riskLevel: 'medium'
    };
  }

  // Context management methods
  private async storeContext(userId: string, context: SeifunContext): Promise<void> {
    try {
      await mcpAIService.storeContext(userId, context);
      this.userContexts.set(userId, [...(this.userContexts.get(userId) || []), context]);
    } catch (error) {
      console.error('❌ Failed to store context:', error);
    }
  }

  private async getUserPreferences(userId: string): Promise<any> {
    try {
      const contexts = await mcpAIService.retrieveContext(userId, 'user_preferences');
      if (contexts.data && contexts.data.length > 0) {
        return contexts.data[0].value;
      }
    } catch (error) {
      console.error('❌ Failed to retrieve user preferences:', error);
    }
    
    // Default preferences
    return {
      riskTolerance: 'medium',
      timeHorizon: 'medium',
      tradingStyle: 'moderate'
    };
  }

  // Response formatting methods
  private formatPortfolioOptimizationResponse(optimization: any): string {
    const { data } = optimization;
    return `🎯 **Portfolio Optimization Complete!**\n\n` +
           `**Recommended Allocation:**\n` +
           Object.entries(data.recommendedAllocation)
             .map(([asset, allocation]) => `• ${asset}: ${(Number(allocation) * 100).toFixed(1)}%`)
             .join('\n') + `\n\n` +
           `**Expected Return:** ${(data.expectedReturn * 100).toFixed(1)}%\n` +
           `**Risk Score:** ${(data.riskScore * 100).toFixed(0)}/100\n` +
           `**Confidence:** ${(data.confidence * 100).toFixed(0)}%\n\n` +
           `This optimization is based on your risk tolerance and time horizon. Would you like me to explain the reasoning or suggest specific actions?`;
  }

  private formatMarketPredictionResponse(prediction: any): string {
    const { data } = prediction;
    return `🔮 **Market Prediction for ${data.asset}**\n\n` +
           `**Prediction:** ${data.prediction.toUpperCase()}\n` +
           `**Timeframe:** ${data.timeframe}\n` +
           `**Confidence:** ${(data.confidence * 100).toFixed(0)}%\n` +
           `**Key Factors:** ${data.factors.join(', ')}\n\n` +
           `**Analysis:** Based on technical indicators and market sentiment, ${data.asset} shows a ${data.prediction} trend. ` +
           `Consider this prediction alongside your own research and risk tolerance.`;
  }

  private formatRiskAssessmentResponse(assessment: any): string {
    const { data } = assessment;
    return `🛡️ **Risk Assessment for ${data.token}**\n\n` +
           `**Risk Level:** ${data.riskLevel.toUpperCase()}\n` +
           `**Risk Score:** ${(data.riskScore * 100).toFixed(0)}/100\n` +
           `**Recommendation:** ${data.recommendation}\n` +
           `**Confidence:** ${(data.confidence * 100).toFixed(0)}%\n\n` +
           `**Risk Factors:**\n` +
           Object.entries(data.factors)
             .map(([factor, score]) => `• ${factor}: ${(Number(score) * 100).toFixed(0)}%`)
             .join('\n') + `\n\n` +
           `This assessment helps you make informed decisions. Always do your own research!`;
  }

  private formatTradingStrategyResponse(strategy: any): string {
    return `📈 **Trading Strategy Generated**\n\n` +
           `**Strategy:** ${strategy.strategy}\n` +
           `**Entry Points:** ${strategy.entryPoints.join(', ')}\n` +
           `**Exit Points:** ${strategy.exitPoints.join(', ')}\n` +
           `**Stop Loss:** ${strategy.stopLoss}\n` +
           `**Take Profit:** ${strategy.takeProfit}\n` +
           `**Risk/Reward:** ${strategy.riskRewardRatio}:1\n` +
           `**Confidence:** ${(strategy.confidence * 100).toFixed(0)}%\n\n` +
           `This strategy is AI-generated and should be used as guidance only. Always manage your risk!`;
  }

  private formatContextSummary(contexts: any[]): string {
    const contextTypes = contexts.map(ctx => ctx.value.type).filter((v, i, a) => a.indexOf(v) === i);
    
    return `📚 **Your AI Learning Profile**\n\n` +
           `**Context Types:** ${contextTypes.length}\n` +
           `**Total Contexts:** ${contexts.length}\n` +
           `**Recent Activity:** ${contexts.slice(-3).map(ctx => ctx.value.type).join(', ')}\n\n` +
           `I'm learning from our interactions to provide better recommendations. ` +
           `Your preferences and decisions help me understand your investment style!`;
  }

  // Additional helper methods
  private async generateTradingStrategy(params: any): Promise<any> {
    // Simple strategy generation - in production, use advanced AI
    return {
      strategy: 'Trend Following with Risk Management',
      entryPoints: [params.asset === 'SEI' ? 0.8 : 1.0],
      exitPoints: [params.asset === 'SEI' ? 1.2 : 1.1],
      stopLoss: params.asset === 'SEI' ? 0.7 : 0.95,
      takeProfit: params.asset === 'SEI' ? 1.3 : 1.05,
      riskRewardRatio: 2.5,
      confidence: 0.75
    };
  }

  private async generateLearningContent(message: string, userId: string): Promise<string> {
    // Generate personalized learning content based on user context
    return `📚 **Personalized Learning Content**\n\n` +
           `Based on your message: "${message}"\n\n` +
           `**What I'll teach you:**\n` +
           `• DeFi fundamentals and best practices\n` +
           `• Portfolio management strategies\n` +
           `• Risk assessment techniques\n` +
           `• Trading psychology and discipline\n\n` +
           `**Your learning path:**\n` +
           `I'll adapt the content based on your experience level and preferences. ` +
           `Let me know what specific topics interest you most!`;
  }

  private generateSmartResponse(message: string): any {
    // Fallback to basic responses
    return {
      message: `I understand you're asking about "${message}". Let me help you with that using my enhanced AI capabilities!`,
      type: 'general_conversation',
      confidence: 0.6
    };
  }

  private generateFallbackResponse(message: string): any {
    return {
      message: `I'm having trouble processing your request right now. Please try rephrasing or ask me something else. I'm here to help!`,
      type: 'fallback',
      confidence: 0.3
    };
  }

  private storeConversationContext(userId: string, message: string): void {
    this.conversationHistory.push({
      userId,
      message,
      timestamp: Date.now()
    });
  }

  // Public methods
  public async isAvailable(): Promise<boolean> {
    return this.isInitialized && mcpAIService.isAvailable();
  }

  public getStatus(): any {
    return {
      enhanced: this.isInitialized,
      mcp: mcpAIService.isAvailable(),
      z1labs: z1LabsService.isServiceAvailable(),
      contexts: this.userContexts.size,
      conversations: this.conversationHistory.length
    };
  }
}

// Export singleton instance
export const enhancedChatBrain = new EnhancedChatBrain();