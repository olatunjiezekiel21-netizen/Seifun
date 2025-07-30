#!/bin/bash

echo "🚀 Complete SEI Token Factory Deployment"
echo "========================================"

# Check if .env exists and has private key
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    exit 1
fi

# Check if private key is set
if grep -q "your-private-key-here" .env; then
    echo "❌ Please update your private key in .env file!"
    echo "📝 Edit .env and replace 'your-private-key-here' with your actual private key"
    echo "🔑 Your private key should be 64 characters (without 0x prefix)"
    exit 1
fi

echo "✅ Environment file configured"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Compile contracts
echo "🔨 Compiling smart contracts..."
npm run compile

if [ $? -ne 0 ]; then
    echo "❌ Contract compilation failed!"
    exit 1
fi

echo "✅ Contracts compiled successfully"

# Deploy to SEI testnet
echo "🚀 Deploying SimpleTokenFactory to SEI testnet..."
npm run deploy:factory

if [ $? -ne 0 ]; then
    echo "❌ Contract deployment failed!"
    echo "💡 Make sure you have SEI testnet tokens in your wallet"
    exit 1
fi

echo "✅ Contract deployed successfully!"

# Build frontend
echo "🏗️  Building frontend..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi

echo "✅ Frontend built successfully"

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "======================="
echo ""
echo "📋 Next Steps:"
echo "1. Copy the factory contract address from the deployment output above"
echo "2. Update FACTORY_ADDRESS in src/components/LaunchpadForm.tsx"
echo "3. Rebuild and deploy to Netlify"
echo ""
echo "🌐 Your app will then have:"
echo "✅ Real token creation (2 SEI fee)"
echo "✅ Revenue going to your dev wallet"
echo "✅ Full blockchain integration"
echo "✅ Mobile responsive design"
echo ""