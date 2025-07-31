#!/bin/bash

echo "🚀 SEIFU - INSTANT DEPLOYMENT"
echo "============================="
echo ""

# Check if dist exists
if [ ! -d "dist" ]; then
    echo "❌ Build directory not found. Building now..."
    npm run build
fi

echo "✅ Build ready for deployment!"
echo ""
echo "📋 DEPLOYMENT OPTIONS:"
echo ""
echo "1. 🌐 NETLIFY DRAG & DROP (Easiest)"
echo "   • Go to: https://app.netlify.com/"
echo "   • Drag the 'dist' folder to deploy"
echo "   • Live in seconds!"
echo ""
echo "2. 🔧 NETLIFY CLI"
echo "   • Run: netlify login"
echo "   • Run: netlify deploy --prod --dir=dist"
echo ""
echo "3. 📁 MANUAL UPLOAD"
echo "   • Zip the dist folder"
echo "   • Upload to any hosting service"
echo ""

read -p "Deploy with Netlify CLI now? (y/n): " deploy_now

if [ "$deploy_now" = "y" ] || [ "$deploy_now" = "Y" ]; then
    echo ""
    echo "🔐 Logging into Netlify..."
    netlify login
    
    echo ""
    echo "🚀 Deploying to production..."
    netlify deploy --prod --dir=dist
    
    echo ""
    echo "🎉 DEPLOYMENT COMPLETE!"
    echo "Your Seifu app is now live!"
else
    echo ""
    echo "📁 Your 'dist' folder is ready for manual deployment!"
    echo "📦 Or use the deployment package: seifu-deployment-ready.tar.gz"
fi

echo ""
echo "🎯 Next steps after deployment:"
echo "• Test wallet connections"
echo "• Verify token scanner"
echo "• Test token creation"
echo "• Share your live URL!"
echo ""
echo "🚀 Happy launching!"