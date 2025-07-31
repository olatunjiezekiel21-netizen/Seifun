# 🚀 Seifu - Token Launchpad on SEI Network

[![Production Ready](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)](https://github.com/Godswork4/seifu)
[![SEI Network](https://img.shields.io/badge/Network-SEI%20Testnet-blue)](https://sei.io)

> **Professional token launchpad** built on the SEI Network with real blockchain integration, token safety scanning, and automated revenue generation.

## ✨ **Key Features**

- 🔍 **Token Scanner**: Real-time safety analysis of any SEI token
- 🚀 **Token Creation**: One-click deployment with 2 SEI fee collection
- 💳 **Multi-Wallet Support**: Sei, Compass, Keplr, MetaMask
- 📱 **Mobile Optimized**: Fully responsive design
- 🔒 **No Mock Data**: 100% real blockchain integration

## 🌐 **Live Deployment**

- **Factory Contract**: `0x50C0b92b3BC34D7FeD7Da0C48a2F16a636D95C9F`
- **Network**: SEI Testnet (Chain ID: 1328)
- **Creation Fee**: 2 SEI per token
- **Bundle Size**: 80.16 KB gzipped

## 🚀 **Quick Deploy**

### Netlify (Recommended)
1. Go to [netlify.com](https://app.netlify.com/)
2. Drag & drop the `dist` folder
3. Live in seconds!

### CLI Deploy
```bash
./deploy-now.sh
```

## 🛠️ **Development**

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📁 **Project Structure**

```
seifu/
├── src/
│   ├── components/     # React components
│   ├── pages/         # Route pages
│   ├── utils/         # Blockchain utilities
│   └── App.tsx        # Main application
├── contracts/         # Smart contracts
├── dist/             # Production build
└── netlify.toml      # Deployment config
```

## 🔧 **Smart Contract**

- **SimpleTokenFactory.sol**: Deployed token factory
- **Fee Collection**: Automated 2 SEI per creation
- **Security**: Access controls and validation

## 📱 **Mobile Experience**

- Fully responsive across all devices
- Touch-optimized interface
- Fast loading (80KB gzipped)
- PWA capabilities

## 🎯 **Revenue Model**

- **2 SEI per token creation**
- **Instant collection**
- **100% to developer wallet**
- **Scalable for mainnet**

---

**Built with ❤️ for the SEI ecosystem** | **Ready for Production** 🚀
