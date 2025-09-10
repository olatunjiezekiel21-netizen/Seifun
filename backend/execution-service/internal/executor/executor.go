package executor

import (
	"context"
	"fmt"
	"math/big"
	"time"

	"seifun/backend/execution-service/internal/config"
	"seifun/backend/execution-service/internal/evm"
	"seifun/backend/execution-service/internal/native"
	"seifun/backend/execution-service/internal/storage"
)

// ExecutionRequest represents a transaction execution request
type ExecutionRequest struct {
	Type        string   `json:"type"`
	TokenIn     string   `json:"token_in"`
	TokenOut    string   `json:"token_out"`
	AmountIn    *big.Int `json:"amount_in"`
	AmountOut   *big.Int `json:"amount_out"`
	User        string   `json:"user"`
	PrivateKey  string   `json:"private_key"`
	GasLimit    *big.Int `json:"gas_limit"`
	GasPrice    *big.Int `json:"gas_price"`
	Nonce       *big.Int `json:"nonce"`
}

// ExecutionResult represents the result of a transaction execution
type ExecutionResult struct {
	Success     bool      `json:"success"`
	TxHash      string    `json:"tx_hash"`
	GasUsed     *big.Int  `json:"gas_used"`
	GasPrice    *big.Int  `json:"gas_price"`
	BlockNumber *big.Int  `json:"block_number"`
	Timestamp   time.Time `json:"timestamp"`
	Error       string    `json:"error,omitempty"`
}

// ExecutionService handles transaction execution for both EVM and Native chains
type ExecutionService struct {
	config      *config.Config
	evmExecutor *evm.EVMExecutor
	nativeExecutor *native.NativeExecutor
	storage     *storage.Storage
}

// NewExecutionService creates a new execution service instance
func NewExecutionService(cfg *config.Config) (*ExecutionService, error) {
	// Initialize storage
	storage, err := storage.NewStorage(cfg.Database)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize storage: %w", err)
	}

	// Initialize EVM executor
	evmExecutor, err := evm.NewEVMExecutor(cfg.EVM)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize EVM executor: %w", err)
	}

	// Initialize Native executor
	nativeExecutor, err := native.NewNativeExecutor(cfg.Native)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize Native executor: %w", err)
	}

	return &ExecutionService{
		config:        cfg,
		evmExecutor:   evmExecutor,
		nativeExecutor: nativeExecutor,
		storage:       storage,
	}, nil
}

// ExecuteSwap executes a token swap transaction
func (es *ExecutionService) ExecuteSwap(ctx context.Context, request *ExecutionRequest) (*ExecutionResult, error) {
	// Validate request
	if err := es.validateExecutionRequest(request); err != nil {
		return nil, fmt.Errorf("invalid execution request: %w", err)
	}

	// Determine if this is an EVM or Native transaction
	isEVM := es.isEVMToken(request.TokenIn)

	var result *ExecutionResult
	var err error

	if isEVM {
		// Execute EVM transaction
		result, err = es.evmExecutor.ExecuteSwap(ctx, request)
		if err != nil {
			return nil, fmt.Errorf("failed to execute EVM swap: %w", err)
		}
	} else {
		// Execute Native transaction
		result, err = es.nativeExecutor.ExecuteSwap(ctx, request)
		if err != nil {
			return nil, fmt.Errorf("failed to execute Native swap: %w", err)
		}
	}

	// Store execution result
	if err := es.storage.StoreExecution(ctx, result); err != nil {
		// Log error but don't fail the execution
		fmt.Printf("Warning: failed to store execution result: %v\n", err)
	}

	return result, nil
}

// ExecuteLimitOrder executes a limit order transaction
func (es *ExecutionService) ExecuteLimitOrder(ctx context.Context, request *ExecutionRequest) (*ExecutionResult, error) {
	// Validate request
	if err := es.validateExecutionRequest(request); err != nil {
		return nil, fmt.Errorf("invalid execution request: %w", err)
	}

	// Determine if this is an EVM or Native transaction
	isEVM := es.isEVMToken(request.TokenIn)

	var result *ExecutionResult
	var err error

	if isEVM {
		// Execute EVM transaction
		result, err = es.evmExecutor.ExecuteLimitOrder(ctx, request)
		if err != nil {
			return nil, fmt.Errorf("failed to execute EVM limit order: %w", err)
		}
	} else {
		// Execute Native transaction
		result, err = es.nativeExecutor.ExecuteLimitOrder(ctx, request)
		if err != nil {
			return nil, fmt.Errorf("failed to execute Native limit order: %w", err)
		}
	}

	// Store execution result
	if err := es.storage.StoreExecution(ctx, result); err != nil {
		// Log error but don't fail the execution
		fmt.Printf("Warning: failed to store execution result: %v\n", err)
	}

	return result, nil
}

// ExecuteLiquidityAdd executes a liquidity addition transaction
func (es *ExecutionService) ExecuteLiquidityAdd(ctx context.Context, request *ExecutionRequest) (*ExecutionResult, error) {
	// Validate request
	if err := es.validateExecutionRequest(request); err != nil {
		return nil, fmt.Errorf("invalid execution request: %w", err)
	}

	// Determine if this is an EVM or Native transaction
	isEVM := es.isEVMToken(request.TokenIn)

	var result *ExecutionResult
	var err error

	if isEVM {
		// Execute EVM transaction
		result, err = es.evmExecutor.ExecuteLiquidityAdd(ctx, request)
		if err != nil {
			return nil, fmt.Errorf("failed to execute EVM liquidity add: %w", err)
		}
	} else {
		// Execute Native transaction
		result, err = es.nativeExecutor.ExecuteLiquidityAdd(ctx, request)
		if err != nil {
			return nil, fmt.Errorf("failed to execute Native liquidity add: %w", err)
		}
	}

	// Store execution result
	if err := es.storage.StoreExecution(ctx, result); err != nil {
		// Log error but don't fail the execution
		fmt.Printf("Warning: failed to store execution result: %v\n", err)
	}

	return result, nil
}

// ExecuteLiquidityRemove executes a liquidity removal transaction
func (es *ExecutionService) ExecuteLiquidityRemove(ctx context.Context, request *ExecutionRequest) (*ExecutionResult, error) {
	// Validate request
	if err := es.validateExecutionRequest(request); err != nil {
		return nil, fmt.Errorf("invalid execution request: %w", err)
	}

	// Determine if this is an EVM or Native transaction
	isEVM := es.isEVMToken(request.TokenIn)

	var result *ExecutionResult
	var err error

	if isEVM {
		// Execute EVM transaction
		result, err = es.evmExecutor.ExecuteLiquidityRemove(ctx, request)
		if err != nil {
			return nil, fmt.Errorf("failed to execute EVM liquidity remove: %w", err)
		}
	} else {
		// Execute Native transaction
		result, err = es.nativeExecutor.ExecuteLiquidityRemove(ctx, request)
		if err != nil {
			return nil, fmt.Errorf("failed to execute Native liquidity remove: %w", err)
		}
	}

	// Store execution result
	if err := es.storage.StoreExecution(ctx, result); err != nil {
		// Log error but don't fail the execution
		fmt.Printf("Warning: failed to store execution result: %v\n", err)
	}

	return result, nil
}

// GetExecutionHistory retrieves execution history for a user
func (es *ExecutionService) GetExecutionHistory(ctx context.Context, user string, limit int) ([]*ExecutionResult, error) {
	return es.storage.GetExecutionHistory(ctx, user, limit)
}

// GetExecutionStatus retrieves the status of a specific execution
func (es *ExecutionService) GetExecutionStatus(ctx context.Context, txHash string) (*ExecutionResult, error) {
	return es.storage.GetExecution(ctx, txHash)
}

// isEVMToken determines if a token is an EVM token
func (es *ExecutionService) isEVMToken(token string) bool {
	// EVM addresses start with 0x and are 42 characters long
	if len(token) == 42 && token[:2] == "0x" {
		return true
	}
	return false
}

// validateExecutionRequest validates an execution request
func (es *ExecutionService) validateExecutionRequest(request *ExecutionRequest) error {
	if request.Type == "" {
		return fmt.Errorf("execution type cannot be empty")
	}
	if request.TokenIn == "" || request.TokenOut == "" {
		return fmt.Errorf("token addresses cannot be empty")
	}
	if request.AmountIn.Cmp(big.NewInt(0)) <= 0 {
		return fmt.Errorf("amount must be positive")
	}
	if request.User == "" {
		return fmt.Errorf("user address cannot be empty")
	}
	if request.PrivateKey == "" {
		return fmt.Errorf("private key cannot be empty")
	}
	return nil
}

// Close gracefully shuts down the execution service
func (es *ExecutionService) Close() error {
	var err error

	if es.evmExecutor != nil {
		if closeErr := es.evmExecutor.Close(); closeErr != nil {
			err = fmt.Errorf("failed to close EVM executor: %w", closeErr)
		}
	}

	if es.nativeExecutor != nil {
		if closeErr := es.nativeExecutor.Close(); closeErr != nil {
			err = fmt.Errorf("failed to close Native executor: %w", closeErr)
		}
	}

	if es.storage != nil {
		if closeErr := es.storage.Close(); closeErr != nil {
			err = fmt.Errorf("failed to close storage: %w", closeErr)
		}
	}

	return err
}