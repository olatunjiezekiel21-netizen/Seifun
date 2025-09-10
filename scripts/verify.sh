#!/bin/bash

# 🔍 SEIFUN CONTRACT VERIFICATION SCRIPT
# Verify deployed contracts on Sei Network

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

# Check if deployment config exists
if [ ! -f "deployment/deployment-config.json" ]; then
    echo -e "${RED}❌ ERROR: Deployment configuration not found${NC}"
    echo "Please run deployment script first: ./scripts/deploy.sh"
    exit 1
fi

echo -e "${PURPLE}🔍 SEIFUN CONTRACT VERIFICATION${NC}"
echo -e "${CYAN}===============================${NC}"
echo -e "${BLUE}Network:${NC} Sei Mainnet"
echo -e "${BLUE}Chain ID:${NC} $SEI_CHAIN_ID"
echo -e "${BLUE}RPC URL:${NC} $SEI_RPC_URL"
echo ""

# Load deployment configuration
echo -e "${BLUE}📋 Loading deployment configuration...${NC}"
DEPLOYMENT_CONFIG=$(cat deployment/deployment-config.json)
ADMIN_ADDRESS=$(echo $DEPLOYMENT_CONFIG | jq -r '.deployment.adminAddress')
DEPLOYMENT_TIME=$(echo $DEPLOYMENT_CONFIG | jq -r '.deployment.timestamp')

echo -e "${GREEN}✅ Admin Address: $ADMIN_ADDRESS${NC}"
echo -e "${GREEN}✅ Deployment Time: $DEPLOYMENT_TIME${NC}"
echo ""

# Check if seid is installed
if ! command -v seid &> /dev/null; then
    echo -e "${RED}❌ ERROR: Sei CLI not found${NC}"
    echo "Please install Sei CLI first"
    exit 1
fi

# Check network status
echo -e "${BLUE}🌐 Checking network status...${NC}"
if seid status --node $SEI_RPC_URL &> /dev/null; then
    echo -e "${GREEN}✅ Network connection successful${NC}"
else
    echo -e "${RED}❌ Network connection failed${NC}"
    exit 1
fi

# Verify each contract
echo -e "${BLUE}🔍 Starting contract verification...${NC}"
echo ""

# Contract verification order
CONTRACTS=("ContextStore" "AIRegistry" "PortfolioManager" "RiskEngine" "YieldOptimizer" "ArbitrageDetector")

# Track verification results
VERIFIED_COUNT=0
FAILED_COUNT=0
VERIFIED_CONTRACTS=()
FAILED_CONTRACTS=()

for contract in "${CONTRACTS[@]}"; do
    echo -e "${YELLOW}🔍 Verifying $contract...${NC}"
    
    # Get contract address from deployment config
    CONTRACT_ADDRESS=$(echo $DEPLOYMENT_CONFIG | jq -r ".contracts.$contract")
    
    if [ "$CONTRACT_ADDRESS" = "null" ] || [ -z "$CONTRACT_ADDRESS" ]; then
        echo -e "${RED}  ❌ Contract address not found${NC}"
        FAILED_CONTRACTS+=("$contract")
        ((FAILED_COUNT++))
        continue
    fi
    
    echo -e "${BLUE}  📍 Address: $CONTRACT_ADDRESS${NC}"
    
    # Query contract info
    CONTRACT_INFO=$(seid query wasm contract $CONTRACT_ADDRESS --node $SEI_RPC_URL --output json 2>/dev/null || echo "{}")
    
    if [ "$(echo $CONTRACT_INFO | jq -r '.contract_info // empty')" != "" ]; then
        echo -e "${GREEN}  ✅ Contract exists on chain${NC}"
        
        # Get contract code info
        CODE_ID=$(echo $CONTRACT_INFO | jq -r '.contract_info.code_id // empty')
        CREATOR=$(echo $CONTRACT_INFO | jq -r '.contract_info.creator // empty')
        
        echo -e "${BLUE}    Code ID: $CODE_ID${NC}"
        echo -e "${BLUE}    Creator: $CREATOR${NC}"
        
        # Verify creator matches admin
        if [ "$CREATOR" = "$ADMIN_ADDRESS" ]; then
            echo -e "${GREEN}    ✅ Creator verified${NC}"
        else
            echo -e "${YELLOW}    ⚠️  Creator mismatch${NC}"
        fi
        
        # Query contract state
        CONTRACT_STATE=$(seid query wasm contract-state all $CONTRACT_ADDRESS --node $SEI_RPC_URL --output json 2>/dev/null || echo "{}")
        
        if [ "$(echo $CONTRACT_STATE | jq -r '.models // empty')" != "" ]; then
            echo -e "${GREEN}    ✅ Contract state accessible${NC}"
            
            # Count state entries
            STATE_COUNT=$(echo $CONTRACT_STATE | jq -r '.models | length')
            echo -e "${BLUE}    State Entries: $STATE_COUNT${NC}"
        else
            echo -e "${YELLOW}    ⚠️  Contract state not accessible${NC}"
        fi
        
        VERIFIED_CONTRACTS+=("$contract")
        ((VERIFIED_COUNT++))
        
    else
        echo -e "${RED}  ❌ Contract not found on chain${NC}"
        FAILED_CONTRACTS+=("$contract")
        ((FAILED_COUNT++))
    fi
    
    echo ""
done

# Generate verification summary
echo -e "${PURPLE}📊 VERIFICATION SUMMARY${NC}"
echo -e "${CYAN}======================${NC}"

echo -e "${BLUE}Verification Results:${NC}"
echo -e "${GREEN}  ✅ Verified: $VERIFIED_COUNT contracts${NC}"
echo -e "${RED}  ❌ Failed: $FAILED_COUNT contracts${NC}"

echo ""
echo -e "${BLUE}Successfully Verified:${NC}"
for contract in "${VERIFIED_CONTRACTS[@]}"; do
    ADDRESS=$(echo $DEPLOYMENT_CONFIG | jq -r ".contracts.$contract")
    echo -e "${GREEN}  ✅ $contract: $ADDRESS${NC}"
done

if [ ${#FAILED_CONTRACTS[@]} -gt 0 ]; then
    echo ""
    echo -e "${BLUE}Failed Verification:${NC}"
    for contract in "${FAILED_CONTRACTS[@]}"; do
        echo -e "${RED}  ❌ $contract: VERIFICATION FAILED${NC}"
    done
fi

echo ""
echo -e "${BLUE}Verification Details:${NC}"
echo -e "${CYAN}  📁 Logs: deployment/logs/verification.log${NC}"
echo -e "${CYAN}  📁 Config: deployment/deployment-config.json${NC}"

# Log verification results
echo "$(date): Verification completed - $VERIFIED_COUNT verified, $FAILED_COUNT failed" >> deployment/logs/verification.log

# Create verification report
cat > deployment/verification-report.json << EOF
{
  "verification": {
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "network": "Sei Mainnet",
    "chainId": "$SEI_CHAIN_ID",
    "adminAddress": "$ADMIN_ADDRESS"
  },
  "results": {
    "total": ${#CONTRACTS[@]},
    "verified": $VERIFIED_COUNT,
    "failed": $FAILED_COUNT,
    "successRate": "$((VERIFIED_COUNT * 100 / ${#CONTRACTS[@]}))%"
  },
  "verifiedContracts": [
$(for contract in "${VERIFIED_CONTRACTS[@]}"; do
    ADDRESS=$(echo $DEPLOYMENT_CONFIG | jq -r ".contracts.$contract")
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

echo -e "${GREEN}✅ Verification report saved to deployment/verification-report.json${NC}"

echo ""
if [ $FAILED_COUNT -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL CONTRACTS VERIFIED SUCCESSFULLY!${NC}"
    echo -e "${BLUE}🚀 Seifun AI Services are ready for production!${NC}"
else
    echo -e "${YELLOW}⚠️  Some contracts failed verification${NC}"
    echo -e "${BLUE}🔧 Please check deployment logs and retry${NC}"
fi

echo ""
echo -e "${BLUE}🔗 Explorer: https://sei.io/explorer${NC}"
echo -e "${BLUE}📚 Next: Initialize AI services${NC}"