package router_test

import (
	"context"
	"math/big"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"

	"seifun/backend/router"
	"seifun/backend/router/mocks"
)

// Mock dependencies
type mockOrderBook struct {
	mocks.MockOrderBook
}

type mockAMMFactory struct {
	mocks.MockAMMFactory
}

type mockFeeCollector struct {
	mocks.MockFeeCollector
}

func TestRouterCostCalculation(t *testing.T) {
	ctx := context.Background()

	// Initialize mocks
	orderBook := &mockOrderBook{}
	ammFactory := &mockAMMFactory{}
	feeCollector := &mockFeeCollector{}

	// Create router instance
	router := router.NewOrderRouter(orderBook, ammFactory, feeCollector)

	t.Run("Test EVM Token Swap Cost Calculation", func(t *testing.T) {
		// Mock order book data
		orderBook.On("GetBestPrice", "0x1234567890123456789012345678901234567890", "0x9876543210987654321098765432109876543210").
			Return(&router.PriceData{
				Price:     big.NewInt(1500000), // 1.5 USDC per token
				Liquidity: big.NewInt(1000000000000000000000), // 1000 tokens
				Fee:       big.NewInt(25), // 0.25% fee
			}, nil)

		// Mock AMM data
		ammFactory.On("GetPoolInfo", "0x1234567890123456789012345678901234567890", "0x9876543210987654321098765432109876543210").
			Return(&router.PoolInfo{
				ReserveA:  big.NewInt(500000000000000000000), // 500 tokens
				ReserveB:  big.NewInt(750000000), // 750 USDC
				Fee:       big.NewInt(30), // 0.3% fee
				Liquidity: big.NewInt(1000000000000000000000), // 1000 LP tokens
			}, nil)

		// Mock fee collector
		feeCollector.On("CalculateFee", big.NewInt(1000000000000000000), big.NewInt(25)).
			Return(big.NewInt(2500000000000000), nil) // 0.0025 tokens

		// Test cost calculation
		swapRequest := &router.SwapRequest{
			TokenIn:  "0x1234567890123456789012345678901234567890",
			TokenOut: "0x9876543210987654321098765432109876543210",
			AmountIn: big.NewInt(1000000000000000000), // 1 token
		}

		result, err := router.CalculateSwapCost(ctx, swapRequest)
		require.NoError(t, err)

		// Verify results
		assert.Equal(t, big.NewInt(1000000000000000000), result.AmountIn)
		assert.Equal(t, big.NewInt(1500000), result.AmountOut)
		assert.Equal(t, big.NewInt(2500000000000000), result.Fee)
		assert.Equal(t, "orderbook", result.Route)
		assert.Equal(t, big.NewInt(1500000), result.PriceImpact)

		// Verify all mocks were called
		orderBook.AssertExpectations(t)
		ammFactory.AssertExpectations(t)
		feeCollector.AssertExpectations(t)
	})

	t.Run("Test Native SEI Token Swap Cost Calculation", func(t *testing.T) {
		// Mock order book data for native tokens
		orderBook.On("GetBestPrice", "usei", "factory/sei1abc.../test").
			Return(&router.PriceData{
				Price:     big.NewInt(1000000), // 1.0 test token per SEI
				Liquidity: big.NewInt(500000000), // 500 SEI
				Fee:       big.NewInt(25), // 0.25% fee
			}, nil)

		// Mock AMM data for native tokens
		ammFactory.On("GetPoolInfo", "usei", "factory/sei1abc.../test").
			Return(&router.PoolInfo{
				ReserveA:  big.NewInt(1000000000), // 1000 SEI
				ReserveB:  big.NewInt(1000000000), // 1000 test tokens
				Fee:       big.NewInt(30), // 0.3% fee
				Liquidity: big.NewInt(1000000000), // 1000 LP tokens
			}, nil)

		// Mock fee collector
		feeCollector.On("CalculateFee", big.NewInt(1000000), big.NewInt(25)).
			Return(big.NewInt(2500), nil) // 0.0025 SEI

		// Test cost calculation
		swapRequest := &router.SwapRequest{
			TokenIn:  "usei",
			TokenOut: "factory/sei1abc.../test",
			AmountIn: big.NewInt(1000000), // 1 SEI
		}

		result, err := router.CalculateSwapCost(ctx, swapRequest)
		require.NoError(t, err)

		// Verify results
		assert.Equal(t, big.NewInt(1000000), result.AmountIn)
		assert.Equal(t, big.NewInt(1000000), result.AmountOut)
		assert.Equal(t, big.NewInt(2500), result.Fee)
		assert.Equal(t, "orderbook", result.Route)
		assert.Equal(t, big.NewInt(1000000), result.PriceImpact)

		// Verify all mocks were called
		orderBook.AssertExpectations(t)
		ammFactory.AssertExpectations(t)
		feeCollector.AssertExpectations(t)
	})

	t.Run("Test AMM Route Selection", func(t *testing.T) {
		// Mock order book with poor liquidity
		orderBook.On("GetBestPrice", "0x1234567890123456789012345678901234567890", "0x9876543210987654321098765432109876543210").
			Return(&router.PriceData{
				Price:     big.NewInt(1400000), // 1.4 USDC per token
				Liquidity: big.NewInt(100000000000000000000), // 100 tokens (low liquidity)
				Fee:       big.NewInt(25), // 0.25% fee
			}, nil)

		// Mock AMM with better liquidity
		ammFactory.On("GetPoolInfo", "0x1234567890123456789012345678901234567890", "0x9876543210987654321098765432109876543210").
			Return(&router.PoolInfo{
				ReserveA:  big.NewInt(1000000000000000000000), // 1000 tokens
				ReserveB:  big.NewInt(1500000000), // 1500 USDC
				Fee:       big.NewInt(30), // 0.3% fee
				Liquidity: big.NewInt(1000000000000000000000), // 1000 LP tokens
			}, nil)

		// Mock fee collector
		feeCollector.On("CalculateFee", big.NewInt(1000000000000000000), big.NewInt(30)).
			Return(big.NewInt(3000000000000000), nil) // 0.003 tokens

		// Test cost calculation
		swapRequest := &router.SwapRequest{
			TokenIn:  "0x1234567890123456789012345678901234567890",
			TokenOut: "0x9876543210987654321098765432109876543210",
			AmountIn: big.NewInt(1000000000000000000), // 1 token
		}

		result, err := router.CalculateSwapCost(ctx, swapRequest)
		require.NoError(t, err)

		// Verify AMM route was selected due to better liquidity
		assert.Equal(t, "amm", result.Route)
		assert.Equal(t, big.NewInt(1500000000), result.AmountOut)
		assert.Equal(t, big.NewInt(3000000000000000), result.Fee)

		// Verify all mocks were called
		orderBook.AssertExpectations(t)
		ammFactory.AssertExpectations(t)
		feeCollector.AssertExpectations(t)
	})

	t.Run("Test Price Impact Calculation", func(t *testing.T) {
		// Mock order book data
		orderBook.On("GetBestPrice", "0x1234567890123456789012345678901234567890", "0x9876543210987654321098765432109876543210").
			Return(&router.PriceData{
				Price:     big.NewInt(1500000), // 1.5 USDC per token
				Liquidity: big.NewInt(100000000000000000000), // 100 tokens (low liquidity)
				Fee:       big.NewInt(25), // 0.25% fee
			}, nil)

		// Mock AMM data
		ammFactory.On("GetPoolInfo", "0x1234567890123456789012345678901234567890", "0x9876543210987654321098765432109876543210").
			Return(&router.PoolInfo{
				ReserveA:  big.NewInt(1000000000000000000000), // 1000 tokens
				ReserveB:  big.NewInt(1500000000), // 1500 USDC
				Fee:       big.NewInt(30), // 0.3% fee
				Liquidity: big.NewInt(1000000000000000000000), // 1000 LP tokens
			}, nil)

		// Mock fee collector
		feeCollector.On("CalculateFee", big.NewInt(100000000000000000000), big.NewInt(30)).
			Return(big.NewInt(300000000000000000000), nil) // 0.3 tokens

		// Test large swap with high price impact
		swapRequest := &router.SwapRequest{
			TokenIn:  "0x1234567890123456789012345678901234567890",
			TokenOut: "0x9876543210987654321098765432109876543210",
			AmountIn: big.NewInt(100000000000000000000), // 100 tokens (large swap)
		}

		result, err := router.CalculateSwapCost(ctx, swapRequest)
		require.NoError(t, err)

		// Verify high price impact
		assert.Greater(t, result.PriceImpact.Int64(), int64(1000000)) // Should be significant
		assert.Equal(t, "amm", result.Route) // AMM should be selected for large swaps

		// Verify all mocks were called
		orderBook.AssertExpectations(t)
		ammFactory.AssertExpectations(t)
		feeCollector.AssertExpectations(t)
	})

	t.Run("Test Slippage Protection", func(t *testing.T) {
		// Mock order book data
		orderBook.On("GetBestPrice", "0x1234567890123456789012345678901234567890", "0x9876543210987654321098765432109876543210").
			Return(&router.PriceData{
				Price:     big.NewInt(1500000), // 1.5 USDC per token
				Liquidity: big.NewInt(1000000000000000000000), // 1000 tokens
				Fee:       big.NewInt(25), // 0.25% fee
			}, nil)

		// Mock AMM data
		ammFactory.On("GetPoolInfo", "0x1234567890123456789012345678901234567890", "0x9876543210987654321098765432109876543210").
			Return(&router.PoolInfo{
				ReserveA:  big.NewInt(1000000000000000000000), // 1000 tokens
				ReserveB:  big.NewInt(1500000000), // 1500 USDC
				Fee:       big.NewInt(30), // 0.3% fee
				Liquidity: big.NewInt(1000000000000000000000), // 1000 LP tokens
			}, nil)

		// Mock fee collector
		feeCollector.On("CalculateFee", big.NewInt(1000000000000000000), big.NewInt(25)).
			Return(big.NewInt(2500000000000000), nil) // 0.0025 tokens

		// Test swap with slippage protection
		swapRequest := &router.SwapRequest{
			TokenIn:      "0x1234567890123456789012345678901234567890",
			TokenOut:     "0x9876543210987654321098765432109876543210",
			AmountIn:     big.NewInt(1000000000000000000), // 1 token
			MaxSlippage:  big.NewInt(100), // 1% max slippage
		}

		result, err := router.CalculateSwapCost(ctx, swapRequest)
		require.NoError(t, err)

		// Verify slippage protection
		assert.LessOrEqual(t, result.Slippage.Int64(), int64(100)) // Should be within 1%
		assert.Equal(t, big.NewInt(1500000), result.AmountOut)

		// Verify all mocks were called
		orderBook.AssertExpectations(t)
		ammFactory.AssertExpectations(t)
		feeCollector.AssertExpectations(t)
	})

	t.Run("Test Order Book Error", func(t *testing.T) {
		// Mock order book error
		orderBook.On("GetBestPrice", "0xinvalid", "0x9876543210987654321098765432109876543210").
			Return(nil, assert.AnError)

		// Test cost calculation with invalid token
		swapRequest := &router.SwapRequest{
			TokenIn:  "0xinvalid",
			TokenOut: "0x9876543210987654321098765432109876543210",
			AmountIn: big.NewInt(1000000000000000000),
		}

		result, err := router.CalculateSwapCost(ctx, swapRequest)
		require.Error(t, err)
		assert.Nil(t, result)

		// Verify mock was called
		orderBook.AssertExpectations(t)
	})

	t.Run("Test AMM Factory Error", func(t *testing.T) {
		// Mock order book data
		orderBook.On("GetBestPrice", "0x1234567890123456789012345678901234567890", "0x9876543210987654321098765432109876543210").
			Return(&router.PriceData{
				Price:     big.NewInt(1500000),
				Liquidity: big.NewInt(1000000000000000000000),
				Fee:       big.NewInt(25),
			}, nil)

		// Mock AMM factory error
		ammFactory.On("GetPoolInfo", "0x1234567890123456789012345678901234567890", "0x9876543210987654321098765432109876543210").
			Return(nil, assert.AnError)

		// Mock fee collector
		feeCollector.On("CalculateFee", big.NewInt(1000000000000000000), big.NewInt(25)).
			Return(big.NewInt(2500000000000000), nil)

		// Test cost calculation
		swapRequest := &router.SwapRequest{
			TokenIn:  "0x1234567890123456789012345678901234567890",
			TokenOut: "0x9876543210987654321098765432109876543210",
			AmountIn: big.NewInt(1000000000000000000),
		}

		result, err := router.CalculateSwapCost(ctx, swapRequest)
		require.NoError(t, err) // Should fallback to order book

		// Verify order book route was used
		assert.Equal(t, "orderbook", result.Route)

		// Verify mocks were called
		orderBook.AssertExpectations(t)
		ammFactory.AssertExpectations(t)
		feeCollector.AssertExpectations(t)
	})

	t.Run("Test Fee Collector Error", func(t *testing.T) {
		// Mock order book data
		orderBook.On("GetBestPrice", "0x1234567890123456789012345678901234567890", "0x9876543210987654321098765432109876543210").
			Return(&router.PriceData{
				Price:     big.NewInt(1500000),
				Liquidity: big.NewInt(1000000000000000000000),
				Fee:       big.NewInt(25),
			}, nil)

		// Mock AMM data
		ammFactory.On("GetPoolInfo", "0x1234567890123456789012345678901234567890", "0x9876543210987654321098765432109876543210").
			Return(&router.PoolInfo{
				ReserveA:  big.NewInt(1000000000000000000000),
				ReserveB:  big.NewInt(1500000000),
				Fee:       big.NewInt(30),
				Liquidity: big.NewInt(1000000000000000000000),
			}, nil)

		// Mock fee collector error
		feeCollector.On("CalculateFee", big.NewInt(1000000000000000000), big.NewInt(25)).
			Return(nil, assert.AnError)

		// Test cost calculation
		swapRequest := &router.SwapRequest{
			TokenIn:  "0x1234567890123456789012345678901234567890",
			TokenOut: "0x9876543210987654321098765432109876543210",
			AmountIn: big.NewInt(1000000000000000000),
		}

		result, err := router.CalculateSwapCost(ctx, swapRequest)
		require.Error(t, err)
		assert.Nil(t, result)

		// Verify mocks were called
		orderBook.AssertExpectations(t)
		ammFactory.AssertExpectations(t)
		feeCollector.AssertExpectations(t)
	})
}

func TestRouterCostCalculationPerformance(t *testing.T) {
	ctx := context.Background()

	// Initialize mocks
	orderBook := &mockOrderBook{}
	ammFactory := &mockAMMFactory{}
	feeCollector := &mockFeeCollector{}

	// Create router instance
	router := router.NewOrderRouter(orderBook, ammFactory, feeCollector)

	// Mock data for performance testing
	orderBook.On("GetBestPrice", mock.AnythingOfType("string"), mock.AnythingOfType("string")).
		Return(&router.PriceData{
			Price:     big.NewInt(1500000),
			Liquidity: big.NewInt(1000000000000000000000),
			Fee:       big.NewInt(25),
		}, nil)

	ammFactory.On("GetPoolInfo", mock.AnythingOfType("string"), mock.AnythingOfType("string")).
		Return(&router.PoolInfo{
			ReserveA:  big.NewInt(1000000000000000000000),
			ReserveB:  big.NewInt(1500000000),
			Fee:       big.NewInt(30),
			Liquidity: big.NewInt(1000000000000000000000),
		}, nil)

	feeCollector.On("CalculateFee", mock.AnythingOfType("*big.Int"), mock.AnythingOfType("*big.Int")).
		Return(big.NewInt(2500000000000000), nil)

	// Test performance
	numTests := 1000
	swapRequest := &router.SwapRequest{
		TokenIn:  "0x1234567890123456789012345678901234567890",
		TokenOut: "0x9876543210987654321098765432109876543210",
		AmountIn: big.NewInt(1000000000000000000),
	}

	for i := 0; i < numTests; i++ {
		result, err := router.CalculateSwapCost(ctx, swapRequest)
		require.NoError(t, err)
		require.NotNil(t, result)
	}

	// Verify all mocks were called
	orderBook.AssertExpectations(t)
	ammFactory.AssertExpectations(t)
	feeCollector.AssertExpectations(t)
}