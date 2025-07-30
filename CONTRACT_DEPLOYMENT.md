# 🚀 Token Factory Contract Deployment Guide

## Overview
This guide will help you deploy the SimpleTokenFactory contract to SEI testnet with a 2 SEI creation fee that goes to your dev wallet.

## Prerequisites

1. **SEI Testnet Tokens**: You need SEI testnet tokens for deployment
   - Get testnet SEI from: [SEI Testnet Faucet](https://atlantic-2.app.sei.io/faucet)

2. **Private Key**: Your wallet's private key for deployment
   - ⚠️ **NEVER** commit your private key to git
   - Use a dedicated deployment wallet for security

## Setup

### 1. Create Environment File
```bash
cp .env.example .env
```

### 2. Configure Environment Variables
Edit `.env` file:
```env
# Your deployment wallet's private key (without 0x prefix)
PRIVATE_KEY=your_actual_private_key_here

# Your dev wallet address (where fees will go)
DEV_WALLET=0x742d35Cc6635C0532925a3b8D41c4e9E4532D3eE
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Compile Contracts
```bash
npm run compile
```

## Deployment

### Deploy to SEI Testnet
```bash
npm run deploy:factory
```

This will:
- ✅ Deploy SimpleTokenFactory contract
- ✅ Set creation fee to 2 SEI
- ✅ Set your wallet as fee recipient
- ✅ Create a test token to verify functionality
- ✅ Display contract address and verification info

### Expected Output
```
🚀 Deploying SimpleTokenFactory to SEI testnet...
📋 Dev fee recipient: 0x742d35Cc6635C0532925a3b8D41c4e9E4532D3eE
💰 Creation fee: 2 SEI
🔑 Deploying with account: 0x...
💳 Account balance: 10.0 SEI
✅ SimpleTokenFactory deployed to: 0x1234567890abcdef...
🔗 View on Seitrace: https://seitrace.com/address/0x1234567890abcdef...
✅ Creation fee: 2.0 SEI
✅ Fee recipient: 0x742d35Cc6635C0532925a3b8D41c4e9E4532D3eE
✅ Test token creation successful!
🎉 Deployment complete!
```

## Update Frontend

After successful deployment:

1. **Copy the contract address** from deployment output
2. **Update LaunchpadForm.tsx**:
   ```typescript
   // Replace this line:
   const FACTORY_ADDRESS = "0x0000000000000000000000000000000000000000";
   
   // With your deployed address:
   const FACTORY_ADDRESS = "0x1234567890abcdef..."; // Your actual contract address
   ```

3. **Deploy frontend** to Netlify:
   ```bash
   git add -A
   git commit -m "Update factory contract address"
   git push origin main
   ```

## Contract Features

### Token Creation Fee
- **Amount**: 2 SEI per token creation
- **Recipient**: Your dev wallet address
- **Purpose**: Prevent spam and generate revenue

### Token Features
- ✅ **ERC20 Compatible**: Standard token interface
- ✅ **Mintable**: Owner can mint additional tokens
- ✅ **Burnable**: Users can burn their tokens
- ✅ **Ownable**: Ownership can be transferred or renounced

### Factory Features
- ✅ **User Token Tracking**: Track tokens created by each user
- ✅ **Global Token List**: List of all created tokens
- ✅ **Fee Management**: Owner can update fees if needed
- ✅ **Event Logging**: All creations are logged with events

## Testing

### Test Token Creation
Once deployed, users can:
1. Connect their SEI wallet
2. Fill out token creation form
3. Pay 2 SEI creation fee
4. Receive their new ERC20 token
5. View token on Seitrace block explorer

### Verify Deployment
- Check contract on [Seitrace](https://seitrace.com)
- Verify fee recipient is your wallet
- Test token creation through the UI
- Confirm fees are received in your wallet

## Security Notes

- ✅ **Fee Validation**: Contract requires exact fee amount
- ✅ **Input Validation**: All token parameters are validated
- ✅ **Ownership Controls**: Only fee recipient can update settings
- ✅ **Event Logging**: All actions are transparently logged

## Troubleshooting

### Common Issues

1. **Insufficient Balance**
   - Ensure you have enough SEI for deployment (~0.1 SEI)
   - Get more from the testnet faucet

2. **Network Issues**
   - Check SEI testnet RPC is responding
   - Verify chainId is 1328

3. **Private Key Issues**
   - Ensure private key is without 0x prefix
   - Check wallet has SEI testnet tokens

### Support
If you encounter issues:
1. Check the deployment logs for specific errors
2. Verify your .env configuration
3. Ensure you have testnet SEI tokens
4. Check network connectivity to SEI testnet

## Next Steps

After successful deployment:
1. ✅ Update frontend with contract address
2. ✅ Test token creation flow
3. ✅ Monitor fee collection in your wallet
4. ✅ Consider contract verification on block explorer
5. ✅ Deploy to mainnet when ready

---

**⚠️ Security Reminder**: Never commit your private key to version control. Use environment variables and keep your .env file secure.