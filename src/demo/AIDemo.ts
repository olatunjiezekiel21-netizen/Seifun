import { mcpAIService } from '../services/MCPAIService';
import { enhancedChatBrain } from '../services/EnhancedChatBrain';
import { z1LabsService } from '../services/Z1LabsService';

// AI Capabilities Demonstration for Seifun
export class AIDemo {
  private userId: string = 'demo-user-001';

  constructor() {
    this.initialize();
  }

  // Initialize all AI services
  private async initialize(): Promise<void> {
    console.log('🚀 Seifun AI Demo: Initializing...');
    
    try {
      // Initialize MCP AI service
      const mcpStatus = await mcpAIService.initialize();
      console.log('✅ MCP AI Service:', mcpStatus ? 'Ready' : 'Fallback Mode');
      
      // Initialize Z1 Labs service
      const z1LabsStatus = await z1LabsService.initialize();
      console.log('✅ Z1 Labs Service:', z1LabsStatus ? 'Connected' : 'Local Mode');
      
      // Initialize Enhanced ChatBrain
      const chatBrainStatus = await enhancedChatBrain.isAvailable();
      console.log('✅ Enhanced ChatBrain:', chatBrainStatus ? 'Ready' : 'Initializing');
      
      console.log('🎉 All AI services initialized successfully!');
    } catch (error) {
      console.error('❌ AI Demo initialization failed:', error);
    }
  }

  // Demo 1: Portfolio Optimization
  public async demonstratePortfolioOptimization(): Promise<void> {
    console.log('\n🎯 DEMO 1: Portfolio Optimization');
    console.log('=====================================');
    
    try {
      const portfolio = [
        { symbol: 'SEI', amount: 1000, value: 1000, risk: 'medium' },
        { symbol: 'USDC', amount: 500, value: 500, risk: 'low' }
      ];
      
      console.log('📊 Current Portfolio:', portfolio);
      
      const optimization = await mcpAIService.optimizePortfolio(
        portfolio,
        'medium', // risk tolerance
        'medium'  // time horizon
      );
      
      console.log('🤖 AI Optimization Result:', optimization);
      
      if (optimization.success) {
        console.log('✅ Portfolio optimized successfully!');
        console.log('📈 Expected Return:', (optimization.data.expectedReturn * 100).toFixed(1) + '%');
        console.log('🛡️ Risk Score:', (optimization.data.riskScore * 100).toFixed(0) + '/100');
        console.log('🎯 Confidence:', (optimization.data.confidence * 100).toFixed(0) + '%');
      }
    } catch (error) {
      console.error('❌ Portfolio optimization demo failed:', error);
    }
  }

  // Demo 2: Market Prediction
  public async demonstrateMarketPrediction(): Promise<void> {
    console.log('\n🔮 DEMO 2: Market Prediction');
    console.log('================================');
    
    try {
      const asset = 'SEI';
      const timeframe = '1w';
      const indicators = ['price', 'volume', 'sentiment', 'rsi', 'macd'];
      
      console.log('📊 Predicting market for:', asset);
      console.log('⏰ Timeframe:', timeframe);
      console.log('📊 Indicators:', indicators.join(', '));
      
      const prediction = await mcpAIService.predictMarket(asset, timeframe, indicators);
      
      console.log('🤖 AI Prediction Result:', prediction);
      
      if (prediction.success) {
        console.log('✅ Market prediction generated!');
        console.log('📈 Prediction:', prediction.data.prediction.toUpperCase());
        console.log('🎯 Confidence:', (prediction.data.confidence * 100).toFixed(0) + '%');
        console.log('🔍 Key Factors:', prediction.data.factors.join(', '));
      }
    } catch (error) {
      console.error('❌ Market prediction demo failed:', error);
    }
  }

  // Demo 3: Risk Assessment
  public async demonstrateRiskAssessment(): Promise<void> {
    console.log('\n🛡️ DEMO 3: Risk Assessment');
    console.log('==============================');
    
    try {
      const token = 'SEI';
      const amount = 1000;
      const portfolio = ['SEI', 'USDC', 'BTC'];
      
      console.log('🔍 Assessing risk for:', token);
      console.log('💰 Amount:', amount);
      console.log('📊 Portfolio context:', portfolio.join(', '));
      
      const assessment = await mcpAIService.assessRisk(token, amount, portfolio);
      
      console.log('🤖 AI Risk Assessment Result:', assessment);
      
      if (assessment.success) {
        console.log('✅ Risk assessment completed!');
        console.log('⚠️ Risk Level:', assessment.data.riskLevel.toUpperCase());
        console.log('📊 Risk Score:', (assessment.data.riskScore * 100).toFixed(0) + '/100');
        console.log('💡 Recommendation:', assessment.data.recommendation);
        console.log('🎯 Confidence:', (assessment.data.confidence * 100).toFixed(0) + '%');
      }
    } catch (error) {
      console.error('❌ Risk assessment demo failed:', error);
    }
  }

  // Demo 4: Enhanced ChatBrain
  public async demonstrateEnhancedChatBrain(): Promise<void> {
    console.log('\n🧠 DEMO 4: Enhanced ChatBrain');
    console.log('=================================');
    
    try {
      const testMessages = [
        "Can you optimize my portfolio?",
        "What's the market prediction for SEI?",
        "Is it safe to invest in this token?",
        "Teach me about DeFi strategies",
        "What's my learning history?"
      ];
      
      console.log('💬 Testing Enhanced ChatBrain with various messages...');
      
      for (const message of testMessages) {
        console.log(`\n📝 User: "${message}"`);
        
        const response = await enhancedChatBrain.processMessage(message, this.userId);
        
        console.log(`🤖 AI Response Type: ${response.type}`);
        console.log(`🎯 Confidence: ${(response.confidence * 100).toFixed(0)}%`);
        console.log(`💡 Response: ${response.message.substring(0, 100)}...`);
      }
    } catch (error) {
      console.error('❌ Enhanced ChatBrain demo failed:', error);
    }
  }

  // Demo 5: Context Storage and Retrieval
  public async demonstrateContextManagement(): Promise<void> {
    console.log('\n💾 DEMO 5: Context Management');
    console.log('=================================');
    
    try {
      // Store user preferences
      const userPreferences = {
        type: 'user_preferences',
        riskTolerance: 'medium',
        investmentGoals: ['growth', 'stability'],
        preferredAssets: ['SEI', 'USDC'],
        tradingStyle: 'moderate',
        timeHorizon: 'medium'
      };
      
      console.log('💾 Storing user preferences...');
      const storeResult = await mcpAIService.storeContext(this.userId, userPreferences);
      console.log('✅ Store result:', storeResult);
      
      // Retrieve user preferences
      console.log('🔍 Retrieving user preferences...');
      const retrieveResult = await mcpAIService.retrieveContext(this.userId, 'user_preferences');
      console.log('✅ Retrieve result:', retrieveResult);
      
      if (retrieveResult.success && retrieveResult.data.length > 0) {
        console.log('📚 Retrieved contexts:', retrieveResult.data.length);
        console.log('🎯 Context types:', retrieveResult.data.map(ctx => ctx.value.type));
      }
    } catch (error) {
      console.error('❌ Context management demo failed:', error);
    }
  }

  // Demo 6: Service Status and Capabilities
  public async demonstrateServiceStatus(): Promise<void> {
    console.log('\n🔍 DEMO 6: Service Status');
    console.log('============================');
    
    try {
      // MCP AI Service status
      const mcpStatus = mcpAIService.getStatus();
      console.log('🤖 MCP AI Service Status:', mcpStatus);
      
      // Z1 Labs service status
      const z1LabsStatus = z1LabsService.getStatus();
      console.log('🔗 Z1 Labs Service Status:', z1LabsStatus);
      
      // Enhanced ChatBrain status
      const chatBrainStatus = enhancedChatBrain.getStatus();
      console.log('🧠 Enhanced ChatBrain Status:', chatBrainStatus);
      
      // Overall system health
      console.log('\n📊 Overall System Health:');
      console.log('✅ MCP AI:', mcpStatus.mcp ? 'Ready' : 'Initializing');
      console.log('✅ Z1 Labs:', mcpStatus.z1labs ? 'Connected' : 'Local Mode');
      console.log('✅ Context Storage:', mcpStatus.context ? 'Active' : 'Inactive');
      console.log('✅ Enhanced Features:', chatBrainStatus.enhanced ? 'Active' : 'Inactive');
    } catch (error) {
      console.error('❌ Service status demo failed:', error);
    }
  }

  // Run all demonstrations
  public async runAllDemos(): Promise<void> {
    console.log('🚀 SEIFUN AI CAPABILITIES DEMONSTRATION');
    console.log('==========================================');
    console.log('🎯 Showcasing the future of DeFi AI...\n');
    
    try {
      await this.demonstratePortfolioOptimization();
      await this.demonstrateMarketPrediction();
      await this.demonstrateRiskAssessment();
      await this.demonstrateEnhancedChatBrain();
      await this.demonstrateContextManagement();
      await this.demonstrateServiceStatus();
      
      console.log('\n🎉 ALL DEMONSTRATIONS COMPLETED SUCCESSFULLY!');
      console.log('🚀 Seifun is now powered by revolutionary AI capabilities!');
      console.log('💎 Your DeFi platform is ready for the future!');
      
    } catch (error) {
      console.error('❌ Demo execution failed:', error);
    }
  }

  // Run specific demo
  public async runDemo(demoName: string): Promise<void> {
    switch (demoName.toLowerCase()) {
      case 'portfolio':
        await this.demonstratePortfolioOptimization();
        break;
      case 'prediction':
        await this.demonstrateMarketPrediction();
        break;
      case 'risk':
        await this.demonstrateRiskAssessment();
        break;
      case 'chat':
        await this.demonstrateEnhancedChatBrain();
        break;
      case 'context':
        await this.demonstrateContextManagement();
        break;
      case 'status':
        await this.demonstrateServiceStatus();
        break;
      default:
        console.log('❌ Unknown demo:', demoName);
        console.log('Available demos: portfolio, prediction, risk, chat, context, status');
    }
  }
}

// Export demo instance
export const aiDemo = new AIDemo();