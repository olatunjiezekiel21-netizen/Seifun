#!/bin/bash

echo "🚀 Seifu Token Launchpad - Netlify CLI Deployment"
echo "================================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js version 18+ required. Current version: $(node --version)"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Install Netlify CLI if not installed
if ! command -v netlify &> /dev/null; then
    echo "📦 Installing Netlify CLI..."
    npm install -g netlify-cli
fi

echo "✅ Netlify CLI version: $(netlify --version)"

# Build the project
echo "🏗️  Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi

echo "✅ Build successful!"

# Check if dist folder exists
if [ ! -d "dist" ]; then
    echo "❌ Error: dist folder not found after build."
    exit 1
fi

echo "📁 Build files ready in dist folder"

# Login to Netlify (this will open browser)
echo "🔐 Logging into Netlify..."
echo "⚠️  This will open your browser for authentication."
read -p "Press Enter to continue..."

netlify login

if [ $? -ne 0 ]; then
    echo "❌ Netlify login failed. Please try again."
    exit 1
fi

echo "✅ Netlify authentication successful!"

# Deploy to production
echo "🚀 Deploying to production..."
netlify deploy --prod --dir=dist --message="🚀 Seifu Token Launchpad Production Launch"

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 DEPLOYMENT SUCCESSFUL!"
    echo "========================"
    echo ""
    echo "Your Seifu Token Launchpad is now live!"
    echo ""
    echo "🧪 Test your site with:"
    echo "• Token Scanner: 0x50C0b92b3BC34D7FeD7Da0C48a2F16a636D95C9F"
    echo "• Wallet Test: 0x966CBf1baa5C08e4458f08A4CF1ECbb6Ae50894e"
    echo "• Mobile: Test responsive design"
    echo "• Revenue: Create a token and earn 2 SEI!"
    echo ""
    echo "💰 Revenue goes to: 0x966CBf1baa5C08e4458f08A4CF1ECbb6Ae50894e"
    echo ""
    echo "🎊 Congratulations! Your professional token launchpad is live!"
else
    echo "❌ Deployment failed. Please check the errors above."
    exit 1
fi