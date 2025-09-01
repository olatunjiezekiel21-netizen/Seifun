#!/bin/bash

# 🚀 REAL ON-CHAIN DEPLOYMENT SCRIPT
# Run this locally to deploy contracts and update environment

echo "🚀 SEIFUN REAL ON-CHAIN DEPLOYMENT"
echo "=================================="

# Check if Foundry is installed
if ! command -v forge &> /dev/null; then
    echo "❌ Foundry not found. Please install Foundry first:"
    echo "curl -L https://foundry.paradigm.xyz | bash"
    echo "source ~/.bashrc && foundryup"
    exit 1
fi

echo "✅ Foundry is installed"

# Build contracts
echo "🔨 Building contracts..."
forge build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Contracts built successfully"

# Deploy contracts (you'll need to run these manually)
echo ""
echo "📦 DEPLOYMENT COMMANDS:"
echo "=================================="
echo ""
echo "1. Deploy ContextStore:"
echo "forge create --rpc-url https://sei-testnet-rpc.publicnode.com \\"
echo "  --private-key 0x7c5e4b6198276efe786d05f2e3f3ef8f91409066a5de3f1ca58e630c3445c684 \\"
echo "  --chain-id 713715 \\"
echo "  --gas-price 20000000000 \\"
echo "  src/SeiTestnetContracts.sol:ContextStore \\"
echo "  --constructor-args 0x966CBf1baa5C08e4458f08A4CF1ECbb6Ae50894e"
echo ""
echo "2. Deploy PortfolioManager:"
echo "forge create --rpc-url https://sei-testnet-rpc.publicnode.com \\"
echo "  --private-key 0x7c5e4b6198276efe786d05f2e3f3ef8f91409066a5de3f1ca58e630c3445c684 \\"
echo "  --chain-id 713715 \\"
echo "  --gas-price 20000000000 \\"
echo "  src/SeiTestnetContracts.sol:PortfolioManager \\"
echo "  --constructor-args 0x966CBf1baa5C08e4458f08A4CF1ECbb6Ae50894e"
echo ""
echo "3. Deploy StakingContract:"
echo "forge create --rpc-url https://sei-testnet-rpc.publicnode.com \\"
echo "  --private-key 0x7c5e4b6198276efe786d05f2e3f3ef8f91409066a5de3f1ca58e630c3445c684 \\"
echo "  --chain-id 713715 \\"
echo "  --gas-price 20000000000 \\"
echo "  src/SeiTestnetContracts.sol:StakingContract \\"
echo "  --constructor-args 0x966CBf1baa5C08e4458f08A4CF1ECbb6Ae50894e"
echo ""
echo "4. Deploy LendingPool:"
echo "forge create --rpc-url https://sei-testnet-rpc.publicnode.com \\"
echo "  --private-key 0x7c5e4b6198276efe786d05f2e3f3ef8f91409066a5de3f1ca58e630c3445c684 \\"
echo "  --chain-id 713715 \\"
echo "  --gas-price 20000000000 \\"
echo "  src/SeiTestnetContracts.sol:LendingPool \\"
echo "  --constructor-args 0x966CBf1baa5C08e4458f08A4CF1ECbb6Ae50894e"
echo ""
echo "🔧 After deployment, update your Netlify environment variables:"
echo "=================================="
echo ""
echo "VITE_SEI_TESTNET_RPC_URL=https://sei-testnet-rpc.publicnode.com"
echo "VITE_SEI_TESTNET_CHAIN_ID=713715"
echo "VITE_TESTNET_PRIVATE_KEY=0x7c5e4b6198276efe786d05f2e3f3ef8f91409066a5de3f1ca58e630c3445c684"
echo ""
echo "# Replace with actual deployed addresses:"
echo "VITE_TESTNET_CONTEXT_STORE=0x..."
echo "VITE_TESTNET_PORTFOLIO_MANAGER=0x..."
echo "VITE_TESTNET_STAKING_CONTRACT=0x..."
echo "VITE_TESTNET_LENDING_POOL=0x..."
echo ""
echo "🚀 Then deploy the frontend:"
echo "npm run build && netlify deploy --prod --dir=dist"
echo ""
echo "🎉 Ready for real on-chain operations!"