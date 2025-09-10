package backend_test

import (
	"context"
	"math/big"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"

	"seifun/backend/staking-manager"
	"seifun/backend/staking-manager/mocks"
)

// Mock dependencies
type mockEVMStaking struct {
	mocks.MockEVMStaking
}

type mockNativeStaking struct {
	mocks.MockNativeStaking
}

type mockStorage struct {
	mocks.MockStorage
}

func TestStakingManager(t *testing.T) {
	ctx := context.Background()

	// Initialize mocks
	evmStaking := &mockEVMStaking{}
	nativeStaking := &mockNativeStaking{}
	storage := &mockStorage{}

	// Create staking manager instance
	stakingManager := staking_manager.NewStakingManager(evmStaking, nativeStaking, storage)

	t.Run("Test EVM Token Staking", func(t *testing.T) {
		// Mock EVM staking
		evmStaking.On("Stake", mock.AnythingOfType("*context.emptyCtx"), mock.AnythingOfType("*staking_manager.StakingRequest")).
			Return(&staking_manager.StakingResult{
				Success:     true,
				TxHash:      "0x1234567890abcdef",
				StakeID:     "stake_123",
				Amount:      big.NewInt(1000000000000000000000), // 1000 tokens
				Duration:    86400, // 1 day
				APY:         12.5,
				Rewards:     big.NewInt(50000000000000000000), // 50 tokens
				GasUsed:     big.NewInt(21000),
				GasPrice:    big.NewInt(20000000000), // 20 gwei
				BlockNumber: big.NewInt(12345),
				Timestamp:   time.Now(),
			}, nil)

		// Mock storage
		storage.On("StoreStaking", mock.AnythingOfType("*context.emptyCtx"), mock.AnythingOfType("*staking_manager.StakingResult")).
			Return(nil)

		// Test staking
		stakingRequest := &staking_manager.StakingRequest{
			User:       "0x1234567890123456789012345678901234567890",
			Token:      "0x9876543210987654321098765432109876543210",
			Amount:     big.NewInt(1000000000000000000000), // 1000 tokens
			Duration:   86400, // 1 day
			PrivateKey: "0xabcdef1234567890",
			GasLimit:   big.NewInt(100000),
			GasPrice:   big.NewInt(20000000000), // 20 gwei
			Nonce:      big.NewInt(1),
		}

		result, err := stakingManager.Stake(ctx, stakingRequest)
		require.NoError(t, err)

		// Verify results
		assert.True(t, result.Success)
		assert.Equal(t, "0x1234567890abcdef", result.TxHash)
		assert.Equal(t, "stake_123", result.StakeID)
		assert.Equal(t, big.NewInt(1000000000000000000000), result.Amount)
		assert.Equal(t, int64(86400), result.Duration)
		assert.Equal(t, 12.5, result.APY)
		assert.Equal(t, big.NewInt(50000000000000000000), result.Rewards)

		// Verify all mocks were called
		evmStaking.AssertExpectations(t)
		storage.AssertExpectations(t)
	})

	t.Run("Test Native SEI Token Staking", func(t *testing.T) {
		// Mock Native staking
		nativeStaking.On("Stake", mock.AnythingOfType("*context.emptyCtx"), mock.AnythingOfType("*staking_manager.StakingRequest")).
			Return(&staking_manager.StakingResult{
				Success:     true,
				TxHash:      "sei1abcdef1234567890",
				StakeID:     "stake_456",
				Amount:      big.NewInt(1000000000), // 1000 SEI
				Duration:    86400, // 1 day
				APY:         15.0,
				Rewards:     big.NewInt(50000000), // 50 SEI
				GasUsed:     big.NewInt(50000),
				GasPrice:    big.NewInt(1000000), // 1 SEI
				BlockNumber: big.NewInt(67890),
				Timestamp:   time.Now(),
			}, nil)

		// Mock storage
		storage.On("StoreStaking", mock.AnythingOfType("*context.emptyCtx"), mock.AnythingOfType("*staking_manager.StakingResult")).
			Return(nil)

		// Test staking
		stakingRequest := &staking_manager.StakingRequest{
			User:       "sei1user1234567890",
			Token:      "usei",
			Amount:     big.NewInt(1000000000), // 1000 SEI
			Duration:   86400, // 1 day
			PrivateKey: "sei1privatekey1234567890",
			GasLimit:   big.NewInt(200000),
			GasPrice:   big.NewInt(1000000), // 1 SEI
			Nonce:      big.NewInt(2),
		}

		result, err := stakingManager.Stake(ctx, stakingRequest)
		require.NoError(t, err)

		// Verify results
		assert.True(t, result.Success)
		assert.Equal(t, "sei1abcdef1234567890", result.TxHash)
		assert.Equal(t, "stake_456", result.StakeID)
		assert.Equal(t, big.NewInt(1000000000), result.Amount)
		assert.Equal(t, int64(86400), result.Duration)
		assert.Equal(t, 15.0, result.APY)
		assert.Equal(t, big.NewInt(50000000), result.Rewards)

		// Verify all mocks were called
		nativeStaking.AssertExpectations(t)
		storage.AssertExpectations(t)
	})

	t.Run("Test EVM Token Unstaking", func(t *testing.T) {
		// Mock storage to return staking info
		storage.On("GetStaking", mock.AnythingOfType("*context.emptyCtx"), "stake_123").
			Return(&staking_manager.StakingInfo{
				User:        "0x1234567890123456789012345678901234567890",
				Token:       "0x9876543210987654321098765432109876543210",
				Amount:      big.NewInt(1000000000000000000000), // 1000 tokens
				Duration:    86400, // 1 day
				APY:         12.5,
				Rewards:     big.NewInt(50000000000000000000), // 50 tokens
				CreatedAt:   time.Now().Add(-24 * time.Hour),
				IsActive:    true,
			}, nil)

		// Mock EVM unstaking
		evmStaking.On("Unstake", mock.AnythingOfType("*context.emptyCtx"), mock.AnythingOfType("*staking_manager.UnstakingRequest")).
			Return(&staking_manager.UnstakingResult{
				Success:     true,
				TxHash:      "0xabcdef1234567890",
				StakeID:     "stake_123",
				Amount:      big.NewInt(1000000000000000000000), // 1000 tokens
				Rewards:     big.NewInt(50000000000000000000), // 50 tokens
				GasUsed:     big.NewInt(25000),
				GasPrice:    big.NewInt(20000000000), // 20 gwei
				BlockNumber: big.NewInt(12346),
				Timestamp:   time.Now(),
			}, nil)

		// Mock storage
		storage.On("StoreUnstaking", mock.AnythingOfType("*context.emptyCtx"), mock.AnythingOfType("*staking_manager.UnstakingResult")).
			Return(nil)

		// Test unstaking
		unstakingRequest := &staking_manager.UnstakingRequest{
			User:       "0x1234567890123456789012345678901234567890",
			StakeID:    "stake_123",
			PrivateKey: "0xabcdef1234567890",
			GasLimit:   big.NewInt(100000),
			GasPrice:   big.NewInt(20000000000), // 20 gwei
			Nonce:      big.NewInt(3),
		}

		result, err := stakingManager.Unstake(ctx, unstakingRequest)
		require.NoError(t, err)

		// Verify results
		assert.True(t, result.Success)
		assert.Equal(t, "0xabcdef1234567890", result.TxHash)
		assert.Equal(t, "stake_123", result.StakeID)
		assert.Equal(t, big.NewInt(1000000000000000000000), result.Amount)
		assert.Equal(t, big.NewInt(50000000000000000000), result.Rewards)

		// Verify all mocks were called
		storage.AssertExpectations(t)
		evmStaking.AssertExpectations(t)
	})

	t.Run("Test Native SEI Token Unstaking", func(t *testing.T) {
		// Mock storage to return staking info
		storage.On("GetStaking", mock.AnythingOfType("*context.emptyCtx"), "stake_456").
			Return(&staking_manager.StakingInfo{
				User:        "sei1user1234567890",
				Token:       "usei",
				Amount:      big.NewInt(1000000000), // 1000 SEI
				Duration:    86400, // 1 day
				APY:         15.0,
				Rewards:     big.NewInt(50000000), // 50 SEI
				CreatedAt:   time.Now().Add(-24 * time.Hour),
				IsActive:    true,
			}, nil)

		// Mock Native unstaking
		nativeStaking.On("Unstake", mock.AnythingOfType("*context.emptyCtx"), mock.AnythingOfType("*staking_manager.UnstakingRequest")).
			Return(&staking_manager.UnstakingResult{
				Success:     true,
				TxHash:      "sei1unstake1234567890",
				StakeID:     "stake_456",
				Amount:      big.NewInt(1000000000), // 1000 SEI
				Rewards:     big.NewInt(50000000), // 50 SEI
				GasUsed:     big.NewInt(60000),
				GasPrice:    big.NewInt(1000000), // 1 SEI
				BlockNumber: big.NewInt(67891),
				Timestamp:   time.Now(),
			}, nil)

		// Mock storage
		storage.On("StoreUnstaking", mock.AnythingOfType("*context.emptyCtx"), mock.AnythingOfType("*staking_manager.UnstakingResult")).
			Return(nil)

		// Test unstaking
		unstakingRequest := &staking_manager.UnstakingRequest{
			User:       "sei1user1234567890",
			StakeID:    "stake_456",
			PrivateKey: "sei1privatekey1234567890",
			GasLimit:   big.NewInt(200000),
			GasPrice:   big.NewInt(1000000), // 1 SEI
			Nonce:      big.NewInt(4),
		}

		result, err := stakingManager.Unstake(ctx, unstakingRequest)
		require.NoError(t, err)

		// Verify results
		assert.True(t, result.Success)
		assert.Equal(t, "sei1unstake1234567890", result.TxHash)
		assert.Equal(t, "stake_456", result.StakeID)
		assert.Equal(t, big.NewInt(1000000000), result.Amount)
		assert.Equal(t, big.NewInt(50000000), result.Rewards)

		// Verify all mocks were called
		storage.AssertExpectations(t)
		nativeStaking.AssertExpectations(t)
	})

	t.Run("Test Get Staking Info", func(t *testing.T) {
		// Mock storage
		storage.On("GetStakingInfo", mock.AnythingOfType("*context.emptyCtx"), "0x1234567890123456789012345678901234567890").
			Return(&staking_manager.StakingInfo{
				User:           "0x1234567890123456789012345678901234567890",
				TotalStaked:    big.NewInt(5000000000000000000000), // 5000 tokens
				ActiveStakes:   5,
				TotalRewards:   big.NewInt(250000000000000000000), // 250 tokens
				PendingRewards: big.NewInt(50000000000000000000), // 50 tokens
				LastUpdated:    time.Now(),
			}, nil)

		// Test get staking info
		stakingInfo, err := stakingManager.GetStakingInfo(ctx, "0x1234567890123456789012345678901234567890")
		require.NoError(t, err)

		// Verify results
		assert.Equal(t, "0x1234567890123456789012345678901234567890", stakingInfo.User)
		assert.Equal(t, big.NewInt(5000000000000000000000), stakingInfo.TotalStaked)
		assert.Equal(t, 5, stakingInfo.ActiveStakes)
		assert.Equal(t, big.NewInt(250000000000000000000), stakingInfo.TotalRewards)
		assert.Equal(t, big.NewInt(50000000000000000000), stakingInfo.PendingRewards)

		// Verify mock was called
		storage.AssertExpectations(t)
	})

	t.Run("Test Get Staking History", func(t *testing.T) {
		// Mock storage
		storage.On("GetStakingHistory", mock.AnythingOfType("*context.emptyCtx"), "0x1234567890123456789012345678901234567890", 10).
			Return([]*staking_manager.StakingResult{
				{
					Success:     true,
					TxHash:      "0x1234567890abcdef",
					StakeID:     "stake_123",
					Amount:      big.NewInt(1000000000000000000000), // 1000 tokens
					Duration:    86400, // 1 day
					APY:         12.5,
					Rewards:     big.NewInt(50000000000000000000), // 50 tokens
					GasUsed:     big.NewInt(21000),
					GasPrice:    big.NewInt(20000000000), // 20 gwei
					BlockNumber: big.NewInt(12345),
					Timestamp:   time.Now().Add(-24 * time.Hour),
				},
				{
					Success:     true,
					TxHash:      "0xabcdef1234567890",
					StakeID:     "stake_124",
					Amount:      big.NewInt(2000000000000000000000), // 2000 tokens
					Duration:    172800, // 2 days
					APY:         15.0,
					Rewards:     big.NewInt(150000000000000000000), // 150 tokens
					GasUsed:     big.NewInt(25000),
					GasPrice:    big.NewInt(20000000000), // 20 gwei
					BlockNumber: big.NewInt(12346),
					Timestamp:   time.Now().Add(-48 * time.Hour),
				},
			}, nil)

		// Test get staking history
		stakingHistory, err := stakingManager.GetStakingHistory(ctx, "0x1234567890123456789012345678901234567890", 10)
		require.NoError(t, err)

		// Verify results
		assert.Len(t, stakingHistory, 2)
		assert.Equal(t, "stake_123", stakingHistory[0].StakeID)
		assert.Equal(t, "stake_124", stakingHistory[1].StakeID)
		assert.Equal(t, big.NewInt(1000000000000000000000), stakingHistory[0].Amount)
		assert.Equal(t, big.NewInt(2000000000000000000000), stakingHistory[1].Amount)

		// Verify mock was called
		storage.AssertExpectations(t)
	})

	t.Run("Test Get Staking Rewards", func(t *testing.T) {
		// Mock storage
		storage.On("GetStakingRewards", mock.AnythingOfType("*context.emptyCtx"), "0x1234567890123456789012345678901234567890").
			Return(&staking_manager.StakingRewards{
				User:           "0x1234567890123456789012345678901234567890",
				TotalRewards:   big.NewInt(500000000000000000000), // 500 tokens
				PendingRewards: big.NewInt(100000000000000000000), // 100 tokens
				ClaimedRewards: big.NewInt(400000000000000000000), // 400 tokens
				APY:            12.5,
				LastUpdated:    time.Now(),
			}, nil)

		// Test get staking rewards
		stakingRewards, err := stakingManager.GetStakingRewards(ctx, "0x1234567890123456789012345678901234567890")
		require.NoError(t, err)

		// Verify results
		assert.Equal(t, "0x1234567890123456789012345678901234567890", stakingRewards.User)
		assert.Equal(t, big.NewInt(500000000000000000000), stakingRewards.TotalRewards)
		assert.Equal(t, big.NewInt(100000000000000000000), stakingRewards.PendingRewards)
		assert.Equal(t, big.NewInt(400000000000000000000), stakingRewards.ClaimedRewards)
		assert.Equal(t, 12.5, stakingRewards.APY)

		// Verify mock was called
		storage.AssertExpectations(t)
	})

	t.Run("Test Invalid Staking Request", func(t *testing.T) {
		// Test invalid staking request
		stakingRequest := &staking_manager.StakingRequest{
			User:       "", // Invalid: empty user
			Token:      "0x9876543210987654321098765432109876543210",
			Amount:     big.NewInt(1000000000000000000000), // 1000 tokens
			Duration:   86400, // 1 day
			PrivateKey: "0xabcdef1234567890",
			GasLimit:   big.NewInt(100000),
			GasPrice:   big.NewInt(20000000000), // 20 gwei
			Nonce:      big.NewInt(1),
		}

		result, err := stakingManager.Stake(ctx, stakingRequest)
		require.Error(t, err)
		assert.Nil(t, result)
		assert.Contains(t, err.Error(), "user address cannot be empty")
	})

	t.Run("Test Invalid Unstaking Request", func(t *testing.T) {
		// Test invalid unstaking request
		unstakingRequest := &staking_manager.UnstakingRequest{
			User:       "0x1234567890123456789012345678901234567890",
			StakeID:    "", // Invalid: empty stake ID
			PrivateKey: "0xabcdef1234567890",
			GasLimit:   big.NewInt(100000),
			GasPrice:   big.NewInt(20000000000), // 20 gwei
			Nonce:      big.NewInt(3),
		}

		result, err := stakingManager.Unstake(ctx, unstakingRequest)
		require.Error(t, err)
		assert.Nil(t, result)
		assert.Contains(t, err.Error(), "stake ID cannot be empty")
	})

	t.Run("Test Staking Not Found", func(t *testing.T) {
		// Mock storage to return error
		storage.On("GetStaking", mock.AnythingOfType("*context.emptyCtx"), "stake_nonexistent").
			Return(nil, assert.AnError)

		// Test unstaking non-existent stake
		unstakingRequest := &staking_manager.UnstakingRequest{
			User:       "0x1234567890123456789012345678901234567890",
			StakeID:    "stake_nonexistent",
			PrivateKey: "0xabcdef1234567890",
			GasLimit:   big.NewInt(100000),
			GasPrice:   big.NewInt(20000000000), // 20 gwei
			Nonce:      big.NewInt(3),
		}

		result, err := stakingManager.Unstake(ctx, unstakingRequest)
		require.Error(t, err)
		assert.Nil(t, result)
		assert.Contains(t, err.Error(), "failed to get staking information")

		// Verify mock was called
		storage.AssertExpectations(t)
	})
}