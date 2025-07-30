# 🚀 Complete Deployment Guide (Frontend + Smart Contract)

## **What You'll Get:**
- ✅ Live website on Netlify
- ✅ Real token creation functionality  
- ✅ 2 SEI fee going to your wallet
- ✅ Mobile responsive design
- ✅ Revenue-generating platform

---

## **Step 1: Get SEI Testnet Tokens** 🪙

**You need at least 5 SEI for deployment and testing.**

### **Quick Faucet Options:**
1. **https://faucet.sei-apis.com/** (Fastest)
2. **SEI Discord**: `!faucet 0x742d35Cc6635C0532925a3b8D41c4e9E4532D3eE`
3. **https://faucet.sei.io/**

---

## **Step 2: Update Environment Variables** 🔧

1. **Open the `.env` file**
2. **Replace `your-private-key-here`** with your actual private key
   ```env
   PRIVATE_KEY=your-64-character-private-key-without-0x
   DEV_WALLET=0x742d35Cc6635C0532925a3b8D41c4e9E4532D3eE
   SEI_TESTNET_RPC=https://evm-rpc-testnet.sei-apis.com
   ```

**⚠️ Important:** 
- Private key should be **64 characters** 
- **No `0x` prefix**
- Keep this file secure!

---

## **Step 3: Deploy Smart Contract** 🔨

Run the complete deployment script:

```bash
./deploy-complete.sh
```

**This will:**
1. ✅ Compile the smart contracts
2. ✅ Deploy SimpleTokenFactory to SEI testnet
3. ✅ Show you the contract address
4. ✅ Build the frontend

**Expected Output:**
```
✅ Contract deployed successfully!
📋 Factory Address: 0x1234567890abcdef...
💰 Creation Fee: 2 SEI
👤 Dev Wallet: 0x742d35Cc6635C0532925a3b8D41c4e9E4532D3eE
```

---

## **Step 4: Update Frontend** 🎯

1. **Copy the contract address** from deployment output
2. **Open `src/components/LaunchpadForm.tsx`**
3. **Find this line:**
   ```typescript
   const FACTORY_ADDRESS = "0x0000000000000000000000000000000000000000";
   ```
4. **Replace with your deployed address:**
   ```typescript
   const FACTORY_ADDRESS = "0x1234567890abcdef..."; // Your actual address
   ```

---

## **Step 5: Deploy to Netlify** 🌐

### **Option A: GitHub Integration (Recommended)**
1. **Commit and push changes:**
   ```bash
   git add .
   git commit -m "Add deployed contract address"
   git push origin main
   ```

2. **Go to Netlify:**
   - **https://app.netlify.com**
   - **"Add new site" → "Import existing project"**
   - **Connect GitHub → Select `seifu` repo**
   - **Settings:**
     ```
     Branch: main
     Build command: npm run build
     Publish directory: dist
     ```
   - **Deploy!**

### **Option B: Manual Deploy**
1. **Build locally:** `npm run build`
2. **Drag `dist` folder** to Netlify

---

## **Step 6: Test Everything** 🧪

### **On Your New Netlify Site:**

**Desktop Testing:**
- ✅ Homepage loads
- ✅ "Create Token" → Launchpad
- ✅ Token creation form works
- ✅ Wallet connection works
- ✅ "Create Token (2 SEI)" button

**Mobile Testing:**
- ✅ Responsive design
- ✅ All features work on mobile
- ✅ No horizontal scrolling

**Real Token Creation:**
- ✅ Connect wallet
- ✅ Fill token details
- ✅ Pay 2 SEI fee
- ✅ Get real token address
- ✅ Fee goes to your dev wallet

---

## **🎉 Success! You Now Have:**

- 🌐 **Live website** accessible on mobile
- 💰 **Revenue stream** (2 SEI per token creation)
- 🔗 **Real blockchain integration**
- 📱 **Mobile-optimized UI**
- 🚀 **Professional token launchpad**

---

## **🆘 Troubleshooting:**

**Contract Deployment Failed?**
- Check SEI testnet balance
- Verify private key format (64 chars, no 0x)
- Try different RPC if needed

**Netlify Build Failed?**
- Check build logs
- Ensure `dist` publish directory
- Verify `main` branch selected

**Token Creation Not Working?**
- Verify contract address is updated
- Check wallet connection
- Ensure user has SEI for gas

---

## **💡 Next Steps:**

1. **Share your new URL** with users
2. **Monitor token creations** and revenue
3. **Add more features** as needed
4. **Scale your platform**

**Your token launchpad is now live and generating revenue!** 🎊