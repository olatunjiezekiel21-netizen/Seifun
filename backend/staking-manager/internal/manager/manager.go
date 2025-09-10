package manager

import (
	"context"
	"fmt"
	"math/big"
	"time"

	"seifun/backend/staking-manager/internal/config"
	"seifun/backend/staking-manager/internal/evm"
	"seifun/backend/staking-manager/internal/native"
	"seifun/backend/staking-manager/internal/storage"
)

// StakingRequest represents a staking request
type StakingRequest struct {
	User        string   `json:"user"`
	Token       string   `json:"token"`
	Amount      *big.Int `json:"amount"`
	Duration    int64    `json:"duration"`
	PrivateKey  string   `json:"private_key"`
	GasLimit    *big.Int `json:"gas_limit"`
	GasPrice    *big.Int `json:"gas_price"`
	Nonce       *big.Int `json:"nonce"`
}

// StakingResult represents the result of a staking operation
type StakingResult struct {
	Success     bool      `json:"success"`
	TxHash      string    `json:"tx_hash"`
	StakeID     string    `json:"stake_id"`
	Amount      *big.Int  `json:"amount"`
	Duration    int64     `json:"duration"`
	APY         float64   `json:"apy"`
	Rewards     *big.Int  `json:"rewards"`
	GasUsed     *big.Int  `json:"gas_used"`
	GasPrice    *big.Int  `json:"gas_price"`
	BlockNumber *big.Int  `json:"block_number"`
	Timestamp   time.Time `json:"timestamp"`
	Error       string    `json:"error,omitempty"`
}

// UnstakingRequest represents an unstaking request
type UnstakingRequest struct {
	User       string   `json:"user"`
	StakeID    string   `json:"stake_id"`
	PrivateKey string   `json:"private_key"`
	GasLimit   *big.Int `json:"gas_limit"`
	GasPrice   *big.Int `json:"gas_price"`
	Nonce      *big.Int `json:"nonce"`
}

// UnstakingResult represents the result of an unstaking operation
type UnstakingResult struct {
	Success     bool      `json:"success"`
	TxHash      string    `json:"tx_hash"`
	StakeID     string    `json:"stake_id"`
	Amount      *big.Int  `json:"amount"`
	Rewards     *big.Int  `json:"rewards"`
	GasUsed     *big.Int  `json:"gas_used"`
	GasPrice    *big.Int  `json:"gas_price"`
	BlockNumber *big.Int  `json:"block_number"`
	Timestamp   time.Time `json:"timestamp"`
	Error       string    `json:"error,omitempty"`
}

// StakingManager handles staking operations for both EVM and Native chains
type StakingManager struct {
	config      *config.Config
	evmStaking  *evm.EVMStaking
	nativeStaking *native.NativeStaking
	storage     *storage.Storage
}

// NewStakingManager creates a new staking manager instance
func NewStakingManager(cfg *config.Config) (*StakingManager, error) {
	// Initialize storage
	storage, err := storage.NewStorage(cfg.Database)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize storage: %w", err)
	}

	// Initialize EVM staking
	evmStaking, err := evm.NewEVMStaking(cfg.EVM)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize EVM staking: %w", err)
	}

	// Initialize Native staking
	nativeStaking, err := native.NewNativeStaking(cfg.Native)
	if err != nil {
		return nil, fmt.Errorf("failed to initialize Native staking: %w", err)
	}

	return &StakingManager{
		config:        cfg,
		evmStaking:    evmStaking,
		nativeStaking: nativeStaking,
		storage:       storage,
	}, nil
}

// Stake executes a staking transaction
func (sm *StakingManager) Stake(ctx context.Context, request *StakingRequest) (*StakingResult, error) {
	// Validate request
	if err := sm.validateStakingRequest(request); err != nil {
		return nil, fmt.Errorf("invalid staking request: %w", err)
	}

	// Determine if this is an EVM or Native transaction
	isEVM := sm.isEVMToken(request.Token)

	var result *StakingResult
	var err error

	if isEVM {
		// Execute EVM staking
		result, err = sm.evmStaking.Stake(ctx, request)
		if err != nil {
			return nil, fmt.Errorf("failed to execute EVM staking: %w", err)
		}
	} else {
		// Execute Native staking
		result, err = sm.nativeStaking.Stake(ctx, request)
		if err != nil {
			return nil, fmt.Errorf("failed to execute Native staking: %w", err)
		}
	}

	// Store staking result
	if err := sm.storage.StoreStaking(ctx, result); err != nil {
		// Log error but don't fail the staking
		fmt.Printf("Warning: failed to store staking result: %v\n", err)
	}

	return result, nil
}

// Unstake executes an unstaking transaction
func (sm *StakingManager) Unstake(ctx context.Context, request *UnstakingRequest) (*UnstakingResult, error) {
	// Validate request
	if err := sm.validateUnstakingRequest(request); err != nil {
		return nil, fmt.Errorf("invalid unstaking request: %w", err)
	}

	// Get staking information from storage
	stakingInfo, err := sm.storage.GetStaking(ctx, request.StakeID)
	if err != nil {
		return nil, fmt.Errorf("failed to get staking information: %w", err)
	}

	// Determine if this is an EVM or Native transaction
	isEVM := sm.isEVMToken(stakingInfo.Token)

	var result *UnstakingResult
	var unstakeErr error

	if isEVM {
		// Execute EVM unstaking
		result, err = sm.evmStaking.Unstake(ctx, request)
		if err != nil {
			return nil, fmt.Errorf("failed to execute EVM unstaking: %w", err)
		}
	} else {
		// Execute Native unstaking
		result, err = sm.nativeStaking.Unstake(ctx, request)
		if err != nil {
			return nil, fmt.Errorf("failed to execute Native unstaking: %w", err)
		}
	}

	// Store unstaking result
	if err := sm.storage.StoreUnstaking(ctx, result); err != nil {
		// Log error but don't fail the unstaking
		fmt.Printf("Warning: failed to store unstaking result: %v\n", err)
	}

	return result, unstakeErr
}

// GetStakingInfo retrieves staking information for a user
func (sm *StakingManager) GetStakingInfo(ctx context.Context, user string) (*StakingInfo, error) {
	return sm.storage.GetStakingInfo(ctx, user)
}

// GetStakingHistory retrieves staking history for a user
func (sm *StakingManager) GetStakingHistory(ctx context.Context, user string, limit int) ([]*StakingResult, error) {
	return sm.storage.GetStakingHistory(ctx, user, limit)
}

// GetUnstakingHistory retrieves unstaking history for a user
func (sm *StakingManager) GetUnstakingHistory(ctx context.Context, user string, limit int) ([]*UnstakingResult, error) {
	return sm.storage.GetUnstakingHistory(ctx, user, limit)
}

// GetStakingRewards calculates and retrieves staking rewards for a user
func (sm *StakingManager) GetStakingRewards(ctx context.Context, user string) (*StakingRewards, error) {
	return sm.storage.GetStakingRewards(ctx, user)
}

// StakingInfo represents staking information for a user
type StakingInfo struct {
	User           string   `json:"user"`
	TotalStaked    *big.Int `json:"total_staked"`
	ActiveStakes   int      `json:"active_stakes"`
	TotalRewards   *big.Int `json:"total_rewards"`
	PendingRewards *big.Int `json:"pending_rewards"`
	LastUpdated    time.Time `json:"last_updated"`
}

// StakingRewards represents staking rewards for a user
type StakingRewards struct {
	User           string   `json:"user"`
	TotalRewards   *big.Int `json:"total_rewards"`
	PendingRewards *big.Int `json:"pending_rewards"`
	ClaimedRewards *big.Int `json:"claimed_rewards"`
	APY            float64  `json:"apy"`
	LastUpdated    time.Time `json:"last_updated"`
}

// isEVMToken determines if a token is an EVM token
func (sm *StakingManager) isEVMToken(token string) bool {
	// EVM addresses start with 0x and are 42 characters long
	if len(token) == 42 && token[:2] == "0x" {
		return true
	}
	return false
}

// validateStakingRequest validates a staking request
func (sm *StakingManager) validateStakingRequest(request *StakingRequest) error {
	if request.User == "" {
		return fmt.Errorf("user address cannot be empty")
	}
	if request.Token == "" {
		return fmt.Errorf("token address cannot be empty")
	}
	if request.Amount.Cmp(big.NewInt(0)) <= 0 {
		return fmt.Errorf("amount must be positive")
	}
	if request.Duration <= 0 {
		return fmt.Errorf("duration must be positive")
	}
	if request.PrivateKey == "" {
		return fmt.Errorf("private key cannot be empty")
	}
	return nil
}

// validateUnstakingRequest validates an unstaking request
func (sm *StakingManager) validateUnstakingRequest(request *UnstakingRequest) error {
	if request.User == "" {
		return fmt.Errorf("user address cannot be empty")
	}
	if request.StakeID == "" {
		return fmt.Errorf("stake ID cannot be empty")
	}
	if request.PrivateKey == "" {
		return fmt.Errorf("private key cannot be empty")
	}
	return nil
}

// Close gracefully shuts down the staking manager
func (sm *StakingManager) Close() error {
	var err error

	if sm.evmStaking != nil {
		if closeErr := sm.evmStaking.Close(); closeErr != nil {
			err = fmt.Errorf("failed to close EVM staking: %w", closeErr)
		}
	}

	if sm.nativeStaking != nil {
		if closeErr := sm.nativeStaking.Close(); closeErr != nil {
			err = fmt.Errorf("failed to close Native staking: %w", closeErr)
		}
	}

	if sm.storage != nil {
		if closeErr := sm.storage.Close(); closeErr != nil {
			err = fmt.Errorf("failed to close storage: %w", closeErr)
		}
	}

	return err
}