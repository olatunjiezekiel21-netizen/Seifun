package integration_test

import (
	"context"
	"math/big"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"seifun/backend/seilor-agent"
	"seifun/backend/scanner"
)

// Integration test for dual-chain (EVM + Native) functionality
// This test verifies that all components work correctly across both Sei EVM and Sei Native environments

func TestDualChainIntegration(t *testing.T) {
	ctx := context.Background()

	// Setup dual-chain test environment
	testEnv := setupDualChainTestEnvironment(t)
	defer testEnv.Cleanup()

	t.Run("Test EVM and Native Token Analysis", func(t *testing.T) {
		// Test EVM token analysis
		evmScanner := testEnv.GetEVMTokenScanner()
		evmAnalysis, err := evmScanner.AnalyzeToken(ctx, "0x1234567890123456789012345678901234567890")
		require.NoError(t, err)

		// Verify EVM analysis
		assert.Equal(t, "EVM_TOKEN", evmAnalysis.Symbol)
		assert.Greater(t, evmAnalysis.RiskScore, 0)
		assert.False(t, evmAnalysis.IsScam)

		// Test Native token analysis
		nativeScanner := testEnv.GetNativeTokenScanner()
		nativeAnalysis, err := nativeScanner.AnalyzeToken(ctx, "factory/sei1abc.../test")
		require.NoError(t, err)

		// Verify Native analysis
		assert.Equal(t, "NATIVE_TOKEN", nativeAnalysis.Symbol)
		assert.Greater(t, nativeAnalysis.RiskScore, 0)
		assert.False(t, nativeAnalysis.IsScam)

		// Compare analysis results
		assert.NotEqual(t, evmAnalysis.RiskScore, nativeAnalysis.RiskScore)
		assert.NotEqual(t, evmAnalysis.Symbol, nativeAnalysis.Symbol)
	})

	t.Run("Test Cross-Chain Token Comparison", func(t *testing.T) {
		// Create same token on both chains
		evmToken := testEnv.CreateEVMToken("CrossToken", "CT", 18)
		nativeToken := testEnv.CreateNativeToken("factory/sei1abc.../cross", "CROSS", 6)

		// Analyze both versions
		evmAnalysis, err := testEnv.GetEVMTokenScanner().AnalyzeToken(ctx, evmToken)
		require.NoError(t, err)

		nativeAnalysis, err := testEnv.GetNativeTokenScanner().AnalyzeToken(ctx, nativeToken)
		require.NoError(t, err)

		// Verify both analyses are valid
		assert.Equal(t, "CT", evmAnalysis.Symbol)
		assert.Equal(t, "CROSS", nativeAnalysis.Symbol)
		assert.Greater(t, evmAnalysis.RiskScore, 0)
		assert.Greater(t, nativeAnalysis.RiskScore, 0)

		// Check for cross-chain arbitrage opportunities
		arbitrageOpportunity := testEnv.DetectCrossChainArbitrage(evmToken, nativeToken)
		if arbitrageOpportunity != nil {
			assert.Greater(t, arbitrageOpportunity.ProfitPercentage, 0.0)
			assert.NotEmpty(t, arbitrageOpportunity.Route)
		}
	})

	t.Run("Test Dual-Chain Trading Execution", func(t *testing.T) {
		// Setup trading environment for both chains
		evmTradingEnv := testEnv.GetEVMTradingEnvironment()
		nativeTradingEnv := testEnv.GetNativeTradingEnvironment()

		// Create token pairs on both chains
		evmTokenA := evmTradingEnv.CreateToken("TokenA", "TA", 18)
		evmTokenB := evmTradingEnv.CreateToken("TokenB", "TB", 18)
		evmTradingEnv.CreatePool(evmTokenA, evmTokenB, big.NewInt(1000000000000000000000), big.NewInt(1500000000))

		nativeTokenA := nativeTradingEnv.CreateToken("factory/sei1abc.../tokena", "NTA", 6)
		nativeTokenB := nativeTradingEnv.CreateToken("factory/sei1abc.../tokenb", "NTB", 6)
		nativeTradingEnv.CreatePool(nativeTokenA, nativeTokenB, big.NewInt(1000000000), big.NewInt(1500000000))

		// Initialize agents for both chains
		evmAgent := testEnv.GetEVMAgent()
		nativeAgent := testEnv.GetNativeAgent()

		// Execute trades on both chains
		evmAction := &seilor_agent.AgentAction{
			Type:        "buy",
			Token:       "TA",
			Amount:      big.NewInt(1000000000000000000), // 1 token
			MaxPrice:    1.6,
			Confidence:  0.85,
			Reasoning:   "EVM chain trade",
			Timestamp:   time.Now(),
		}

		nativeAction := &seilor_agent.AgentAction{
			Type:        "buy",
			Token:       "NTA",
			Amount:      big.NewInt(1000000), // 1 token
			MaxPrice:    1.6,
			Confidence:  0.85,
			Reasoning:   "Native chain trade",
			Timestamp:   time.Now(),
		}

		// Execute EVM trade
		evmResult, err := evmAgent.ConvertAndExecuteAction(ctx, evmAction)
		require.NoError(t, err)
		assert.True(t, evmResult.Success)
		assert.NotEmpty(t, evmResult.TxHash)

		// Execute Native trade
		nativeResult, err := nativeAgent.ConvertAndExecuteAction(ctx, nativeAction)
		require.NoError(t, err)
		assert.True(t, nativeResult.Success)
		assert.NotEmpty(t, nativeResult.TxHash)

		// Verify both trades were successful
		assert.Equal(t, "buy", evmResult.ActionType)
		assert.Equal(t, "buy", nativeResult.ActionType)
		assert.Equal(t, "TA", evmResult.Token)
		assert.Equal(t, "NTA", nativeResult.Token)
	})

	t.Run("Test Dual-Chain Performance Comparison", func(t *testing.T) {
		// Setup performance testing for both chains
		evmPerfEnv := testEnv.GetEVMPerformanceEnvironment()
		nativePerfEnv := testEnv.GetNativePerformanceEnvironment()

		// Create token pairs
		evmTokenA := evmPerfEnv.CreateToken("PerfTokenA", "PTA", 18)
		evmTokenB := evmPerfEnv.CreateToken("PerfTokenB", "PTB", 18)

		nativeTokenA := nativePerfEnv.CreateToken("factory/sei1abc.../perfa", "NPTA", 6)
		nativeTokenB := nativePerfEnv.CreateToken("factory/sei1abc.../perfb", "NPTB", 6)

		// Create pools
		evmPerfEnv.CreatePool(evmTokenA, evmTokenB, big.NewInt(1000000000000000000000), big.NewInt(1500000000))
		nativePerfEnv.CreatePool(nativeTokenA, nativeTokenB, big.NewInt(1000000000), big.NewInt(1500000000))

		// Test performance on both chains
		numTrades := 100

		// EVM performance test
		evmStartTime := time.Now()
		for i := 0; i < numTrades; i++ {
			_, err := evmPerfEnv.ExecuteTrade(evmTokenA, evmTokenB, big.NewInt(1000000000000000000))
			require.NoError(t, err)
		}
		evmDuration := time.Since(evmStartTime)

		// Native performance test
		nativeStartTime := time.Now()
		for i := 0; i < numTrades; i++ {
			_, err := nativePerfEnv.ExecuteTrade(nativeTokenA, nativeTokenB, big.NewInt(1000000))
			require.NoError(t, err)
		}
		nativeDuration := time.Since(nativeStartTime)

		// Compare performance
		evmAvgTime := evmDuration / time.Duration(numTrades)
		nativeAvgTime := nativeDuration / time.Duration(numTrades)

		// Both should be under 100ms per trade
		assert.Less(t, evmAvgTime, 100*time.Millisecond)
		assert.Less(t, nativeAvgTime, 100*time.Millisecond)

		// Log performance comparison
		t.Logf("EVM average trade time: %v", evmAvgTime)
		t.Logf("Native average trade time: %v", nativeAvgTime)
	})
}

// Dual-chain test environment setup
type DualChainTestEnvironment struct {
	// EVM components
	evmTokenScanner     *scanner.TokenScanner
	evmTradingEnv       *EVMTradingEnvironment
	evmPerfEnv          *EVMPerformanceEnvironment
	evmAgent            *seilor_agent.SeilorAgent

	// Native components
	nativeTokenScanner  *scanner.TokenScanner
	nativeTradingEnv    *NativeTradingEnvironment
	nativePerfEnv       *NativePerformanceEnvironment
	nativeAgent         *seilor_agent.SeilorAgent
}

func setupDualChainTestEnvironment(t *testing.T) *DualChainTestEnvironment {
	env := &DualChainTestEnvironment{
		// Initialize EVM components
		evmTokenScanner:   scanner.NewTokenScanner(nil, nil, nil),
		evmTradingEnv:     NewEVMTradingEnvironment(t),
		evmPerfEnv:        NewEVMPerformanceEnvironment(t),
		evmAgent:          seilor_agent.NewSeilorAgent(nil, nil, nil, nil),

		// Initialize Native components
		nativeTokenScanner: scanner.NewTokenScanner(nil, nil, nil),
		nativeTradingEnv:   NewNativeTradingEnvironment(t),
		nativePerfEnv:      NewNativePerformanceEnvironment(t),
		nativeAgent:        seilor_agent.NewSeilorAgent(nil, nil, nil, nil),
	}

	// Setup all environments
	env.evmTradingEnv.Setup()
	env.evmPerfEnv.Setup()
	env.nativeTradingEnv.Setup()
	env.nativePerfEnv.Setup()

	return env
}

func (env *DualChainTestEnvironment) Cleanup() {
	// Cleanup all environments
	env.evmTradingEnv.Cleanup()
	env.evmPerfEnv.Cleanup()
	env.nativeTradingEnv.Cleanup()
	env.nativePerfEnv.Cleanup()
}

// Environment getters
func (env *DualChainTestEnvironment) GetEVMTokenScanner() *scanner.TokenScanner {
	return env.evmTokenScanner
}

func (env *DualChainTestEnvironment) GetNativeTokenScanner() *scanner.TokenScanner {
	return env.nativeTokenScanner
}

func (env *DualChainTestEnvironment) GetEVMTradingEnvironment() *EVMTradingEnvironment {
	return env.evmTradingEnv
}

func (env *DualChainTestEnvironment) GetNativeTradingEnvironment() *NativeTradingEnvironment {
	return env.nativeTradingEnv
}

func (env *DualChainTestEnvironment) GetEVMPerformanceEnvironment() *EVMPerformanceEnvironment {
	return env.evmPerfEnv
}

func (env *DualChainTestEnvironment) GetNativePerformanceEnvironment() *NativePerformanceEnvironment {
	return env.nativePerfEnv
}

func (env *DualChainTestEnvironment) GetEVMAgent() *seilor_agent.SeilorAgent {
	return env.evmAgent
}

func (env *DualChainTestEnvironment) GetNativeAgent() *seilor_agent.SeilorAgent {
	return env.nativeAgent
}

// Utility methods
func (env *DualChainTestEnvironment) CreateEVMToken(name, symbol string, decimals int) string {
	return "0x" + symbol + "1234567890123456789012345678901234567890"
}

func (env *DualChainTestEnvironment) CreateNativeToken(denom, symbol string) string {
	return denom
}

func (env *DualChainTestEnvironment) DetectCrossChainArbitrage(evmToken, nativeToken string) *ArbitrageOpportunity {
	// Mock cross-chain arbitrage detection
	return nil
}

// Environment implementations
type EVMTradingEnvironment struct {
	t *testing.T
}

func NewEVMTradingEnvironment(t *testing.T) *EVMTradingEnvironment {
	return &EVMTradingEnvironment{t: t}
}

func (env *EVMTradingEnvironment) Setup() {
	// Setup EVM trading environment
}

func (env *EVMTradingEnvironment) Cleanup() {
	// Cleanup EVM trading environment
}

func (env *EVMTradingEnvironment) CreateToken(name, symbol string, decimals int) string {
	return "0x" + symbol + "1234567890123456789012345678901234567890"
}

func (env *EVMTradingEnvironment) CreatePool(tokenA, tokenB string, amountA, amountB *big.Int) {
	// Create EVM pool
}

type NativeTradingEnvironment struct {
	t *testing.T
}

func NewNativeTradingEnvironment(t *testing.T) *NativeTradingEnvironment {
	return &NativeTradingEnvironment{t: t}
}

func (env *NativeTradingEnvironment) Setup() {
	// Setup Native trading environment
}

func (env *NativeTradingEnvironment) Cleanup() {
	// Cleanup Native trading environment
}

func (env *NativeTradingEnvironment) CreateToken(denom, symbol string) string {
	return denom
}

func (env *NativeTradingEnvironment) CreatePool(tokenA, tokenB string, amountA, amountB *big.Int) {
	// Create Native pool
}

type EVMPerformanceEnvironment struct {
	t *testing.T
}

func NewEVMPerformanceEnvironment(t *testing.T) *EVMPerformanceEnvironment {
	return &EVMPerformanceEnvironment{t: t}
}

func (env *EVMPerformanceEnvironment) Setup() {
	// Setup EVM performance environment
}

func (env *EVMPerformanceEnvironment) Cleanup() {
	// Cleanup EVM performance environment
}

func (env *EVMPerformanceEnvironment) CreateToken(name, symbol string, decimals int) string {
	return "0x" + symbol + "1234567890123456789012345678901234567890"
}

func (env *EVMPerformanceEnvironment) CreatePool(tokenA, tokenB string, amountA, amountB *big.Int) {
	// Create EVM pool
}

func (env *EVMPerformanceEnvironment) ExecuteTrade(tokenA, tokenB string, amount *big.Int) (*TradeResult, error) {
	return &TradeResult{
		Success: true,
		TxHash:  "0x1234567890abcdef",
		GasUsed: 21000,
	}, nil
}

type NativePerformanceEnvironment struct {
	t *testing.T
}

func NewNativePerformanceEnvironment(t *testing.T) *NativePerformanceEnvironment {
	return &NativePerformanceEnvironment{t: t}
}

func (env *NativePerformanceEnvironment) Setup() {
	// Setup Native performance environment
}

func (env *NativePerformanceEnvironment) Cleanup() {
	// Cleanup Native performance environment
}

func (env *NativePerformanceEnvironment) CreateToken(denom, symbol string) string {
	return denom
}

func (env *NativePerformanceEnvironment) CreatePool(tokenA, tokenB string, amountA, amountB *big.Int) {
	// Create Native pool
}

func (env *NativePerformanceEnvironment) ExecuteTrade(tokenA, tokenB string, amount *big.Int) (*TradeResult, error) {
	return &TradeResult{
		Success: true,
		TxHash:  "sei1abcdef1234567890",
		GasUsed: 50000,
	}, nil
}

// Result types
type TradeResult struct {
	Success bool
	TxHash  string
	GasUsed int
	Error   string
}

type ArbitrageOpportunity struct {
	ProfitPercentage float64
	Route            string
}