#!/bin/bash

# 🔍 SEIFUN TESTNET VERIFICATION SCRIPT
# Verify deployed contracts on Sei Network Testnet

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

echo -e "${PURPLE}🔍 SEIFUN TESTNET VERIFICATION${NC}"
echo -e "${CYAN}================================${NC}"
echo -e "${BLUE}Network:${NC} Sei Testnet"
echo -e "${BLUE}Chain ID:${NC} $SEI_CHAIN_ID"
echo -e "${BLUE}RPC URL:${NC} $SEI_RPC_URL"
echo ""

# Check if testnet deployment config exists
if [ ! -f "deployment/testnet-deployment-config.json" ]; then
    echo -e "${RED}❌ ERROR: Testnet deployment configuration not found${NC}"
    echo "Please run testnet deployment script first: ./scripts/deploy-testnet.sh"
    exit 1
fi

# Load testnet deployment configuration
echo -e "${BLUE}📋 Loading testnet deployment configuration...${NC}"
TESTNET_CONFIG=$(cat deployment/testnet-deployment-config.json)
PRIVATE_KEY=$(echo $TESTNET_CONFIG | jq -r '.deployment.privateKey')
DEPLOYMENT_TIME=$(echo $TESTNET_CONFIG | jq -r '.deployment.timestamp')

echo -e "${GREEN}✅ Private Key: ${PRIVATE_KEY:0:20}...${NC}"
echo -e "${GREEN}✅ Deployment Time: $DEPLOYMENT_TIME${NC}"
echo ""

# Check if seid is installed
if ! command -v seid &> /dev/null; then
    echo -e "${RED}❌ ERROR: Sei CLI not found${NC}"
    echo "Please install Sei CLI first"
    exit 1
fi

# Check network status
echo -e "${BLUE}🌐 Checking testnet connection...${NC}"
if seid status --node $SEI_RPC_URL &> /dev/null; then
    echo -e "${GREEN}✅ Testnet connection successful${NC}"
else
    echo -e "${RED}❌ Testnet connection failed${NC}"
    exit 1
fi

# Verify each contract on testnet
echo -e "${BLUE}🔍 Starting testnet contract verification...${NC}"
echo ""

# Contract verification order
CONTRACTS=("ContextStore" "AIRegistry" "PortfolioManager" "RiskEngine" "YieldOptimizer" "ArbitrageDetector")

# Track verification results
VERIFIED_COUNT=0
FAILED_COUNT=0
VERIFIED_CONTRACTS=()
FAILED_CONTRACTS=()

for contract in "${CONTRACTS[@]}"; do
    echo -e "${YELLOW}🔍 Verifying $contract on testnet...${NC}"
    
    # Get contract address from testnet deployment config
    CONTRACT_ADDRESS=$(echo $TESTNET_CONFIG | jq -r ".contracts.$contract")
    
    if [ "$CONTRACT_ADDRESS" = "null" ] || [ -z "$CONTRACT_ADDRESS" ]; then
        echo -e "${RED}  ❌ Contract address not found${NC}"
        FAILED_CONTRACTS+=("$contract")
        ((FAILED_COUNT++))
        continue
    fi
    
    echo -e "${BLUE}  📍 Testnet Address: $CONTRACT_ADDRESS${NC}"
    
    # Query contract info on testnet
    CONTRACT_INFO=$(seid query wasm contract $CONTRACT_ADDRESS --node $SEI_RPC_URL --output json 2>/dev/null || echo "{}")
    
    if [ "$(echo $CONTRACT_INFO | jq -r '.contract_info // empty')" != "" ]; then
        echo -e "${GREEN}  ✅ Contract exists on testnet${NC}"
        
        # Get contract code info
        CODE_ID=$(echo $CONTRACT_INFO | jq -r '.contract_info.code_id // empty')
        CREATOR=$(echo $CONTRACT_INFO | jq -r '.contract_info.creator // empty')
        
        echo -e "${BLUE}    Code ID: $CODE_ID${NC}"
        echo -e "${BLUE}    Creator: $CREATOR${NC}"
        
        # Query contract state on testnet
        CONTRACT_STATE=$(seid query wasm contract-state all $CONTRACT_ADDRESS --node $SEI_RPC_URL --output json 2>/dev/null || echo "{}")
        
        if [ "$(echo $CONTRACT_STATE | jq -r '.models // empty')" != "" ]; then
            echo -e "${GREEN}    ✅ Contract state accessible on testnet${NC}"
            
            # Count state entries
            STATE_COUNT=$(echo $CONTRACT_STATE | jq -r '.models | length')
            echo -e "${BLUE}    State Entries: $STATE_COUNT${NC}"
        else
            echo -e "${YELLOW}    ⚠️  Contract state not accessible on testnet${NC}"
        fi
        
        VERIFIED_CONTRACTS+=("$contract")
        ((VERIFIED_COUNT++))
        
    else
        echo -e "${RED}  ❌ Contract not found on testnet${NC}"
        FAILED_CONTRACTS+=("$contract")
        ((FAILED_COUNT++))
    fi
    
    echo ""
done

# Generate testnet verification summary
echo -e "${PURPLE}📊 TESTNET VERIFICATION SUMMARY${NC}"
echo -e "${CYAN}==================================${NC}"

echo -e "${BLUE}Verification Results:${NC}"
echo -e "${GREEN}  ✅ Verified: $VERIFIED_COUNT contracts${NC}"
echo -e "${RED}  ❌ Failed: $FAILED_COUNT contracts${NC}"

echo ""
echo -e "${BLUE}Successfully Verified on Testnet:${NC}"
for contract in "${VERIFIED_CONTRACTS[@]}"; do
    ADDRESS=$(echo $TESTNET_CONFIG | jq -r ".contracts.$contract")
    echo -e "${GREEN}  ✅ $contract: $ADDRESS${NC}"
done

if [ ${#FAILED_CONTRACTS[@]} -gt 0 ]; then
    echo ""
    echo -e "${BLUE}Failed Verification on Testnet:${NC}"
    for contract in "${FAILED_CONTRACTS[@]}"; do
        echo -e "${RED}  ❌ $contract: VERIFICATION FAILED${NC}"
    done
fi

echo ""
echo -e "${BLUE}Testnet Verification Details:${NC}"
echo -e "${CYAN}  📁 Logs: deployment/logs/testnet-verification.log${NC}"
echo -e "${CYAN}  📁 Config: deployment/testnet-deployment-config.json${NC}"
echo -e "${CYAN}  🌐 Explorer: https://testnet.sei.io/explorer${NC}"

# Log verification results
echo "$(date): Testnet verification completed - $VERIFIED_COUNT verified, $FAILED_COUNT failed" >> deployment/logs/testnet-verification.log

# Create testnet verification report
cat > deployment/testnet-verification-report.json << EOF
{
  "verification": {
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "network": "Sei Testnet",
    "chainId": "$SEI_CHAIN_ID",
    "privateKey": "${PRIVATE_KEY:0:20}..."
  },
  "results": {
    "total": ${#CONTRACTS[@]},
    "verified": $VERIFIED_COUNT,
    "failed": $FAILED_COUNT,
    "successRate": "$((VERIFIED_COUNT * 100 / ${#CONTRACTS[@]}))%"
  },
  "verifiedContracts": [
$(for contract in "${VERIFIED_CONTRACTS[@]}"; do
    ADDRESS=$(echo $TESTNET_CONFIG | jq -r ".contracts.$contract")
    echo "    { \"name\": \"$contract\", \"address\": \"$ADDRESS\" }"
done | sed '$!s/$/,/')
  ],
  "failedContracts": [
$(for contract in "${FAILED_CONTRACTS[@]}"; do
    echo "    { \"name\": \"$contract\", \"status\": \"verification_failed\" }"
done | sed '$!s/$/,/')
  ]
}
EOF

echo -e "${GREEN}✅ Testnet verification report saved to deployment/testnet-verification-report.json${NC}"

echo ""
if [ $FAILED_COUNT -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL CONTRACTS VERIFIED SUCCESSFULLY ON TESTNET!${NC}"
    echo -e "${BLUE}🚀 Seifun AI Services are ready for testnet testing!${NC}"
else
    echo -e "${YELLOW}⚠️  Some contracts failed verification on testnet${NC}"
    echo -e "${BLUE}🔧 Please check testnet deployment logs and retry${NC}"
fi

echo ""
echo -e "${BLUE}🔗 Testnet Explorer: https://testnet.sei.io/explorer${NC}"
echo -e "${BLUE}📚 Next: Initialize AI services on testnet${NC}"
echo -e "${BLUE}🚀 Ready for testnet AI service initialization!${NC}"