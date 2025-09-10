package agent_test

import (
	"context"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"

	"seifun/backend/seilor-agent"
	"seifun/backend/seilor-agent/mocks"
)

// Mock dependencies
type mockMarketDataProvider struct {
	mocks.MockMarketDataProvider
}

type mockRiskEngine struct {
	mocks.MockRiskEngine
}

type mockOrderRouter struct {
	mocks.MockOrderRouter
}

type mockExecutionService struct {
	mocks.MockExecutionService
}

func TestAgentActionConversion(t *testing.T) {
	ctx := context.Background()

	// Initialize mocks
	marketData := &mockMarketDataProvider{}
	riskEngine := &mockRiskEngine{}
	orderRouter := &mockOrderRouter{}
	executionService := &mockExecutionService{}

	// Create agent instance
	agent := seilor_agent.NewSeilorAgent(marketData, riskEngine, orderRouter, executionService)

	t.Run("Test Buy Action Conversion", func(t *testing.T) {
		// Mock market data
		marketData.On("GetPrice", "TEST").
			Return(&seilor_agent.PriceData{
				Price:     1.5,
				Change24h: 5.2,
				Volume24h: 1000000,
				Timestamp: time.Now(),
			}, nil)

		// Mock risk assessment
		riskEngine.On("AssessTokenRisk", "TEST").
			Return(&seilor_agent.RiskAssessment{
				Score:       75,
				Liquidity:   80,
				Volatility:  60,
				MarketCap:   10000000,
				IsScam:      false,
				RiskFactors: []string{"Low liquidity"},
			}, nil)

		// Mock order router
		orderRouter.On("CalculateSwapCost", mock.AnythingOfType("*seilor_agent.SwapRequest")).
			Return(&seilor_agent.SwapCost{
				AmountIn:  1000000000000000000, // 1 token
				AmountOut: 1500000000,          // 1.5 USDC
				Fee:       2500000000000000,    // 0.0025 tokens
				Route:     "orderbook",
				Slippage:  50, // 0.5%
			}, nil)

		// Mock execution service
		executionService.On("ExecuteSwap", mock.AnythingOfType("*seilor_agent.SwapRequest")).
			Return(&seilor_agent.ExecutionResult{
				Success:    true,
				TxHash:     "0x1234567890abcdef",
				GasUsed:    21000,
				GasPrice:   20000000000, // 20 gwei
				Timestamp:  time.Now(),
			}, nil)

		// Test buy action
		buyAction := &seilor_agent.AgentAction{
			Type:        "buy",
			Token:       "TEST",
			Amount:      1000000000000000000, // 1 token
			MaxPrice:    1.6,
			Confidence:  0.85,
			Reasoning:   "Strong technical indicators suggest upward momentum",
			Timestamp:   time.Now(),
		}

		result, err := agent.ConvertAndExecuteAction(ctx, buyAction)
		require.NoError(t, err)

		// Verify results
		assert.True(t, result.Success)
		assert.Equal(t, "0x1234567890abcdef", result.TxHash)
		assert.Equal(t, "buy", result.ActionType)
		assert.Equal(t, "TEST", result.Token)
		assert.Equal(t, 0.85, result.Confidence)

		// Verify all mocks were called
		marketData.AssertExpectations(t)
		riskEngine.AssertExpectations(t)
		orderRouter.AssertExpectations(t)
		executionService.AssertExpectations(t)
	})

	t.Run("Test Sell Action Conversion", func(t *testing.T) {
		// Mock market data
		marketData.On("GetPrice", "TEST").
			Return(&seilor_agent.PriceData{
				Price:     1.4,
				Change24h: -3.1,
				Volume24h: 800000,
				Timestamp: time.Now(),
			}, nil)

		// Mock risk assessment
		riskEngine.On("AssessTokenRisk", "TEST").
			Return(&seilor_agent.RiskAssessment{
				Score:       65,
				Liquidity:   70,
				Volatility:  80,
				MarketCap:   8000000,
				IsScam:      false,
				RiskFactors: []string{"High volatility", "Decreasing volume"},
			}, nil)

		// Mock order router
		orderRouter.On("CalculateSwapCost", mock.AnythingOfType("*seilor_agent.SwapRequest")).
			Return(&seilor_agent.SwapCost{
				AmountIn:  1000000000000000000, // 1 token
				AmountOut: 1400000000,          // 1.4 USDC
				Fee:       2500000000000000,    // 0.0025 tokens
				Route:     "amm",
				Slippage:  75, // 0.75%
			}, nil)

		// Mock execution service
		executionService.On("ExecuteSwap", mock.AnythingOfType("*seilor_agent.SwapRequest")).
			Return(&seilor_agent.ExecutionResult{
				Success:    true,
				TxHash:     "0xabcdef1234567890",
				GasUsed:    25000,
				GasPrice:   20000000000, // 20 gwei
				Timestamp:  time.Now(),
			}, nil)

		// Test sell action
		sellAction := &seilor_agent.AgentAction{
			Type:        "sell",
			Token:       "TEST",
			Amount:      1000000000000000000, // 1 token
			MinPrice:    1.3,
			Confidence:  0.75,
			Reasoning:   "Technical indicators show bearish divergence",
			Timestamp:   time.Now(),
		}

		result, err := agent.ConvertAndExecuteAction(ctx, sellAction)
		require.NoError(t, err)

		// Verify results
		assert.True(t, result.Success)
		assert.Equal(t, "0xabcdef1234567890", result.TxHash)
		assert.Equal(t, "sell", result.ActionType)
		assert.Equal(t, "TEST", result.Token)
		assert.Equal(t, 0.75, result.Confidence)

		// Verify all mocks were called
		marketData.AssertExpectations(t)
		riskEngine.AssertExpectations(t)
		orderRouter.AssertExpectations(t)
		executionService.AssertExpectations(t)
	})

	t.Run("Test Hold Action Conversion", func(t *testing.T) {
		// Mock market data
		marketData.On("GetPrice", "TEST").
			Return(&seilor_agent.PriceData{
				Price:     1.5,
				Change24h: 0.5,
				Volume24h: 500000,
				Timestamp: time.Now(),
			}, nil)

		// Mock risk assessment
		riskEngine.On("AssessTokenRisk", "TEST").
			Return(&seilor_agent.RiskAssessment{
				Score:       80,
				Liquidity:   85,
				Volatility:  45,
				MarketCap:   12000000,
				IsScam:      false,
				RiskFactors: []string{},
			}, nil)

		// Test hold action (no execution needed)
		holdAction := &seilor_agent.AgentAction{
			Type:        "hold",
			Token:       "TEST",
			Amount:      0,
			Confidence:  0.90,
			Reasoning:   "Token shows stable performance with good fundamentals",
			Timestamp:   time.Now(),
		}

		result, err := agent.ConvertAndExecuteAction(ctx, holdAction)
		require.NoError(t, err)

		// Verify results
		assert.True(t, result.Success)
		assert.Equal(t, "hold", result.ActionType)
		assert.Equal(t, "TEST", result.Token)
		assert.Equal(t, 0.90, result.Confidence)
		assert.Empty(t, result.TxHash) // No transaction for hold

		// Verify mocks were called
		marketData.AssertExpectations(t)
		riskEngine.AssertExpectations(t)
	})

	t.Run("Test High Risk Token Rejection", func(t *testing.T) {
		// Mock market data
		marketData.On("GetPrice", "SCAM").
			Return(&seilor_agent.PriceData{
				Price:     0.001,
				Change24h: -99.9,
				Volume24h: 100,
				Timestamp: time.Now(),
			}, nil)

		// Mock risk assessment indicating scam
		riskEngine.On("AssessTokenRisk", "SCAM").
			Return(&seilor_agent.RiskAssessment{
				Score:       10,
				Liquidity:   5,
				Volatility:  100,
				MarketCap:   1000,
				IsScam:      true,
				RiskFactors: []string{"Suspicious contract", "No liquidity", "Extreme volatility"},
			}, nil)

		// Test buy action on scam token
		buyAction := &seilor_agent.AgentAction{
			Type:        "buy",
			Token:       "SCAM",
			Amount:      1000000000000000000,
			MaxPrice:    0.002,
			Confidence:  0.95, // High confidence but should be rejected
			Reasoning:   "AI mistakenly identified as good opportunity",
			Timestamp:   time.Now(),
		}

		result, err := agent.ConvertAndExecuteAction(ctx, buyAction)
		require.NoError(t, err)

		// Verify action was rejected
		assert.False(t, result.Success)
		assert.Equal(t, "buy", result.ActionType)
		assert.Equal(t, "SCAM", result.Token)
		assert.Contains(t, result.Error, "High risk token detected")
		assert.Empty(t, result.TxHash)

		// Verify mocks were called
		marketData.AssertExpectations(t)
		riskEngine.AssertExpectations(t)
	})

	t.Run("Test Insufficient Confidence Rejection", func(t *testing.T) {
		// Mock market data
		marketData.On("GetPrice", "TEST").
			Return(&seilor_agent.PriceData{
				Price:     1.5,
				Change24h: 2.1,
				Volume24h: 600000,
				Timestamp: time.Now(),
			}, nil)

		// Mock risk assessment
		riskEngine.On("AssessTokenRisk", "TEST").
			Return(&seilor_agent.RiskAssessment{
				Score:       70,
				Liquidity:   75,
				Volatility:  55,
				MarketCap:   9000000,
				IsScam:      false,
				RiskFactors: []string{"Moderate volatility"},
			}, nil)

		// Test buy action with low confidence
		buyAction := &seilor_agent.AgentAction{
			Type:        "buy",
			Token:       "TEST",
			Amount:      1000000000000000000,
			MaxPrice:    1.6,
			Confidence:  0.45, // Below threshold
			Reasoning:   "Uncertain market conditions",
			Timestamp:   time.Now(),
		}

		result, err := agent.ConvertAndExecuteAction(ctx, buyAction)
		require.NoError(t, err)

		// Verify action was rejected due to low confidence
		assert.False(t, result.Success)
		assert.Equal(t, "buy", result.ActionType)
		assert.Equal(t, "TEST", result.Token)
		assert.Contains(t, result.Error, "Insufficient confidence")
		assert.Empty(t, result.TxHash)

		// Verify mocks were called
		marketData.AssertExpectations(t)
		riskEngine.AssertExpectations(t)
	})

	t.Run("Test Execution Service Error", func(t *testing.T) {
		// Mock market data
		marketData.On("GetPrice", "TEST").
			Return(&seilor_agent.PriceData{
				Price:     1.5,
				Change24h: 5.2,
				Volume24h: 1000000,
				Timestamp: time.Now(),
			}, nil)

		// Mock risk assessment
		riskEngine.On("AssessTokenRisk", "TEST").
			Return(&seilor_agent.RiskAssessment{
				Score:       75,
				Liquidity:   80,
				Volatility:  60,
				MarketCap:   10000000,
				IsScam:      false,
				RiskFactors: []string{"Low liquidity"},
			}, nil)

		// Mock order router
		orderRouter.On("CalculateSwapCost", mock.AnythingOfType("*seilor_agent.SwapRequest")).
			Return(&seilor_agent.SwapCost{
				AmountIn:  1000000000000000000,
				AmountOut: 1500000000,
				Fee:       2500000000000000,
				Route:     "orderbook",
				Slippage:  50,
			}, nil)

		// Mock execution service error
		executionService.On("ExecuteSwap", mock.AnythingOfType("*seilor_agent.SwapRequest")).
			Return(nil, assert.AnError)

		// Test buy action
		buyAction := &seilor_agent.AgentAction{
			Type:        "buy",
			Token:       "TEST",
			Amount:      1000000000000000000,
			MaxPrice:    1.6,
			Confidence:  0.85,
			Reasoning:   "Strong technical indicators",
			Timestamp:   time.Now(),
		}

		result, err := agent.ConvertAndExecuteAction(ctx, buyAction)
		require.NoError(t, err)

		// Verify execution failed
		assert.False(t, result.Success)
		assert.Equal(t, "buy", result.ActionType)
		assert.Equal(t, "TEST", result.Token)
		assert.Contains(t, result.Error, "Execution failed")
		assert.Empty(t, result.TxHash)

		// Verify all mocks were called
		marketData.AssertExpectations(t)
		riskEngine.AssertExpectations(t)
		orderRouter.AssertExpectations(t)
		executionService.AssertExpectations(t)
	})

	t.Run("Test Market Data Error", func(t *testing.T) {
		// Mock market data error
		marketData.On("GetPrice", "TEST").
			Return(nil, assert.AnError)

		// Test buy action
		buyAction := &seilor_agent.AgentAction{
			Type:        "buy",
			Token:       "TEST",
			Amount:      1000000000000000000,
			MaxPrice:    1.6,
			Confidence:  0.85,
			Reasoning:   "Strong technical indicators",
			Timestamp:   time.Now(),
		}

		result, err := agent.ConvertAndExecuteAction(ctx, buyAction)
		require.NoError(t, err)

		// Verify action was rejected due to market data error
		assert.False(t, result.Success)
		assert.Equal(t, "buy", result.ActionType)
		assert.Equal(t, "TEST", result.Token)
		assert.Contains(t, result.Error, "Market data unavailable")
		assert.Empty(t, result.TxHash)

		// Verify mock was called
		marketData.AssertExpectations(t)
	})

	t.Run("Test Risk Engine Error", func(t *testing.T) {
		// Mock market data
		marketData.On("GetPrice", "TEST").
			Return(&seilor_agent.PriceData{
				Price:     1.5,
				Change24h: 5.2,
				Volume24h: 1000000,
				Timestamp: time.Now(),
			}, nil)

		// Mock risk engine error
		riskEngine.On("AssessTokenRisk", "TEST").
			Return(nil, assert.AnError)

		// Test buy action
		buyAction := &seilor_agent.AgentAction{
			Type:        "buy",
			Token:       "TEST",
			Amount:      1000000000000000000,
			MaxPrice:    1.6,
			Confidence:  0.85,
			Reasoning:   "Strong technical indicators",
			Timestamp:   time.Now(),
		}

		result, err := agent.ConvertAndExecuteAction(ctx, buyAction)
		require.NoError(t, err)

		// Verify action was rejected due to risk assessment error
		assert.False(t, result.Success)
		assert.Equal(t, "buy", result.ActionType)
		assert.Equal(t, "TEST", result.Token)
		assert.Contains(t, result.Error, "Risk assessment failed")
		assert.Empty(t, result.TxHash)

		// Verify mocks were called
		marketData.AssertExpectations(t)
		riskEngine.AssertExpectations(t)
	})
}

func TestAgentActionConversionPerformance(t *testing.T) {
	ctx := context.Background()

	// Initialize mocks
	marketData := &mockMarketDataProvider{}
	riskEngine := &mockRiskEngine{}
	orderRouter := &mockOrderRouter{}
	executionService := &mockExecutionService{}

	// Create agent instance
	agent := seilor_agent.NewSeilorAgent(marketData, riskEngine, orderRouter, executionService)

	// Mock data for performance testing
	marketData.On("GetPrice", mock.AnythingOfType("string")).
		Return(&seilor_agent.PriceData{
			Price:     1.5,
			Change24h: 5.2,
			Volume24h: 1000000,
			Timestamp: time.Now(),
		}, nil)

	riskEngine.On("AssessTokenRisk", mock.AnythingOfType("string")).
		Return(&seilor_agent.RiskAssessment{
			Score:       75,
			Liquidity:   80,
			Volatility:  60,
			MarketCap:   10000000,
			IsScam:      false,
			RiskFactors: []string{"Low liquidity"},
		}, nil)

	orderRouter.On("CalculateSwapCost", mock.AnythingOfType("*seilor_agent.SwapRequest")).
		Return(&seilor_agent.SwapCost{
			AmountIn:  1000000000000000000,
			AmountOut: 1500000000,
			Fee:       2500000000000000,
			Route:     "orderbook",
			Slippage:  50,
		}, nil)

	executionService.On("ExecuteSwap", mock.AnythingOfType("*seilor_agent.SwapRequest")).
		Return(&seilor_agent.ExecutionResult{
			Success:    true,
			TxHash:     "0x1234567890abcdef",
			GasUsed:    21000,
			GasPrice:   20000000000,
			Timestamp:  time.Now(),
		}, nil)

	// Test performance
	numTests := 100
	buyAction := &seilor_agent.AgentAction{
		Type:        "buy",
		Token:       "TEST",
		Amount:      1000000000000000000,
		MaxPrice:    1.6,
		Confidence:  0.85,
		Reasoning:   "Strong technical indicators",
		Timestamp:   time.Now(),
	}

	for i := 0; i < numTests; i++ {
		result, err := agent.ConvertAndExecuteAction(ctx, buyAction)
		require.NoError(t, err)
		require.NotNil(t, result)
	}

	// Verify all mocks were called
	marketData.AssertExpectations(t)
	riskEngine.AssertExpectations(t)
	orderRouter.AssertExpectations(t)
	executionService.AssertExpectations(t)
}