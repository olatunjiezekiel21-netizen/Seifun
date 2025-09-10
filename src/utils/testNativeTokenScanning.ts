// Test script for native token scanning functionality
import { TokenScanner } from './tokenScanner';
import { nativeTokenAnalyzerService } from '../services/NativeTokenAnalyzerService';

export async function testNativeTokenScanning() {
  console.log('🧪 Testing Native Token Scanning...');
  
  const tokenScanner = new TokenScanner();
  
  // Test cases for different token types
  const testTokens = [
    'usei', // Native SEI token
    'ibc/...', // IBC token (placeholder)
    'sei1...', // CW20 token (placeholder)
  ];
  
  for (const token of testTokens) {
    try {
      console.log(`\n🔍 Testing token: ${token}`);
      
      // Test the main token scanner
      const analysis = await tokenScanner.analyzeToken(token);
      
      console.log('✅ Analysis completed:');
      console.log(`  - Name: ${analysis.basicInfo.name}`);
      console.log(`  - Symbol: ${analysis.basicInfo.symbol}`);
      console.log(`  - Risk Score: ${analysis.riskScore}`);
      console.log(`  - Risk Level: ${analysis.riskLevel}`);
      console.log(`  - Warnings: ${analysis.riskFactors.length}`);
      
    } catch (error) {
      console.error(`❌ Failed to analyze ${token}:`, error);
    }
  }
  
  // Test the enhanced analyzer service directly
  try {
    console.log('\n🔬 Testing Enhanced Analyzer Service...');
    
    const enhancedAnalysis = await nativeTokenAnalyzerService.analyzeTokenWithContract('usei');
    
    console.log('✅ Enhanced analysis completed:');
    console.log(`  - Name: ${enhancedAnalysis.name}`);
    console.log(`  - Symbol: ${enhancedAnalysis.symbol}`);
    console.log(`  - Risk Level: ${enhancedAnalysis.riskLevel}`);
    console.log(`  - Is Verified: ${enhancedAnalysis.isVerified}`);
    console.log(`  - Warnings: ${enhancedAnalysis.warnings.length}`);
    
  } catch (error) {
    console.error('❌ Enhanced analyzer test failed:', error);
  }
  
  console.log('\n🎉 Native token scanning tests completed!');
}

// Export for use in development
export default testNativeTokenScanning;