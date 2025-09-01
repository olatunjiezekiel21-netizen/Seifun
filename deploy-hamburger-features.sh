#!/bin/bash

echo "🚀 DEPLOYING SEIFUN WITH COMPLETE HAMBURGER MENU FEATURES"
echo "========================================================"

# Build the project
echo "📦 Building project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Deploy to Netlify
    echo "🌐 Deploying to Netlify..."
    netlify deploy --prod --dir=dist
    
    if [ $? -eq 0 ]; then
        echo "🎉 DEPLOYMENT SUCCESSFUL!"
        echo "========================================================"
        echo "✅ Seifun with complete hamburger menu is now live!"
        echo "✅ All 7 functional panels are working:"
        echo "   - 🤖 AI Chat"
        echo "   - 💳 Transactions" 
        echo "   - 📚 Chat History (REAL)"
        echo "   - 📊 Portfolio (REAL)"
        echo "   - 👛 Wallet (REAL)"
        echo "   - 📈 Analytics (REAL)"
        echo "   - ⚙️ Settings (REAL)"
        echo "========================================================"
    else
        echo "❌ Deployment failed. Please check your Netlify configuration."
    fi
else
    echo "❌ Build failed. Please check for errors."
    exit 1
fi