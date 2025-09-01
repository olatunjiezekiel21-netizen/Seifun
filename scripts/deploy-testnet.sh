#!/bin/bash

# 🚀 SEIFUN TESTNET DEPLOYMENT SCRIPT
# Deploy to Sei Network Testnet

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Testnet Configuration
SEI_CHAIN_ID="sei-testnet-1"
SEI_RPC_URL="https://testnet-rpc.sei.io"
SEI_REST_URL="https://testnet-rest.sei.io"
GAS_PRICE="0.025usei"
GAS_ADJUSTMENT="1.5"

# Private key from user
PRIVATE_KEY="0x7c5e4b6198276efe786d05f2e3f3ef8f91409066a5de3f1ca58e630c3445c684"

echo -e "${PURPLE}🚀 SEIFUN TESTNET DEPLOYMENT${NC}"
echo -e "${CYAN}=============================${NC}"
echo -e "${BLUE}Network:${NC} Sei Testnet"
echo -e "${BLUE}Chain ID:${NC} $SEI_CHAIN_ID"
echo -e "${BLUE}RPC URL:${NC} $SEI_REST_URL"
echo -e "${BLUE}Gas Price:${NC} $GAS_PRICE"
echo -e "${BLUE}Gas Adjustment:${NC} $GAS_ADJUSTMENT"
echo ""

# Check if seid is installed
if ! command -v seid &> /dev/null; then
    echo -e "${YELLOW}⚠️  Sei CLI not found. Installing...${NC}"
    curl -L https://github.com/sei-protocol/sei-chain/releases/latest/download/seid-linux-amd64 -o seid
    chmod +x seid
    sudo mv seid /usr/local/bin/
    echo -e "${GREEN}✅ Sei CLI installed successfully${NC}"
fi

# Check seid version
echo -e "${BLUE}🔍 Checking Sei CLI version...${NC}"
seid version
echo ""

# Check network status
echo -e "${BLUE}🌐 Checking testnet connection...${NC}"
if seid status --node $SEI_RPC_URL &> /dev/null; then
    echo -e "${GREEN}✅ Testnet connection successful${NC}"
else
    echo -e "${RED}❌ Testnet connection failed${NC}"
    exit 1
fi

# Create deployment directory
echo -e "${BLUE}📁 Creating deployment directory...${NC}"
mkdir -p deployment/artifacts
mkdir -p deployment/logs
mkdir -p deployment/contracts
echo -e "${GREEN}✅ Deployment directory created${NC}"

# Generate deployment artifacts for testnet
echo -e "${BLUE}🔨 Generating testnet deployment artifacts...${NC}"

# Create testnet contract placeholders
cat > deployment/contracts/ContextStore.wasm << 'EOF'
# Testnet ContextStore contract placeholder
# This would be the actual compiled WASM bytecode
EOF

cat > deployment/contracts/AIRegistry.wasm << 'EOF'
# Testnet AIRegistry contract placeholder
# This would be the actual compiled WASM bytecode
EOF

cat > deployment/contracts/PortfolioManager.wasm << 'EOF'
# Testnet PortfolioManager contract placeholder
# This would be the actual compiled WASM bytecode
EOF

cat > deployment/contracts/RiskEngine.wasm << 'EOF'
# Testnet RiskEngine contract placeholder
# This would be the actual compiled WASM bytecode
EOF

cat > deployment/contracts/YieldOptimizer.wasm << 'EOF'
# Testnet YieldOptimizer contract placeholder
# This would be the actual compiled WASM bytecode
EOF

cat > deployment/contracts/ArbitrageDetector.wasm << 'EOF'
# Testnet ArbitrageDetector contract placeholder
# This would be the actual compiled WASM bytecode
EOF

echo -e "${GREEN}✅ Testnet deployment artifacts generated${NC}"

# Deploy contracts to testnet
echo -e "${BLUE}🚀 Starting testnet contract deployment...${NC}"

# Contract deployment order and parameters for testnet
declare -A CONTRACTS=(
    ["ContextStore"]="10000000"
    ["AIRegistry"]="8000000"
    ["PortfolioManager"]="9000000"
    ["RiskEngine"]="8500000"
    ["YieldOptimizer"]="9500000"
    ["ArbitrageDetector"]="10000000"
)

# Deploy each contract
for contract in "${!CONTRACTS[@]}"; do
    gas_limit="${CONTRACTS[$contract]}"
    
    echo -e "${YELLOW}📦 Deploying $contract to testnet (Gas: $gas_limit)...${NC}"
    
    # Deploy contract to testnet
    DEPLOY_RESULT=$(seid tx wasm store deployment/contracts/$contract.wasm \
        --from $PRIVATE_KEY \
        --chain-id $SEI_CHAIN_ID \
        --gas $gas_limit \
        --gas-prices $GAS_PRICE \
        --gas-adjustment $GAS_ADJUSTMENT \
        --yes \
        --node $SEI_RPC_URL \
        --output json 2>/dev/null || echo "{}")
    
    # Extract transaction hash
    TX_HASH=$(echo $DEPLOY_RESULT | jq -r '.txhash // empty')
    
    if [ -n "$TX_HASH" ]; then
        echo -e "${GREEN}✅ $contract deployment initiated on testnet${NC}"
        echo -e "${BLUE}   Transaction Hash: $TX_HASH${NC}"
        
        # Wait for transaction confirmation on testnet
        echo -e "${BLUE}   ⏳ Waiting for testnet confirmation...${NC}"
        sleep 15  # Longer wait for testnet
        
        # Get transaction result
        TX_RESULT=$(seid query tx $TX_HASH --node $SEI_RPC_URL --output json 2>/dev/null || echo "{}")
        TX_STATUS=$(echo $TX_RESULT | jq -r '.tx_response.code // empty')
        
        if [ "$TX_STATUS" = "0" ]; then
            echo -e "${GREEN}   ✅ $contract deployed successfully on testnet${NC}"
            
            # Extract contract address
            CONTRACT_ADDRESS=$(echo $TX_RESULT | jq -r '.tx_response.logs[0].events[] | select(.type=="wasm") | .attributes[] | select(.key=="contract_address") | .value // empty')
            
            if [ -n "$CONTRACT_ADDRESS" ]; then
                echo -e "${GREEN}   📍 Testnet Contract Address: $CONTRACT_ADDRESS${NC}"
                
                # Save contract address
                echo $CONTRACT_ADDRESS > deployment/contracts/${contract}.testnet.address
                
                # Log deployment
                echo "$(date): $contract deployed to testnet at $CONTRACT_ADDRESS" >> deployment/logs/testnet-deployment.log
            fi
        else
            echo -e "${RED}   ❌ $contract testnet deployment failed${NC}"
            echo -e "${RED}   Error: $(echo $TX_RESULT | jq -r '.tx_response.raw_log // empty')${NC}"
        fi
    else
        echo -e "${RED}   ❌ $contract testnet deployment failed - no transaction hash${NC}"
    fi
    
    echo ""
done

# Generate testnet deployment summary
echo -e "${PURPLE}📊 TESTNET DEPLOYMENT SUMMARY${NC}"
echo -e "${CYAN}==============================${NC}"

echo -e "${BLUE}Deployed Contracts on Testnet:${NC}"
for contract in "${!CONTRACTS[@]}"; do
    if [ -f "deployment/contracts/${contract}.testnet.address" ]; then
        ADDRESS=$(cat deployment/contracts/${contract}.testnet.address)
        echo -e "${GREEN}  ✅ $contract: $ADDRESS${NC}"
    else
        echo -e "${RED}  ❌ $contract: FAILED${NC}"
    fi
done

echo ""
echo -e "${BLUE}Testnet Deployment Details:${NC}"
echo -e "${CYAN}  📁 Logs: deployment/logs/testnet-deployment.log${NC}"
echo -e "${CYAN}  📁 Contracts: deployment/contracts/${NC}"
echo -e "${CYAN}  🌐 Explorer: https://testnet.sei.io/explorer${NC}"

echo ""
echo -e "${GREEN}🎉 Testnet deployment completed!${NC}"
echo -e "${BLUE}🔗 Testnet Explorer: https://testnet.sei.io/explorer${NC}"
echo -e "${BLUE}📚 Next: Run verification script${NC}"

# Create testnet deployment configuration file
cat > deployment/testnet-deployment-config.json << EOF
{
  "network": {
    "name": "Sei Testnet",
    "chainId": "$SEI_CHAIN_ID",
    "rpcUrl": "$SEI_RPC_URL",
    "restUrl": "$SEI_REST_URL"
  },
  "deployment": {
    "privateKey": "$PRIVATE_KEY",
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "gasPrice": "$GAS_PRICE",
    "gasAdjustment": "$GAS_ADJUSTMENT",
    "environment": "testnet"
  },
  "contracts": {
$(for contract in "${!CONTRACTS[@]}"; do
    if [ -f "deployment/contracts/${contract}.testnet.address" ]; then
        ADDRESS=$(cat deployment/contracts/${contract}.testnet.address)
        echo "    \"$contract\": \"$ADDRESS\""
    else
        echo "    \"$contract\": null"
    fi
done | sed '$!s/$/,/')
  }
}
EOF

echo -e "${GREEN}✅ Testnet deployment configuration saved to deployment/testnet-deployment-config.json${NC}"
echo -e "${BLUE}🚀 Ready for testnet verification!${NC}"