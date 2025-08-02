#!/bin/bash

echo "🚀 Starting Seifun deployment process..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf node_modules/.cache
rm -rf dist

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the project
echo "🔨 Building project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Build output in dist/ directory"
    echo "🚀 Ready for Netlify deployment!"
    
    # List build files
    echo "📋 Build files:"
    ls -la dist/
else
    echo "❌ Build failed!"
    exit 1
fi

echo "🎉 Deployment script completed!"