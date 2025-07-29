# 🛡️ SeifuGuard - Universal Sei Token Scanner

A comprehensive, real-time token safety scanner for the Sei blockchain network. Analyze any token or smart contract with advanced security checks, logo fetching, and professional UI.

## 🌟 Features

### 🔍 Universal Token Support
- **ERC20 Tokens**: Full safety analysis with all security checks
- **Non-Standard Tokens**: Adaptive analysis with multiple fallback strategies
- **Smart Contracts**: Basic contract information and analysis
- **Factory Contracts**: Contract deployment and interaction analysis
- **NFT Contracts**: Basic information display for ERC721/ERC1155

### 🛡️ Advanced Security Analysis
- **Supply Analysis**: Total supply validation and mint function detection
- **Ownership Checks**: Contract owner detection and renouncement status
- **Blacklist Detection**: Identifies dangerous blacklist functionality
- **Transfer Analysis**: Validates transfer function availability
- **Tax/Fee Detection**: Identifies buy/sell taxes and excessive fees
- **Liquidity Analysis**: Basic liquidity validation
- **Honeypot Detection**: Advanced contract code pattern analysis

### 🎨 Professional UI Features
- **Multi-Source Logo Fetching**: Tries 6+ different logo sources
- **Smart Fallbacks**: Beautiful, consistent generated logos
- **Real-Time Progress**: Live scanning progress indicators
- **Scan History**: Maintains history of analyzed tokens
- **Responsive Design**: Works on all devices
- **Error Handling**: Graceful handling of any contract type

## 🚀 Live Demo

**Deployed on Netlify**: [Your Netlify URL will be here]

## 🧪 Test Addresses

Try these addresses to see the scanner in action:

1. **Factory Contract** (Non-ERC20):
   ```
   0x50C0b92b3BC34D7FeD7Da0C48a2F16a636D95C9F
   ```

2. **Test Token** (Demo):
   ```
   0x5f0e07dfee5832faa00c63f2d33a0d79150e8598
   ```

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
git clone [your-repo-url]
cd seifu
npm install
```

### Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 🌐 Deployment

### Netlify Deployment

#### Option 1: Deploy from Git (Recommended)
1. Push your code to GitHub
2. Connect your GitHub repo to Netlify
3. Netlify will automatically deploy using the `netlify.toml` configuration

#### Option 2: Manual Deployment
1. Build the project: `npm run build`
2. Drag and drop the `dist` folder to Netlify

#### Option 3: Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

### Other Deployment Options
- **Vercel**: Works out of the box with zero configuration
- **GitHub Pages**: Use the included GitHub Actions workflow
- **Firebase Hosting**: Compatible with static hosting
- **AWS S3 + CloudFront**: For enterprise deployments

## 🔧 Configuration

### Environment Variables
Create a `.env` file for local development:
```env
# Sei Network Configuration
SEI_RPC_URL=https://evm-rpc-testnet.sei-apis.com
FACTORY_CONTRACT_ADDRESS=0x50C0b92b3BC34D7FeD7Da0C48a2F16a636D95C9F

# Database Configuration (for backend)
MONGODB_URI=mongodb://localhost:27017/seifu
PORT=3001
```

### Vite Configuration
The `vite.config.ts` is optimized for:
- Fast builds with code splitting
- Optimal asset handling
- Development server configuration
- Production optimizations

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **React 18**: Modern React with hooks
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first styling
- **Ethers.js**: Blockchain interaction

### Token Scanner Engine
- **Multi-Strategy Analysis**: 4 fallback strategies for token info
- **Enhanced Validation**: Address format and contract detection
- **Logo Fetching**: 6+ sources with smart fallbacks
- **Safety Checks**: 8 different security analysis modules

### Backend (Optional)
- **Node.js + Express**: API server
- **MongoDB**: Token data storage
- **Event Monitoring**: Blockchain event tracking

## 📊 Token Analysis Process

1. **Address Validation**: Format validation and checksum verification
2. **Contract Detection**: Distinguishes contracts from EOAs
3. **Token Standard Detection**: Identifies ERC20/721/1155 compatibility
4. **Multi-Strategy Info Fetching**: 4 fallback strategies for token data
5. **Logo Fetching**: Searches 6+ sources for token logos
6. **Safety Analysis**: 8 comprehensive security checks
7. **Risk Scoring**: Calculated risk score based on findings
8. **Results Display**: Professional UI with detailed analysis

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Sei Network for the blockchain infrastructure
- Ethers.js for blockchain interaction
- React community for the amazing ecosystem
- All logo providers (CoinGecko, Trust Wallet, etc.)

## 📞 Support

For support, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ for the Sei ecosystem** 🌊
