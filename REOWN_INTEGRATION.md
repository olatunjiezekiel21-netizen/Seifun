# Reown Wallet Integration Guide

## Overview
Reown is a modern wallet infrastructure that provides seamless wallet connectivity for Web3 applications. This guide covers the integration of Reown wallet functionality into the Seifun platform.

## Required Dependencies

### 1. Install Reown Dependencies
```bash
npm install @reown/appkit @reown/appkit-wallet @reown/appkit-ui
```

### 2. Required Configuration

#### Environment Variables
```env
# Reown Configuration
REOWN_PROJECT_ID=your_project_id_here
REOWN_APP_ID=your_app_id_here
REOWN_RELAY_URL=wss://relay.reown.com
```

#### Get Your Project ID and App ID
1. Visit [Reown Dashboard](https://dashboard.reown.com)
2. Create a new project
3. Get your Project ID and App ID from the dashboard
4. Configure your project settings

## Implementation Steps

### 1. Update Package.json
```json
{
  "dependencies": {
    "@reown/appkit": "^1.7.8",
    "@reown/appkit-wallet": "^1.7.8",
    "@reown/appkit-ui": "^1.7.8"
  }
}
```

### 2. Create Reown Configuration
```typescript
// src/config/reown.ts
export const reownConfig = {
  projectId: process.env.REOWN_PROJECT_ID || 'your_project_id',
  appId: process.env.REOWN_APP_ID || 'your_app_id',
  relayUrl: process.env.REOWN_RELAY_URL || 'wss://relay.reown.com',
  chains: ['sei:atlantic-2'], // Sei testnet
  // chains: ['sei:sei-network'], // Sei mainnet
};
```

### 3. Update Wallet Connection
```typescript
// src/utils/reownWalletConnection.ts
import { ReownAppKit } from '@reown/appkit';
import { reownConfig } from '../config/reown';

export class ReownWalletConnection {
  private appKit: ReownAppKit;

  constructor() {
    this.appKit = new ReownAppKit({
      projectId: reownConfig.projectId,
      appId: reownConfig.appId,
      relayUrl: reownConfig.relayUrl,
      chains: reownConfig.chains,
    });
  }

  async connect() {
    try {
      const session = await this.appKit.connect();
      return {
        address: session.accounts[0].address,
        chainId: session.chainId,
        walletType: 'reown'
      };
    } catch (error) {
      console.error('Reown connection failed:', error);
      throw error;
    }
  }

  async disconnect() {
    await this.appKit.disconnect();
  }

  async signTransaction(transaction: any) {
    return await this.appKit.signTransaction(transaction);
  }
}
```

### 4. Update Header Component
```typescript
// src/components/Header.tsx
import { ReownWalletConnection } from '../utils/reownWalletConnection';

// Add Reown to available wallets
const getAvailableWallets = (): string[] => {
  const wallets: string[] = [];
  
  if (window.sei) wallets.push('sei');
  if (window.compass) wallets.push('compass');
  if (window.keplr) wallets.push('keplr');
  if (window.ethereum) wallets.push('metamask');
  
  // Add Reown wallet
  wallets.push('reown');
  
  return wallets;
};
```

## Features Provided by Reown

### 1. Multi-Chain Support
- Sei Network (Mainnet & Testnet)
- Ethereum
- Polygon
- And more...

### 2. Wallet Types
- Mobile Wallets (WalletConnect)
- Browser Extensions
- Hardware Wallets
- Social Logins

### 3. Advanced Features
- Transaction Signing
- Message Signing
- Chain Switching
- Session Management

## Security Considerations

### 1. Environment Variables
- Never commit Project ID or App ID to version control
- Use environment variables for sensitive data
- Implement proper secret management

### 2. Error Handling
```typescript
try {
  const wallet = new ReownWalletConnection();
  const session = await wallet.connect();
} catch (error) {
  if (error.code === 'USER_REJECTED') {
    // User cancelled the connection
  } else if (error.code === 'UNSUPPORTED_CHAIN') {
    // Chain not supported
  } else {
    // Handle other errors
  }
}
```

## Testing

### 1. Development Environment
```bash
# Set environment variables
export REOWN_PROJECT_ID=your_test_project_id
export REOWN_APP_ID=your_test_app_id

# Run development server
npm run dev
```

### 2. Production Deployment
- Set environment variables in your hosting platform
- Configure proper CORS settings
- Implement proper error monitoring

## Migration from Current Implementation

### 1. Gradual Migration
- Keep existing wallet connections
- Add Reown as an additional option
- Test thoroughly before full migration

### 2. User Experience
- Provide clear wallet selection UI
- Show wallet capabilities
- Handle connection errors gracefully

## Troubleshooting

### Common Issues
1. **Connection Failed**: Check Project ID and App ID
2. **Chain Not Supported**: Verify chain configuration
3. **Mobile Wallet Issues**: Ensure proper WalletConnect setup

### Debug Mode
```typescript
const appKit = new ReownAppKit({
  ...config,
  debug: true, // Enable debug logging
});
```

## Next Steps

1. **Install Dependencies**: Add Reown packages to package.json
2. **Get Credentials**: Obtain Project ID and App ID from Reown dashboard
3. **Configure Environment**: Set up environment variables
4. **Implement Integration**: Update wallet connection logic
5. **Test Thoroughly**: Test all wallet scenarios
6. **Deploy**: Deploy with proper environment configuration

## Support

- [Reown Documentation](https://docs.reown.com)
- [Reown Dashboard](https://dashboard.reown.com)
- [Community Discord](https://discord.gg/reown)