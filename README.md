# 🚀 Seifu - Professional Token Launchpad on SEI Network

[![Netlify Status](https://api.netlify.com/api/v1/badges/your-badge-id/deploy-status)](https://app.netlify.com/sites/your-site-name/deploys)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![SEI Network](https://img.shields.io/badge/Network-SEI%20Testnet-blue)](https://sei.io)

> **Live Demo**: [Your Netlify URL Here]
> 
> **Factory Contract**: [`0x50C0b92b3BC34D7FeD7Da0C48a2F16a636D95C9F`](https://seitrace.com/address/0x50C0b92b3BC34D7FeD7Da0C48a2F16a636D95C9F)

## 🌟 **What is Seifu?**

Seifu is a **professional token launchpad** built on the SEI Network that enables users to:
- 🔍 **Scan & analyze** any SEI token for safety
- 🚀 **Create new tokens** with a simple, intuitive interface  
- 💰 **Generate revenue** through a 2 SEI creation fee model
- 📱 **Access on mobile** with full responsive design
- 🔗 **Connect wallets** (Sei, Compass, Keplr support)

## ✨ **Key Features**

### 🔍 **Advanced Token Scanner**
- **Real-time analysis** of any SEI token contract
- **Wallet vs Contract detection** (no more mock data!)
- **Safety checks**: Supply, ownership, liquidity analysis
- **Mobile responsive** design for on-the-go scanning

### 🚀 **Token Creation Launchpad**
- **One-click token deployment** on SEI testnet
- **2 SEI creation fee** (automatic revenue generation)
- **Real blockchain integration** with ethers.js
- **Professional UI/UX** for seamless user experience

### 💰 **Revenue Model**
- **Automated fee collection**: 2 SEI per token creation
- **Direct wallet transfers**: Fees go to developer wallet
- **Scalable business model**: Ready for mainnet deployment

### 📱 **Mobile-First Design**
- **Fully responsive** across all devices
- **Touch-optimized** interface
- **No horizontal scrolling** issues
- **Professional mobile experience**

## 🏗️ **Architecture**

### **Frontend Stack**
- ⚛️ **React 18** with TypeScript
- 🎨 **Tailwind CSS** for styling
- 🔗 **React Router** for navigation
- 🌐 **Vite** for fast development
- 📱 **Mobile-responsive** design

### **Blockchain Integration**
- 🔗 **Ethers.js v6** for Web3 connectivity
- 🏭 **Smart Contract Factory** for token deployment
- 💳 **Multi-wallet support** (Sei, Compass, Keplr)
- 🌐 **SEI Testnet** integration

### **Smart Contracts**
- 📄 **SimpleTokenFactory.sol**: Main factory contract
- 🪙 **SimpleToken.sol**: ERC20 token template
- 💰 **Fee management**: Automated 2 SEI collection
- 🔒 **Ownership controls**: Secure admin functions

## 🚀 **Deployment Information**

### **Live Deployment**
- **Network**: SEI Testnet (Chain ID: 1328)
- **Factory Contract**: `0x50C0b92b3BC34D7FeD7Da0C48a2F16a636D95C9F`
- **Fee Recipient**: `0x966CBf1baa5C08e4458f08A4CF1ECbb6Ae50894e`
- **Creation Fee**: 2 SEI per token

### **Netlify Configuration**
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Environment**: Node.js 18
- **SPA Routing**: Configured with redirects

## 🛠️ **Development Setup**

### **Prerequisites**
```bash
Node.js 18+
npm or yarn
Git
```

### **Installation**
```bash
# Clone repository
git clone https://github.com/Godswork4/seifu.git
cd seifu

# Install dependencies
npm install

# Start development server
npm run dev
```

### **Available Scripts**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run compile      # Compile smart contracts
npm run deploy:factory # Deploy factory contract
```

## 📋 **Project Structure**

```
seifu/
├── src/
│   ├── components/          # React components
│   │   ├── Header.tsx       # Navigation & wallet connection
│   │   ├── Hero.tsx         # Landing section
│   │   ├── TokenScanner.tsx # Token analysis component
│   │   └── LaunchpadForm.tsx # Token creation form
│   ├── pages/               # Route pages
│   ├── utils/               # Utilities
│   │   ├── tokenScanner.ts  # Token analysis logic
│   │   └── walletConnection.ts # Wallet integration
│   └── App.tsx              # Main application
├── contracts/               # Smart contracts
│   ├── SimpleTokenFactory.sol
│   └── SimpleToken.sol
├── scripts/                 # Deployment scripts
├── public/                  # Static assets
└── dist/                   # Production build
```

## 🔧 **Configuration**

### **Environment Variables**
```env
# For contract deployment only
PRIVATE_KEY=your-private-key-here
DEV_WALLET=0x966CBf1baa5C08e4458f08A4CF1ECbb6Ae50894e
SEI_TESTNET_RPC=https://evm-rpc-testnet.sei-apis.com
```

### **Network Configuration**
```javascript
// SEI Testnet
Chain ID: 1328
RPC URL: https://evm-rpc-testnet.sei-apis.com
Explorer: https://seitrace.com
```

## 💰 **Revenue Analytics**

### **Business Model**
- **Revenue Stream**: 2 SEI per token creation
- **Market Size**: SEI ecosystem growth
- **Scalability**: Ready for mainnet deployment
- **Automation**: No manual intervention required

### **Fee Structure**
```
Token Creation Fee: 2 SEI
Gas Fees: Paid by user
Revenue Share: 100% to developer
Payment Method: Automatic on creation
```

## 🧪 **Testing**

### **Manual Testing**
- ✅ Token scanner with various addresses
- ✅ Wallet connection across different wallets
- ✅ Token creation end-to-end flow
- ✅ Mobile responsiveness testing
- ✅ Revenue collection verification

### **Test Addresses**
```bash
# Contract Address (for token analysis)
0x50C0b92b3BC34D7FeD7Da0C48a2F16a636D95C9F

# Wallet Address (for wallet info)
0x966CBf1baa5C08e4458f08A4CF1ECbb6Ae50894e
```

## 📱 **Mobile Experience**

- **Responsive Design**: Works on all screen sizes
- **Touch Optimized**: Easy mobile navigation
- **Fast Loading**: Optimized build (80KB gzipped)
- **PWA Ready**: Can be installed as app

## 🚀 **Deployment Guide**

### **Netlify Deployment**
1. Fork this repository
2. Connect to Netlify
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Deploy!

### **Custom Domain**
- Update DNS settings
- Configure SSL certificate
- Set up redirects if needed

## 🔐 **Security**

- ✅ **Smart contract audited** (basic security checks)
- ✅ **Input validation** on all forms
- ✅ **Secure wallet connections**
- ✅ **No private key exposure**
- ✅ **HTTPS enforcement**

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **SEI Network** for the fast, scalable blockchain
- **React & Vite** for the excellent development experience
- **Tailwind CSS** for the beautiful, responsive design
- **Ethers.js** for seamless Web3 integration

## 📞 **Support**

- **Issues**: [GitHub Issues](https://github.com/Godswork4/seifu/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Godswork4/seifu/discussions)
- **Email**: [your-email@example.com]

---

**Built with ❤️ for the SEI ecosystem**

*Ready to launch your next token? Visit [Your Netlify URL] and start creating!* 🚀
