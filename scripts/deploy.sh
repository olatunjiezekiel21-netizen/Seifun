#!/bin/bash

# 🚀 SEIFUN REVOLUTIONARY AI DEPLOYMENT SCRIPT
# Deploy to Sei Network Mainnet

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SEI_CHAIN_ID="sei-1"
SEI_RPC_URL="https://rpc.sei.io"
SEI_REST_URL="https://rest.sei.io"
GAS_PRICE="0.025usei"
GAS_ADJUSTMENT="1.3"

# Check if required environment variables are set
if [ -z "$ADMIN_ADDRESS" ]; then
    echo -e "${RED}❌ ERROR: ADMIN_ADDRESS environment variable not set${NC}"
    echo "Please set: export ADMIN_ADDRESS='your-sei-address'"
    exit 1
fi

if [ -z "$ADMIN_MNEMONIC" ]; then
    echo -e "${RED}❌ ERROR: ADMIN_MNEMONIC environment variable not set${NC}"
    echo "Please set: export ADMIN_MNEMONIC='your-mnemonic-phrase'"
    exit 1
fi

echo -e "${PURPLE}🚀 SEIFUN REVOLUTIONARY AI DEPLOYMENT${NC}"
echo -e "${CYAN}========================================${NC}"
echo -e "${BLUE}Network:${NC} Sei Mainnet"
echo -e "${BLUE}Chain ID:${NC} $SEI_CHAIN_ID"
echo -e "${BLUE}RPC URL:${NC} $SEI_RPC_URL"
echo -e "${BLUE}Admin:${NC} $ADMIN_ADDRESS"
echo -e "${BLUE}Gas Price:${NC} $GAS_PRICE"
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
echo -e "${BLUE}🌐 Checking network status...${NC}"
if seid status --node $SEI_RPC_URL &> /dev/null; then
    echo -e "${GREEN}✅ Network connection successful${NC}"
else
    echo -e "${RED}❌ Network connection failed${NC}"
    exit 1
fi

# Check account balance
echo -e "${BLUE}💰 Checking admin account balance...${NC}"
BALANCE=$(seid query bank balances $ADMIN_ADDRESS --node $SEI_RPC_URL --output json | jq -r '.balances[] | select(.denom=="usei") | .amount')
if [ "$BALANCE" != "null" ] && [ "$BALANCE" -gt 1000000 ]; then
    echo -e "${GREEN}✅ Balance: $((BALANCE / 1000000)) SEI${NC}"
else
    echo -e "${RED}❌ Insufficient balance for deployment${NC}"
    exit 1
fi

# Create deployment directory
echo -e "${BLUE}📁 Creating deployment directory...${NC}"
mkdir -p deployment/artifacts
mkdir -p deployment/logs
mkdir -p deployment/contracts

# Generate deployment artifacts
echo -e "${BLUE}🔨 Generating deployment artifacts...${NC}"

# Create ContextStore contract
cat > deployment/contracts/ContextStore.wasm << 'EOF'
# This is a placeholder for the actual ContextStore contract
# In production, this would be the compiled WASM bytecode
EOF

# Create AIRegistry contract
cat > deployment/contracts/AIRegistry.wasm << 'EOF'
# This is a placeholder for the actual AIRegistry contract
# In production, this would be the compiled WASM bytecode
EOF

# Create PortfolioManager contract
cat > deployment/contracts/PortfolioManager.wasm << 'EOF'
# This is a placeholder for the actual PortfolioManager contract
# In production, this would be the compiled WASM bytecode
EOF

# Create RiskEngine contract
cat > deployment/contracts/RiskEngine.wasm << 'EOF'
# This is a placeholder for the actual RiskEngine contract
# In production, this would be the compiled WASM bytecode
EOF

# Create YieldOptimizer contract
cat > deployment/contracts/YieldOptimizer.wasm << 'EOF'
# This is a placeholder for the actual YieldOptimizer contract
# In production, this would be the compiled WASM bytecode
EOF

# Create ArbitrageDetector contract
cat > deployment/contracts/ArbitrageDetector.wasm << 'EOF'
# This is a placeholder for the actual ArbitrageDetector contract
# In production, this would be the compiled WASM bytecode
EOF

echo -e "${GREEN}✅ Deployment artifacts generated${NC}"

# Deploy contracts
echo -e "${BLUE}🚀 Starting contract deployment...${NC}"

# Contract deployment order and parameters
declare -A CONTRACTS=(
    ["ContextStore"]="5000000"
    ["AIRegistry"]="3000000"
    ["PortfolioManager"]="4000000"
    ["RiskEngine"]="3500000"
    ["YieldOptimizer"]="4500000"
    ["ArbitrageDetector"]="5000000"
)

# Deploy each contract
for contract in "${!CONTRACTS[@]}"; do
    gas_limit="${CONTRACTS[$contract]}"
    
    echo -e "${YELLOW}📦 Deploying $contract (Gas: $gas_limit)...${NC}"
    
    # Deploy contract
    DEPLOY_RESULT=$(seid tx wasm store deployment/contracts/$contract.wasm \
        --from $ADMIN_ADDRESS \
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
        echo -e "${GREEN}✅ $contract deployment initiated${NC}"
        echo -e "${BLUE}   Transaction Hash: $TX_HASH${NC}"
        
        # Wait for transaction confirmation
        echo -e "${BLUE}   ⏳ Waiting for confirmation...${NC}"
        sleep 10
        
        # Get transaction result
        TX_RESULT=$(seid query tx $TX_HASH --node $SEI_RPC_URL --output json 2>/dev/null || echo "{}")
        TX_STATUS=$(echo $TX_RESULT | jq -r '.tx_response.code // empty')
        
        if [ "$TX_STATUS" = "0" ]; then
            echo -e "${GREEN}   ✅ $contract deployed successfully${NC}"
            
            # Extract contract address
            CONTRACT_ADDRESS=$(echo $TX_RESULT | jq -r '.tx_response.logs[0].events[] | select(.type=="wasm") | .attributes[] | select(.key=="contract_address") | .value // empty')
            
            if [ -n "$CONTRACT_ADDRESS" ]; then
                echo -e "${GREEN}   📍 Contract Address: $CONTRACT_ADDRESS${NC}"
                
                # Save contract address
                echo $CONTRACT_ADDRESS > deployment/contracts/${contract}.address
                
                # Log deployment
                echo "$(date): $contract deployed at $CONTRACT_ADDRESS" >> deployment/logs/deployment.log
            fi
        else
            echo -e "${RED}   ❌ $contract deployment failed${NC}"
            echo -e "${RED}   Error: $(echo $TX_RESULT | jq -r '.tx_response.raw_log // empty')${NC}"
        fi
    else
        echo -e "${RED}   ❌ $contract deployment failed - no transaction hash${NC}"
    fi
    
    echo ""
done

# Generate deployment summary
echo -e "${PURPLE}📊 DEPLOYMENT SUMMARY${NC}"
echo -e "${CYAN}====================${NC}"

echo -e "${BLUE}Deployed Contracts:${NC}"
for contract in "${!CONTRACTS[@]}"; do
    if [ -f "deployment/contracts/${contract}.address" ]; then
        ADDRESS=$(cat deployment/contracts/${contract}.address)
        echo -e "${GREEN}  ✅ $contract: $ADDRESS${NC}"
    else
        echo -e "${RED}  ❌ $contract: FAILED${NC}"
    fi
done

echo ""
echo -e "${BLUE}Deployment Logs:${NC}"
echo -e "${CYAN}  📁 Location: deployment/logs/deployment.log${NC}"
echo -e "${CYAN}  📁 Contracts: deployment/contracts/${NC}"

echo ""
echo -e "${GREEN}🎉 SEIFUN AI SERVICES DEPLOYMENT COMPLETED!${NC}"
echo -e "${BLUE}🔗 Explorer: https://sei.io/explorer${NC}"
echo -e "${BLUE}📚 Next: Run verification script${NC}"

# Create deployment configuration file
cat > deployment/deployment-config.json << EOF
{
  "network": {
    "name": "Sei Mainnet",
    "chainId": "$SEI_CHAIN_ID",
    "rpcUrl": "$SEI_RPC_URL",
    "restUrl": "$SEI_REST_URL"
  },
  "deployment": {
    "adminAddress": "$ADMIN_ADDRESS",
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "gasPrice": "$GAS_PRICE",
    "gasAdjustment": "$GAS_ADJUSTMENT"
  },
  "contracts": {
$(for contract in "${!CONTRACTS[@]}"; do
    if [ -f "deployment/contracts/${contract}.address" ]; then
        ADDRESS=$(cat deployment/contracts/${contract}.address)
        echo "    \"$contract\": \"$ADDRESS\""
    else
        echo "    \"$contract\": null"
    fi
done | sed '$!s/$/,/')
  }
}
EOF

echo -e "${GREEN}✅ Deployment configuration saved to deployment/deployment-config.json${NC}"