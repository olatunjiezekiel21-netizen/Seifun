# 🔧 Environment Configuration

## 📋 **Environment Variables**

Seifu uses environment variables for flexible deployment configuration. Here's what you need to know:

### **🌐 Frontend Environment Variables (Vite)**

All frontend environment variables must be prefixed with `VITE_` to be accessible in the browser.

#### **Required Variables:**
```env
# Factory Contract Address (deployed on SEI testnet)
VITE_FACTORY_CONTRACT_ADDRESS=0x50C0b92b3BC34D7FeD7Da0C48a2F16a636D95C9F

# Developer Wallet (receives fees)
VITE_DEV_WALLET=0x966CBf1baa5C08e4458f08A4CF1ECbb6Ae50894e

# SEI Testnet RPC URL
VITE_SEI_TESTNET_RPC=https://evm-rpc-testnet.sei-apis.com

# SEI Chain ID
VITE_SEI_CHAIN_ID=1328
```

### **🔧 Backend Environment Variables (Optional)**

For smart contract deployment and backend operations:

```env
# Private key for contract deployment (DO NOT COMMIT THIS)
PRIVATE_KEY=your_private_key_here_without_0x_prefix

# Developer wallet address
DEV_WALLET=0x966CBf1baa5C08e4458f08A4CF1ECbb6Ae50894e

# RPC URL for backend operations
SEI_TESTNET_RPC=https://evm-rpc-testnet.sei-apis.com
```

---

## 📁 **Environment Files**

### **`.env.production`** (Committed - Safe values only)
```env
VITE_FACTORY_CONTRACT_ADDRESS=0x50C0b92b3BC34D7FeD7Da0C48a2F16a636D95C9F
VITE_DEV_WALLET=0x966CBf1baa5C08e4458f08A4CF1ECbb6Ae50894e
VITE_SEI_TESTNET_RPC=https://evm-rpc-testnet.sei-apis.com
VITE_SEI_CHAIN_ID=1328
```

### **`.env.local`** (Not committed - For local development)
```env
# Copy from .env.production and modify as needed
VITE_FACTORY_CONTRACT_ADDRESS=0x50C0b92b3BC34D7FeD7Da0C48a2F16a636D95C9F
VITE_DEV_WALLET=0x966CBf1baa5C08e4458f08A4CF1ECbb6Ae50894e
VITE_SEI_TESTNET_RPC=https://evm-rpc-testnet.sei-apis.com
VITE_SEI_CHAIN_ID=1328
```

---

## 🚀 **Deployment Configuration**

### **Netlify Deployment**

#### **Option 1: Environment Variables in Netlify Dashboard**
1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Add the following variables:

```
VITE_FACTORY_CONTRACT_ADDRESS = 0x50C0b92b3BC34D7FeD7Da0C48a2F16a636D95C9F
VITE_DEV_WALLET = 0x966CBf1baa5C08e4458f08A4CF1ECbb6Ae50894e
VITE_SEI_TESTNET_RPC = https://evm-rpc-testnet.sei-apis.com
VITE_SEI_CHAIN_ID = 1328
```

#### **Option 2: Using .env.production (Current Setup)**
The `.env.production` file is already configured and will be used automatically during build.

### **Other Hosting Platforms**

For other hosting platforms (Vercel, Railway, etc.), add the same environment variables in their respective dashboards.

---

## 🔒 **Security Notes**

### **✅ Safe to Commit:**
- `VITE_*` variables (public configuration)
- Contract addresses
- RPC URLs
- Chain IDs
- Public wallet addresses

### **❌ Never Commit:**
- Private keys
- Seed phrases
- API keys with write access
- Sensitive credentials

### **🛡️ Current Security Status:**
- ✅ No sensitive data in repository
- ✅ All committed values are public/safe
- ✅ Private keys only in `.env.example` as template

---

## 🧪 **Testing Environment Variables**

### **Local Development:**
```bash
# Copy example file
cp .env.example .env.local

# Edit with your values (optional - defaults work)
nano .env.local

# Start development server
npm run dev
```

### **Production Build:**
```bash
# Build uses .env.production automatically
npm run build

# Or specify environment
NODE_ENV=production npm run build
```

---

## 🔧 **Troubleshooting**

### **Environment Variables Not Loading:**
1. Ensure variables start with `VITE_` for frontend
2. Restart development server after changes
3. Check browser console for undefined variables

### **Contract Address Issues:**
1. Verify `VITE_FACTORY_CONTRACT_ADDRESS` matches deployed contract
2. Ensure address is checksummed (mixed case)
3. Test on SEI testnet explorer: https://seitrace.com

### **RPC Connection Issues:**
1. Verify `VITE_SEI_TESTNET_RPC` URL is accessible
2. Test RPC endpoint manually
3. Check for rate limiting

---

## ✅ **Current Configuration Status**

- ✅ **Factory Contract**: `0x50C0b92b3BC34D7FeD7Da0C48a2F16a636D95C9F` (Verified)
- ✅ **Fee Recipient**: `0x966CBf1baa5C08e4458f08A4CF1ECbb6Ae50894e` (Verified)
- ✅ **SEI Testnet**: Chain ID 1328 (Verified)
- ✅ **RPC Endpoint**: https://evm-rpc-testnet.sei-apis.com (Active)

**All environment variables are properly configured for production deployment!** 🚀