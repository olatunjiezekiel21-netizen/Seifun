# 🚀 Netlify CLI Deployment Instructions

**Deploy your Seifu Token Launchpad using Netlify CLI from your local machine**

## 📋 **Prerequisites**
- Node.js 18+ installed
- Git installed
- Netlify account (free at https://app.netlify.com)

---

## ⚡ **Step-by-Step Deployment**

### **Step 1: Clone Your Repository**
```bash
# Clone your repository to your local machine
git clone https://github.com/Godswork4/seifu.git
cd seifu
```

### **Step 2: Install Dependencies**
```bash
# Install project dependencies
npm install

# Install Netlify CLI globally
npm install -g netlify-cli
```

### **Step 3: Build the Project**
```bash
# Create production build
npm run build
```

### **Step 4: Login to Netlify**
```bash
# Login to your Netlify account
netlify login
```
*This will open your browser to authenticate with Netlify*

### **Step 5: Deploy to Production**
```bash
# Deploy to production
netlify deploy --prod --dir=dist --message="🚀 Seifu Token Launchpad Production Launch"
```

---

## 🎯 **Expected Output**

After successful deployment, you'll see:

```bash
✔ Finished hashing 12 files and 1 functions
✔ CDN requesting 4 files and 0 functions
✔ Finished uploading 4 assets
✔ Deploy is live!

Logs:              https://app.netlify.com/sites/your-site/deploys/xxxxx
Unique Deploy URL: https://xxxxx--your-site.netlify.app
Website URL:       https://your-site.netlify.app
```

---

## 🎉 **After Deployment**

### **✅ Your Live Site Will Have:**
- **Professional Token Launchpad**: Full UI/UX
- **Real Token Scanner**: No mock data
- **Mobile Responsive**: Works on all devices
- **Revenue Generation**: 2 SEI per token creation
- **Wallet Integration**: Sei, Compass, Keplr support

### **🧪 Test Your Live Site:**

1. **Token Scanner Test:**
   - Contract: `0x50C0b92b3BC34D7FeD7Da0C48a2F16a636D95C9F`
   - Wallet: `0x966CBf1baa5C08e4458f08A4CF1ECbb6Ae50894e`

2. **Navigation Test:**
   - "Create Token" → Launchpad page
   - "Explore Tokens" → MemeHub (seifu.fun)

3. **Token Creation Test:**
   - Connect your SEI wallet
   - Fill token creation form
   - Test "Create Token (2 SEI)" functionality

4. **Mobile Test:**
   - Open on mobile device
   - Test all functionality works

---

## 🔧 **Alternative: One-Command Deployment**

If you prefer a single command after cloning:

```bash
# All-in-one deployment script
npm install && npm run build && netlify deploy --prod --dir=dist
```

---

## 🆘 **Troubleshooting**

### **Build Fails?**
```bash
# Check Node.js version
node --version  # Should be 18+

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### **Netlify CLI Issues?**
```bash
# Update Netlify CLI
npm update -g netlify-cli

# Re-login
netlify logout
netlify login
```

### **Deploy Fails?**
```bash
# Check if dist folder exists
ls -la dist/

# Try manual site creation
netlify sites:create --name your-site-name
netlify deploy --prod --dir=dist --site=your-site-name
```

---

## 💰 **Revenue Model Active**

After deployment, your site will:
- ✅ **Collect 2 SEI** per token creation
- ✅ **Send fees directly** to: `0x966CBf1baa5C08e4458f08A4CF1ECbb6Ae50894e`
- ✅ **Generate revenue** automatically
- ✅ **Scale with usage**

---

## 🎊 **Success Indicators**

### **✅ Deployment Successful When:**
- Site loads in < 3 seconds
- Token scanner shows real blockchain data
- Navigation works perfectly
- Mobile experience is smooth
- No console errors

### **💰 Revenue Ready When:**
- Token creation form works
- Wallet connection successful
- 2 SEI fee displays correctly
- Test token creation completes

---

## 🚀 **Next Steps After Deployment**

1. **Share Your URL**: Social media, SEI community
2. **Monitor Usage**: Track token creations and revenue
3. **Scale Marketing**: Drive user acquisition
4. **Plan Mainnet**: Deploy to SEI mainnet when ready

---

**🎉 Your professional token launchpad is ready to generate revenue!**

**Copy these commands and run them on your local machine to deploy in minutes!** ⚡