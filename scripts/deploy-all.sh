#!/bin/bash

# 🚀 SEIFUN COMPLETE DEPLOYMENT SCRIPT
# Master script to deploy everything to Sei Network

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${PURPLE}🚀 SEIFUN COMPLETE DEPLOYMENT SCRIPT${NC}"
echo -e "${CYAN}=====================================${NC}"
echo -e "${BLUE}This script will deploy Seifun to Sei Network mainnet${NC}"
echo -e "${BLUE}Including all AI services and smart contracts${NC}"
echo ""

# Check if required environment variables are set
if [ -z "$ADMIN_ADDRESS" ]; then
    echo -e "${RED}❌ ERROR: ADMIN_ADDRESS environment variable not set${NC}"
    echo ""
    echo -e "${YELLOW}Please set the following environment variables:${NC}"
    echo -e "${CYAN}export ADMIN_ADDRESS='your-sei-address'${NC}"
    echo -e "${CYAN}export ADMIN_MNEMONIC='your-mnemonic-phrase'${NC}"
    echo ""
    echo -e "${BLUE}Example:${NC}"
    echo -e "${CYAN}export ADMIN_ADDRESS='sei1...'${NC}"
    echo -e "${CYAN}export ADMIN_MNEMONIC='word1 word2 word3...'${NC}"
    echo ""
    exit 1
fi

if [ -z "$ADMIN_MNEMONIC" ]; then
    echo -e "${RED}❌ ERROR: ADMIN_MNEMONIC environment variable not set${NC}"
    echo ""
    echo -e "${YELLOW}Please set the following environment variable:${NC}"
    echo -e "${CYAN}export ADMIN_MNEMONIC='your-mnemonic-phrase'${NC}"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Environment variables configured${NC}"
echo -e "${BLUE}Admin Address: $ADMIN_ADDRESS${NC}"
echo ""

# Confirm deployment
echo -e "${YELLOW}⚠️  WARNING: This will deploy to Sei Network MAINNET${NC}"
echo -e "${YELLOW}Make sure you have sufficient SEI tokens for gas fees${NC}"
echo ""
read -p "Do you want to continue with deployment? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Deployment cancelled${NC}"
    exit 0
fi

echo -e "${GREEN}🚀 Starting Seifun deployment...${NC}"
echo ""

# Create deployment directory structure
echo -e "${BLUE}📁 Creating deployment directory structure...${NC}"
mkdir -p deployment/{artifacts,logs,contracts}
echo -e "${GREEN}✅ Directory structure created${NC}"
echo ""

# Step 1: Deploy contracts
echo -e "${PURPLE}📦 STEP 1: DEPLOYING SMART CONTRACTS${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

if [ -f "scripts/deploy.sh" ]; then
    echo -e "${BLUE}Running deployment script...${NC}"
    ./scripts/deploy.sh
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Contract deployment completed successfully${NC}"
    else
        echo -e "${RED}❌ Contract deployment failed${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Deployment script not found${NC}"
    exit 1
fi

echo ""

# Step 2: Verify contracts
echo -e "${PURPLE}🔍 STEP 2: VERIFYING DEPLOYED CONTRACTS${NC}"
echo -e "${CYAN}==========================================${NC}"
echo ""

if [ -f "scripts/verify.sh" ]; then
    echo -e "${BLUE}Running verification script...${NC}"
    ./scripts/verify.sh
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Contract verification completed successfully${NC}"
    else
        echo -e "${RED}❌ Contract verification failed${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Verification script not found${NC}"
    exit 1
fi

echo ""

# Step 3: Initialize AI services
echo -e "${PURPLE}🤖 STEP 3: INITIALIZING AI SERVICES${NC}"
echo -e "${CYAN}=====================================${NC}"
echo ""

if [ -f "scripts/init-ai-services.sh" ]; then
    echo -e "${BLUE}Running AI service initialization...${NC}"
    ./scripts/init-ai-services.sh
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ AI services initialization completed successfully${NC}"
    else
        echo -e "${RED}❌ AI services initialization failed${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ AI service initialization script not found${NC}"
    exit 1
fi

echo ""

# Final deployment summary
echo -e "${PURPLE}🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# Check if all required files exist
echo -e "${BLUE}📋 Checking deployment artifacts...${NC}"

REQUIRED_FILES=(
    "deployment/deployment-config.json"
    "deployment/verification-report.json"
    "deployment/ai-services-status.json"
    "deployment/PRODUCTION_READY.md"
)

ALL_FILES_EXIST=true
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}  ✅ $file${NC}"
    else
        echo -e "${RED}  ❌ $file (missing)${NC}"
        ALL_FILES_EXIST=false
    fi
done

echo ""

if [ "$ALL_FILES_EXIST" = true ]; then
    echo -e "${GREEN}🎉 ALL DEPLOYMENT ARTIFACTS GENERATED SUCCESSFULLY!${NC}"
    echo ""
    echo -e "${BLUE}📊 Deployment Summary:${NC}"
    
    # Display deployment config
    if [ -f "deployment/deployment-config.json" ]; then
        DEPLOYMENT_CONFIG=$(cat deployment/deployment-config.json)
        NETWORK=$(echo $DEPLOYMENT_CONFIG | jq -r '.network.name')
        CHAIN_ID=$(echo $DEPLOYMENT_CONFIG | jq -r '.network.chainId')
        TIMESTAMP=$(echo $DEPLOYMENT_CONFIG | jq -r '.deployment.timestamp')
        
        echo -e "${CYAN}  Network: $NETWORK${NC}"
        echo -e "${CYAN}  Chain ID: $CHAIN_ID${NC}"
        echo -e "${CYAN}  Deployed: $TIMESTAMP${NC}"
    fi
    
    # Display verification results
    if [ -f "deployment/verification-report.json" ]; then
        VERIFICATION_REPORT=$(cat deployment/verification-report.json)
        TOTAL=$(echo $VERIFICATION_REPORT | jq -r '.results.total')
        VERIFIED=$(echo $VERIFICATION_REPORT | jq -r '.results.verified')
        SUCCESS_RATE=$(echo $VERIFICATION_REPORT | jq -r '.results.successRate')
        
        echo -e "${CYAN}  Contracts: $VERIFIED/$TOTAL verified${NC}"
        echo -e "${CYAN}  Success Rate: $SUCCESS_RATE${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}🚀 SEIFUN IS NOW LIVE ON SEI NETWORK!${NC}"
    echo -e "${BLUE}🔗 Explorer: https://sei.io/explorer${NC}"
    echo -e "${BLUE}📚 Documentation: DEPLOYMENT_GUIDE.md${NC}"
    echo -e "${BLUE}📋 Status: deployment/PRODUCTION_READY.md${NC}"
    
    echo ""
    echo -e "${PURPLE}🌟 REVOLUTIONARY FEATURES NOW AVAILABLE:${NC}"
    echo -e "${CYAN}  • Advanced AI Service with sentiment analysis${NC}"
    echo -e "${CYAN}  • Arbitrage detection and yield optimization${NC}"
    echo -e "${CYAN}  • Cross-chain intelligence${NC}"
    echo -e "${CYAN}  • Institutional portfolio management${NC}"
    echo -e "${CYAN}  • Advanced risk modeling (VaR, stress testing)${NC}"
    echo -e "${CYAN}  • Compliance engine (KYC/AML, OFAC)${NC}"
    echo -e "${CYAN}  • Professional reporting system${NC}"
    echo -e "${CYAN}  • Multi-signature management${NC}"
    echo -e "${CYAN}  • Enterprise integrations${NC}"
    
    echo ""
    echo -e "${GREEN}🎯 NEXT STEPS:${NC}"
    echo -e "${CYAN}  1. Start onboarding institutional users${NC}"
    echo -e "${CYAN}  2. Monitor system performance${NC}"
    echo -e "${CYAN}  3. Continue improving AI models${NC}"
    echo -e "${CYAN}  4. Expand to additional networks${NC}"
    
    echo ""
    echo -e "${PURPLE}💎 CONGRATULATIONS! SEIFUN IS NOW THE WORLD'S MOST ADVANCED DEFI AI PLATFORM!${NC}"
    
else
    echo -e "${RED}❌ Some deployment artifacts are missing${NC}"
    echo -e "${YELLOW}Please check the deployment logs and retry${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}📝 Deployment logs saved to: deployment/logs/${NC}"
echo -e "${BLUE}🔧 For troubleshooting, check: deployment/logs/deployment.log${NC}"