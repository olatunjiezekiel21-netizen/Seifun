#!/bin/bash

echo "🚀 DEPLOYING SEIFUGUARD TO NETLIFY"
echo "=================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
fi

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist

# Build the project
echo "🔨 Building project for production..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

# Check if dist directory was created
if [ ! -d "dist" ]; then
    echo "❌ Build directory 'dist' not found"
    exit 1
fi

echo "✅ Build completed successfully!"
echo ""
echo "📁 Build artifacts:"
ls -la dist/
echo ""

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "⚠️  Netlify CLI not found. Installing..."
    npm install -g netlify-cli
fi

echo "🌐 Ready for Netlify deployment!"
echo ""
echo "Choose your deployment method:"
echo "1. Manual deployment (drag & drop dist folder to Netlify)"
echo "2. Netlify CLI deployment (requires login)"
echo "3. Git deployment (push to connected repository)"
echo ""

read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo "📋 Manual Deployment Instructions:"
        echo "1. Go to https://app.netlify.com/"
        echo "2. Drag and drop the 'dist' folder to deploy"
        echo "3. Your app will be available at the provided URL"
        ;;
    2)
        echo "🔐 Netlify CLI Deployment:"
        netlify login
        netlify deploy --prod --dir=dist
        ;;
    3)
        echo "📡 Git Deployment Instructions:"
        echo "1. Commit your changes: git add . && git commit -m 'Deploy to Netlify'"
        echo "2. Push to your repository: git push origin main"
        echo "3. Connect your repository to Netlify"
        echo "4. Netlify will auto-deploy using netlify.toml configuration"
        ;;
    *)
        echo "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment process completed!"
echo "Your SeifuGuard Universal Token Scanner is ready to go live!"