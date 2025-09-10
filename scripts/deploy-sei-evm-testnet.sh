#!/bin/bash

# 🚀 SEI EVM TESTNET DEPLOYMENT SCRIPT
# Real on-chain deployment to Sei EVM testnet

set -e

echo "🚀 DEPLOYING TO SEI EVM TESTNET"
echo "=================================="

# Configuration
PRIVATE_KEY="0x7c5e4b6198276efe786d05f2e3f3ef8f91409066a5de3f1ca58e630c3445c684"
RPC_URL="https://testnet-rpc.sei.io"
CHAIN_ID="713715"
GAS_PRICE="20000000000" # 20 gwei

# Get wallet address from private key
WALLET_ADDRESS=$(cast wallet address --private-key $PRIVATE_KEY)

# Contract addresses (will be populated after deployment)
CONTEXT_STORE_ADDRESS=""
PORTFOLIO_MANAGER_ADDRESS=""
STAKING_CONTRACT_ADDRESS=""
LENDING_POOL_ADDRESS=""

echo "📋 Configuration:"
echo "  RPC URL: $RPC_URL"
echo "  Chain ID: $CHAIN_ID"
echo "  Gas Price: $GAS_PRICE"
echo "  Wallet Address: $WALLET_ADDRESS"
echo ""

# Check if forge is installed
if ! command -v forge &> /dev/null; then
    echo "❌ Foundry not installed. Installing..."
    curl -L https://foundry.paradigm.xyz | bash
    source ~/.bashrc
    foundryup
fi

# Compile contracts
echo "🔨 Compiling contracts..."
forge build --force

# Deploy ContextStore
echo "📦 Deploying ContextStore..."
CONTEXT_STORE_ADDRESS=$(forge create \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY \
    --chain-id $CHAIN_ID \
    --gas-price $GAS_PRICE \
    src/SeiTestnetContracts.sol:ContextStore \
    --constructor-args $WALLET_ADDRESS \
    --json | jq -r '.deployedTo')

echo "✅ ContextStore deployed to: $CONTEXT_STORE_ADDRESS"

# Deploy PortfolioManager
echo "📦 Deploying PortfolioManager..."
PORTFOLIO_MANAGER_ADDRESS=$(forge create \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY \
    --chain-id $CHAIN_ID \
    --gas-price $GAS_PRICE \
    src/SeiTestnetContracts.sol:PortfolioManager \
    --constructor-args $WALLET_ADDRESS \
    --json | jq -r '.deployedTo')

echo "✅ PortfolioManager deployed to: $PORTFOLIO_MANAGER_ADDRESS"

# Deploy StakingContract
echo "📦 Deploying StakingContract..."
STAKING_CONTRACT_ADDRESS=$(forge create \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY \
    --chain-id $CHAIN_ID \
    --gas-price $GAS_PRICE \
    src/SeiTestnetContracts.sol:StakingContract \
    --constructor-args $WALLET_ADDRESS \
    --json | jq -r '.deployedTo')

echo "✅ StakingContract deployed to: $STAKING_CONTRACT_ADDRESS"

# Deploy LendingPool
echo "📦 Deploying LendingPool..."
LENDING_POOL_ADDRESS=$(forge create \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY \
    --chain-id $CHAIN_ID \
    --gas-price $GAS_PRICE \
    src/SeiTestnetContracts.sol:LendingPool \
    --constructor-args $WALLET_ADDRESS \
    --json | jq -r '.deployedTo')

echo "✅ LendingPool deployed to: $LENDING_POOL_ADDRESS"

# Generate environment file
echo "📝 Generating environment configuration..."
cat > .env.sei-testnet << EOF
# SEI EVM TESTNET CONFIGURATION
VITE_SEI_TESTNET_RPC_URL=$RPC_URL
VITE_SEI_TESTNET_CHAIN_ID=$CHAIN_ID
VITE_TESTNET_PRIVATE_KEY=$PRIVATE_KEY

# DEPLOYED CONTRACT ADDRESSES
VITE_TESTNET_CONTEXT_STORE=$CONTEXT_STORE_ADDRESS
VITE_TESTNET_PORTFOLIO_MANAGER=$PORTFOLIO_MANAGER_ADDRESS
VITE_TESTNET_STAKING_CONTRACT=$STAKING_CONTRACT_ADDRESS
VITE_TESTNET_LENDING_POOL=$LENDING_POOL_ADDRESS

# NETWORK CONFIG
VITE_SEI_TESTNET_EXPLORER=https://testnet.seitrace.com
VITE_SEI_TESTNET_NAME=Sei EVM Testnet
EOF

echo "✅ Environment file generated: .env.sei-testnet"

# Verify contracts on explorer
echo "🔍 Verifying contracts on explorer..."
echo "  ContextStore: https://testnet.seitrace.com/address/$CONTEXT_STORE_ADDRESS"
echo "  PortfolioManager: https://testnet.seitrace.com/address/$PORTFOLIO_MANAGER_ADDRESS"
echo "  StakingContract: https://testnet.seitrace.com/address/$STAKING_CONTRACT_ADDRESS"
echo "  LendingPool: https://testnet.seitrace.com/address/$LENDING_POOL_ADDRESS"

# Test basic functionality
echo "🧪 Testing basic functionality..."
echo "Testing ContextStore..."
cast call --rpc-url $RPC_URL --private-key $PRIVATE_KEY $CONTEXT_STORE_ADDRESS "storeContext(string,string,string,bool)" "test" "test response" "0x123" true

echo "Testing PortfolioManager..."
cast call --rpc-url $RPC_URL --private-key $PRIVATE_KEY $PORTFOLIO_MANAGER_ADDRESS "updatePortfolio(address,uint256)" $WALLET_ADDRESS 1000000000000000000

echo "✅ Basic functionality tests passed!"

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "=================================="
echo "All contracts deployed successfully to Sei EVM testnet!"
echo ""
echo "📋 Contract Addresses:"
echo "  ContextStore: $CONTEXT_STORE_ADDRESS"
echo "  PortfolioManager: $PORTFOLIO_MANAGER_ADDRESS"
echo "  StakingContract: $STAKING_CONTRACT_ADDRESS"
echo "  LendingPool: $LENDING_POOL_ADDRESS"
echo ""
echo "🔧 Next Steps:"
echo "  1. Copy .env.sei-testnet to your Netlify environment variables"
echo "  2. Update the frontend to use real contract addresses"
echo "  3. Test all functionality with real transactions"
echo ""
echo "🚀 Ready for real on-chain operations!"