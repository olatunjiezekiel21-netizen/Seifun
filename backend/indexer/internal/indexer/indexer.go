package indexer

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"seifun/indexer/internal/config"
	"seifun/indexer/internal/storage"
	"seifun/indexer/internal/types"
)

// Indexer handles blockchain data indexing for both Sei EVM and Native
type Indexer struct {
	config  *config.Config
	db      *storage.PostgresDB
	redis   *storage.Redis
	evmIndexer   *EVMIndexer
	nativeIndexer *NativeIndexer
}

// NewIndexer creates a new indexer instance
func NewIndexer(cfg *config.Config, db *storage.PostgresDB, redis *storage.Redis) (*Indexer, error) {
	evmIndexer, err := NewEVMIndexer(cfg.EVM, db, redis)
	if err != nil {
		return nil, fmt.Errorf("failed to create EVM indexer: %w", err)
	}

	nativeIndexer, err := NewNativeIndexer(cfg.Native, db, redis)
	if err != nil {
		return nil, fmt.Errorf("failed to create native indexer: %w", err)
	}

	return &Indexer{
		config:        cfg,
		db:            db,
		redis:         redis,
		evmIndexer:    evmIndexer,
		nativeIndexer: nativeIndexer,
	}, nil
}

// Start begins indexing for both chains
func (i *Indexer) Start(ctx context.Context) error {
	log.Println("Starting Seifun Indexer...")

	// Start EVM indexer
	go func() {
		if err := i.evmIndexer.Start(ctx); err != nil {
			log.Printf("EVM indexer error: %v", err)
		}
	}()

	// Start Native indexer
	go func() {
		if err := i.nativeIndexer.Start(ctx); err != nil {
			log.Printf("Native indexer error: %v", err)
		}
	}()

	// Start cross-chain event processing
	go i.processCrossChainEvents(ctx)

	// Start metrics collection
	go i.collectMetrics(ctx)

	log.Println("Indexer started successfully")
	return nil
}

// Stop gracefully stops the indexer
func (i *Indexer) Stop(ctx context.Context) error {
	log.Println("Stopping indexer...")

	// Stop EVM indexer
	if err := i.evmIndexer.Stop(ctx); err != nil {
		log.Printf("Error stopping EVM indexer: %v", err)
	}

	// Stop Native indexer
	if err := i.nativeIndexer.Stop(ctx); err != nil {
		log.Printf("Error stopping native indexer: %v", err)
	}

	log.Println("Indexer stopped")
	return nil
}

// processCrossChainEvents handles cross-chain events and arbitrage opportunities
func (i *Indexer) processCrossChainEvents(ctx context.Context) {
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			if err := i.detectArbitrageOpportunities(); err != nil {
				log.Printf("Error detecting arbitrage opportunities: %v", err)
			}
		}
	}
}

// collectMetrics collects and stores performance metrics
func (i *Indexer) collectMetrics(ctx context.Context) {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			if err := i.collectIndexerMetrics(); err != nil {
				log.Printf("Error collecting metrics: %v", err)
			}
		}
	}
}

// detectArbitrageOpportunities detects price differences between EVM and Native
func (i *Indexer) detectArbitrageOpportunities() error {
	// Get latest prices from both chains
	evmPrices, err := i.evmIndexer.GetLatestPrices()
	if err != nil {
		return fmt.Errorf("failed to get EVM prices: %w", err)
	}

	nativePrices, err := i.nativeIndexer.GetLatestPrices()
	if err != nil {
		return fmt.Errorf("failed to get native prices: %w", err)
	}

	// Compare prices and detect arbitrage opportunities
	opportunities := i.findArbitrageOpportunities(evmPrices, nativePrices)

	// Store opportunities in Redis for real-time access
	if len(opportunities) > 0 {
		data, err := json.Marshal(opportunities)
		if err != nil {
			return fmt.Errorf("failed to marshal opportunities: %w", err)
		}

		if err := i.redis.Set("arbitrage_opportunities", data, 10*time.Second); err != nil {
			return fmt.Errorf("failed to store opportunities: %w", err)
		}
	}

	return nil
}

// findArbitrageOpportunities finds price differences between chains
func (i *Indexer) findArbitrageOpportunities(evmPrices, nativePrices map[string]float64) []types.ArbitrageOpportunity {
	var opportunities []types.ArbitrageOpportunity

	for token, evmPrice := range evmPrices {
		if nativePrice, exists := nativePrices[token]; exists {
			// Calculate price difference percentage
			diff := (evmPrice - nativePrice) / nativePrice * 100

			// If difference is significant (>1%), create opportunity
			if diff > 1.0 || diff < -1.0 {
				opportunity := types.ArbitrageOpportunity{
					Token:           token,
					EVMPrice:        evmPrice,
					NativePrice:     nativePrice,
					PriceDifference: diff,
					Timestamp:       time.Now(),
				}

				if diff > 0 {
					opportunity.Direction = "buy_native_sell_evm"
				} else {
					opportunity.Direction = "buy_evm_sell_native"
				}

				opportunities = append(opportunities, opportunity)
			}
		}
	}

	return opportunities
}

// collectIndexerMetrics collects performance metrics
func (i *Indexer) collectIndexerMetrics() error {
	metrics := types.IndexerMetrics{
		Timestamp: time.Now(),
	}

	// Get EVM metrics
	evmMetrics, err := i.evmIndexer.GetMetrics()
	if err != nil {
		return fmt.Errorf("failed to get EVM metrics: %w", err)
	}
	metrics.EVM = evmMetrics

	// Get Native metrics
	nativeMetrics, err := i.nativeIndexer.GetMetrics()
	if err != nil {
		return fmt.Errorf("failed to get native metrics: %w", err)
	}
	metrics.Native = nativeMetrics

	// Store metrics in database
	if err := i.db.StoreMetrics(metrics); err != nil {
		return fmt.Errorf("failed to store metrics: %w", err)
	}

	// Cache metrics in Redis
	data, err := json.Marshal(metrics)
	if err != nil {
		return fmt.Errorf("failed to marshal metrics: %w", err)
	}

	if err := i.redis.Set("indexer_metrics", data, 60*time.Second); err != nil {
		return fmt.Errorf("failed to cache metrics: %w", err)
	}

	return nil
}

// GetLatestPrices returns the latest prices from both chains
func (i *Indexer) GetLatestPrices() (map[string]float64, error) {
	// Get EVM prices
	evmPrices, err := i.evmIndexer.GetLatestPrices()
	if err != nil {
		return nil, fmt.Errorf("failed to get EVM prices: %w", err)
	}

	// Get Native prices
	nativePrices, err := i.nativeIndexer.GetLatestPrices()
	if err != nil {
		return nil, fmt.Errorf("failed to get native prices: %w", err)
	}

	// Merge prices
	allPrices := make(map[string]float64)
	for token, price := range evmPrices {
		allPrices[token+"_evm"] = price
	}
	for token, price := range nativePrices {
		allPrices[token+"_native"] = price
	}

	return allPrices, nil
}

// GetArbitrageOpportunities returns current arbitrage opportunities
func (i *Indexer) GetArbitrageOpportunities() ([]types.ArbitrageOpportunity, error) {
	data, err := i.redis.Get("arbitrage_opportunities")
	if err != nil {
		return nil, fmt.Errorf("failed to get opportunities from cache: %w", err)
	}

	var opportunities []types.ArbitrageOpportunity
	if err := json.Unmarshal(data, &opportunities); err != nil {
		return nil, fmt.Errorf("failed to unmarshal opportunities: %w", err)
	}

	return opportunities, nil
}