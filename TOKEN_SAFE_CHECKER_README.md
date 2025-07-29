# SeifuGuard TokenSafeChecker

A comprehensive token safety analysis system for the Sei blockchain, designed to detect rug pulls, honeypots, and other malicious token patterns.

## 🎯 Overview

The TokenSafeChecker is the core component of Seifu that provides real-time security analysis for any token on the Sei blockchain. It performs multiple safety checks and provides a risk score to help users make informed trading decisions.

## 🔍 Safety Checks Performed

### 1. **Supply Analysis**
- Monitors total supply changes
- Detects suspicious minting activities
- Alerts on supply increases > 5%

### 2. **Ownership Analysis**
- Checks if token ownership is renounced
- Identifies potential owner privileges
- Verifies contract control

### 3. **Liquidity Analysis**
- Monitors liquidity pool changes
- Detects liquidity removal
- Alerts on significant liquidity decreases

### 4. **Honeypot Detection**
- Analyzes contract bytecode for honeypot patterns
- Simulates buy/sell transactions
- Detects tokens that can't be sold

### 5. **Blacklist Function Detection**
- Scans for blacklist functions in contract
- Identifies potential for user blocking
- Checks for discriminatory functions

### 6. **Contract Verification**
- Verifies contract source code
- Checks for verified contracts on block explorer
- Ensures transparency

### 7. **Transfer Function Analysis**
- Validates transfer functionality
- Checks for transfer restrictions
- Ensures basic ERC20 compliance

### 8. **Fee Structure Analysis**
- Detects excessive fees
- Monitors for hidden fees
- Analyzes fee mechanisms

## 🏗️ Architecture

### Smart Contracts
- **TokenSafeChecker.sol**: Individual token monitoring contract
- **TokenCheckerFactory.sol**: Factory for deploying checkers

### Backend API
- **Node.js/Express**: RESTful API for token analysis
- **MongoDB**: Storage for analysis results and history
- **Ethers.js**: Blockchain interaction

### Frontend
- **React/TypeScript**: User interface for token scanning
- **Real-time updates**: Live analysis results
- **Scan history**: Track previous analyses

## 🚀 Quick Start

### 1. Deploy Smart Contracts

```bash
# Compile contracts
npx hardhat compile

# Deploy to testnet
npx hardhat run scripts/deploy.js --network sei-testnet

# Deploy to mainnet
npx hardhat run scripts/deploy.js --network sei-mainnet
```

### 2. Configure Backend

```bash
# Install dependencies
cd backend
npm install

# Set environment variables
cp .env.example .env
# Edit .env with your configuration

# Start backend server
npm start
```

### 3. Configure Frontend

```bash
# Install dependencies
npm install

# Update API endpoint in TokenScanner.tsx
const API_BASE_URL = 'http://localhost:3001/api';

# Start development server
npm run dev
```

## 📊 Risk Scoring System

### Score Ranges
- **80-100**: Safe to trade
- **60-79**: Exercise caution
- **0-59**: High risk, avoid trading

### Score Calculation
- Supply issues: -20 points
- Ownership issues: -15 points
- Liquidity issues: -25 points
- Honeypot detection: -100 points (instant fail)
- Blacklist functions: -10 points
- Unverified contract: -5 points
- Transfer issues: -15 points
- Excessive fees: -10 points

## 🔧 API Endpoints

### Scan Token
```http
POST /api/scan
Content-Type: application/json

{
  "tokenAddress": "sei1..."
}
```

### Get Scan History
```http
GET /api/history/{tokenAddress}
```

### Get Recent Scans
```http
GET /api/recent-scans
```

### Get Statistics
```http
GET /api/stats
```

## 📝 Usage Examples

### Frontend Integration

```typescript
// Scan a token
const scanToken = async (tokenAddress: string) => {
  const response = await fetch('/api/scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tokenAddress })
  });
  
  const result = await response.json();
  return result.data;
};

// Display results
const displayResults = (analysis: ScanResult) => {
  console.log(`Safety Score: ${analysis.analysis.riskScore}`);
  console.log(`Is Safe: ${analysis.analysis.isSafe}`);
  console.log(`Risk Factors: ${analysis.analysis.riskFactors.join(', ')}`);
};
```

### Smart Contract Integration

```solidity
// Deploy a checker for a token
TokenCheckerFactory factory = TokenCheckerFactory(factoryAddress);
address checker = factory.deployChecker(tokenAddress);

// Analyze token safety
TokenSafeChecker checker = TokenSafeChecker(checkerAddress);
(uint256 score, bool isSafe, string[] memory risks) = checker.analyzeTokenSafety();
```

## 🛡️ Security Features

### Real-time Monitoring
- Continuous supply monitoring
- Liquidity pool tracking
- Ownership change detection

### Event Logging
- Suspicious activity events
- Supply change alerts
- Liquidity removal notifications

### Access Control
- Factory owner controls
- Admin functions protection
- Emergency pause capabilities

## 🔄 Continuous Monitoring

The system provides continuous monitoring through:

1. **Event Listeners**: Monitor blockchain events
2. **Periodic Checks**: Automated safety analysis
3. **Alert System**: Real-time notifications
4. **History Tracking**: Complete audit trail

## 📈 Performance Optimization

### Caching
- Analysis results caching
- Token metadata storage
- Frequent queries optimization

### Batch Processing
- Multiple token analysis
- Bulk checker deployment
- Efficient database queries

## 🧪 Testing

### Unit Tests
```bash
npx hardhat test
```

### Integration Tests
```bash
npm run test:integration
```

### Manual Testing
1. Deploy test tokens
2. Run safety analysis
3. Verify results accuracy
4. Test edge cases

## 🔧 Configuration

### Environment Variables
```env
# Blockchain
SEI_RPC_URL=https://sei-rpc-endpoint
FACTORY_CONTRACT_ADDRESS=0x...

# Database
MONGODB_URI=mongodb://localhost:27017/seifu

# API
PORT=3001
NODE_ENV=development
```

### Contract Configuration
```javascript
// Hardhat config
module.exports = {
  networks: {
    sei: {
      url: process.env.SEI_RPC_URL,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
```

## 🚨 Troubleshooting

### Common Issues

1. **RPC Connection Failed**
   - Check RPC endpoint
   - Verify network configuration
   - Ensure proper authentication

2. **Contract Deployment Failed**
   - Check gas limits
   - Verify account balance
   - Ensure correct network

3. **Analysis Timeout**
   - Increase timeout settings
   - Check RPC performance
   - Optimize analysis algorithms

### Debug Mode
```bash
# Enable debug logging
DEBUG=seifu:* npm start

# Verbose contract interactions
npx hardhat console --network sei
```

## 📚 Additional Resources

- [Sei Blockchain Documentation](https://docs.sei.io/)
- [Ethers.js Documentation](https://docs.ethers.io/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Hardhat Documentation](https://hardhat.org/docs/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Join our Discord community
- Check the documentation

---

**Built with ❤️ for the Sei ecosystem** 