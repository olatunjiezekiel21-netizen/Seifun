package router

import (
	"context"
	"fmt"
	"math/big"
	"time"

	"seifun/backend/order-router/internal/config"
	"seifun/backend/order-router/internal/orderbook"
	"seifun/backend/order-router/internal/amm"
	"seifun/backend/order-router/internal/fee"
	"seifun/backend/order-router/internal/storage"
)

// SwapRequest represents a token swap request
type SwapRequest struct {
	TokenIn      string   `json:"token_in"`
	TokenOut     string   `json:"token_out"`
	AmountIn     *big.Int `json:"amount_in"`
	MinAmountOut *big.Int `json:"min_amount_out"`
	MaxSlippage  *big.Int `json:"max_slippage"`
	Deadline     int64    `json:"deadline"`
	User         string   `json:"user"`
}

// SwapCost represents the cost calculation for a swap
type SwapCost struct {
	AmountIn     *big.Int `json:"amount_in"`
	AmountOut    *big.Int `json:"amount_out"`
	Fee          *big.Int `json:"fee"`
	Route        string   `json:"route"`
	Slippage     *big.Int `json:"slippage"`
	PriceImpact  *big.Int `json:"price_impact"`
	GasEstimate  *big.Int `json:"gas_estimate"`
}

// OrderRequest represents a limit order request
type OrderRequest struct {
	TokenIn    string   `json:"token_in"`
	TokenOut   string   `json:"token_out"`
	AmountIn   *big.Int `json:"amount_in"`
	Price      *big.Int `json:"price"`
	Deadline   int64    `json:"deadline"`
	User       string   `json:"user"`
}

// Order represents a limit order
type Order struct {
	ID        string   `json:"id"`
	User      string   `json:"user"`
	TokenIn   string   `json:"token_in"`
	TokenOut  string   `json:"token_out"`
	AmountIn  *big.Int `json:"amount_in"`
	Price     *big.Int `json:"price"`
	IsActive  bool     `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// OrderRouter handles order routing and execution
type OrderRouter struct {
	config     *config.Config
	orderbook  *orderbook.OrderBook
	amm        *amm.AMM
	feeCollector *fee.FeeCollector
	storage    *storage.Storage
}

// NewOrderRouter creates a new order router instance
func NewOrderRouter(cfg *config.Config) (*OrderRouter, error) {
	// Initialize storage
	storage, err := storage.NewStorage(cfg.Database)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize storage: %w", err)
	}

	// Initialize order book
	orderbook, err := orderbook.NewOrderBook(cfg.OrderBook)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize order book: %w", err)
	}

	// Initialize AMM
	amm, err := amm.NewAMM(cfg.AMM)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize AMM: %w", err)
	}

	// Initialize fee collector
	feeCollector, err := fee.NewFeeCollector(cfg.Fee)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize fee collector: %w", err)
	}

	return &OrderRouter{
		config:       cfg,
		orderbook:    orderbook,
		amm:          amm,
		feeCollector: feeCollector,
		storage:      storage,
	}, nil
}

// CalculateSwapCost calculates the cost for a token swap
func (or *OrderRouter) CalculateSwapCost(ctx context.Context, request *SwapRequest) (*SwapCost, error) {
	// Get best price from order book
	orderbookPrice, err := or.orderbook.GetBestPrice(ctx, request.TokenIn, request.TokenOut)
	if err != nil {
		return nil, fmt.Errorf("failed to get order book price: %w", err)
	}

	// Get AMM price
	ammPrice, err := or.amm.GetPrice(ctx, request.TokenIn, request.TokenOut)
	if err != nil {
		return nil, fmt.Errorf("failed to get AMM price: %w", err)
	}

	// Choose the best route
	var bestRoute string
	var bestPrice *big.Int
	var bestFee *big.Int

	if orderbookPrice.Price.Cmp(ammPrice.Price) > 0 {
		// Order book has better price
		bestRoute = "orderbook"
		bestPrice = orderbookPrice.Price
		bestFee = orderbookPrice.Fee
	} else {
		// AMM has better price
		bestRoute = "amm"
		bestPrice = ammPrice.Price
		bestFee = ammPrice.Fee
	}

	// Calculate output amount
	amountOut := new(big.Int).Mul(request.AmountIn, bestPrice)
	amountOut.Div(amountOut, big.NewInt(1e18)) // Adjust for decimals

	// Calculate fee
	feeAmount := or.feeCollector.CalculateFee(request.AmountIn, bestFee)

	// Calculate slippage
	slippage := or.calculateSlippage(request.AmountIn, amountOut, bestPrice)

	// Calculate price impact
	priceImpact := or.calculatePriceImpact(request.AmountIn, amountOut, bestPrice)

	// Estimate gas
	gasEstimate := or.estimateGas(request.TokenIn, request.TokenOut, request.AmountIn)

	return &SwapCost{
		AmountIn:     request.AmountIn,
		AmountOut:    amountOut,
		Fee:          feeAmount,
		Route:        bestRoute,
		Slippage:     slippage,
		PriceImpact:  priceImpact,
		GasEstimate:  gasEstimate,
	}, nil
}

// CreateLimitOrder creates a new limit order
func (or *OrderRouter) CreateLimitOrder(ctx context.Context, request *OrderRequest) (*Order, error) {
	// Validate request
	if err := or.validateOrderRequest(request); err != nil {
		return nil, fmt.Errorf("invalid order request: %w", err)
	}

	// Create order
	order := &Order{
		ID:        or.generateOrderID(),
		User:      request.User,
		TokenIn:   request.TokenIn,
		TokenOut:  request.TokenOut,
		AmountIn:  request.AmountIn,
		Price:     request.Price,
		IsActive:  true,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	// Add to order book
	if err := or.orderbook.AddOrder(ctx, order); err != nil {
		return nil, fmt.Errorf("failed to add order to order book: %w", err)
	}

	// Store in database
	if err := or.storage.StoreOrder(ctx, order); err != nil {
		return nil, fmt.Errorf("failed to store order: %w", err)
	}

	return order, nil
}

// CancelOrder cancels an existing order
func (or *OrderRouter) CancelOrder(ctx context.Context, orderID string, user string) error {
	// Get order from storage
	order, err := or.storage.GetOrder(ctx, orderID)
	if err != nil {
		return fmt.Errorf("failed to get order: %w", err)
	}

	// Check if user owns the order
	if order.User != user {
		return fmt.Errorf("unauthorized: user does not own this order")
	}

	// Cancel order in order book
	if err := or.orderbook.CancelOrder(ctx, orderID); err != nil {
		return fmt.Errorf("failed to cancel order in order book: %w", err)
	}

	// Update order in storage
	order.IsActive = false
	order.UpdatedAt = time.Now()
	if err := or.storage.UpdateOrder(ctx, order); err != nil {
		return fmt.Errorf("failed to update order: %w", err)
	}

	return nil
}

// GetUserOrders retrieves orders for a specific user
func (or *OrderRouter) GetUserOrders(ctx context.Context, user string, limit int) ([]*Order, error) {
	return or.storage.GetUserOrders(ctx, user, limit)
}

// GetOrderBook retrieves the current order book for a token pair
func (or *OrderRouter) GetOrderBook(ctx context.Context, tokenIn, tokenOut string, limit int) (*OrderBookData, error) {
	return or.orderbook.GetOrderBook(ctx, tokenIn, tokenOut, limit)
}

// OrderBookData represents order book data
type OrderBookData struct {
	Bids []OrderBookEntry `json:"bids"`
	Asks []OrderBookEntry `json:"asks"`
}

// OrderBookEntry represents an order book entry
type OrderBookEntry struct {
	Price  *big.Int `json:"price"`
	Amount *big.Int `json:"amount"`
}

// validateOrderRequest validates an order request
func (or *OrderRouter) validateOrderRequest(request *OrderRequest) error {
	if request.TokenIn == "" || request.TokenOut == "" {
		return fmt.Errorf("token addresses cannot be empty")
	}
	if request.AmountIn.Cmp(big.NewInt(0)) <= 0 {
		return fmt.Errorf("amount must be positive")
	}
	if request.Price.Cmp(big.NewInt(0)) <= 0 {
		return fmt.Errorf("price must be positive")
	}
	if request.Deadline <= time.Now().Unix() {
		return fmt.Errorf("deadline must be in the future")
	}
	return nil
}

// generateOrderID generates a unique order ID
func (or *OrderRouter) generateOrderID() string {
	return fmt.Sprintf("order_%d", time.Now().UnixNano())
}

// calculateSlippage calculates the slippage for a trade
func (or *OrderRouter) calculateSlippage(amountIn, amountOut, price *big.Int) *big.Int {
	// Simplified slippage calculation
	expectedOut := new(big.Int).Mul(amountIn, price)
	expectedOut.Div(expectedOut, big.NewInt(1e18))
	
	if expectedOut.Cmp(big.NewInt(0)) == 0 {
		return big.NewInt(0)
	}
	
	slippage := new(big.Int).Sub(expectedOut, amountOut)
	slippage.Mul(slippage, big.NewInt(10000)) // Convert to basis points
	slippage.Div(slippage, expectedOut)
	
	return slippage
}

// calculatePriceImpact calculates the price impact for a trade
func (or *OrderRouter) calculatePriceImpact(amountIn, amountOut, price *big.Int) *big.Int {
	// Simplified price impact calculation
	// This would be more complex in a real implementation
	return big.NewInt(50) // 0.5% price impact
}

// estimateGas estimates the gas cost for a trade
func (or *OrderRouter) estimateGas(tokenIn, tokenOut string, amount *big.Int) *big.Int {
	// Simplified gas estimation
	// This would be more complex in a real implementation
	return big.NewInt(150000) // 150k gas
}

// Close gracefully shuts down the order router
func (or *OrderRouter) Close() error {
	var err error

	if or.orderbook != nil {
		if closeErr := or.orderbook.Close(); closeErr != nil {
			err = fmt.Errorf("failed to close order book: %w", closeErr)
		}
	}

	if or.amm != nil {
		if closeErr := or.amm.Close(); closeErr != nil {
			err = fmt.Errorf("failed to close AMM: %w", closeErr)
		}
	}

	if or.storage != nil {
		if closeErr := or.storage.Close(); closeErr != nil {
			err = fmt.Errorf("failed to close storage: %w", closeErr)
		}
	}

	return err
}