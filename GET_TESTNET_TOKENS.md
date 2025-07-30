# 🪙 Get SEI Testnet Tokens

## **Before Contract Deployment, You Need:**
- **At least 5 SEI** on testnet for deployment and testing

## **How to Get SEI Testnet Tokens:**

### **Option 1: SEI Faucet**
1. Go to: **https://faucet.sei-apis.com/**
2. Enter your wallet address: `0x742d35Cc6635C0532925a3b8D41c4e9E4532D3eE`
3. Request tokens
4. Wait 1-2 minutes

### **Option 2: Discord Faucet**
1. Join SEI Discord: **https://discord.gg/sei**
2. Go to `#testnet-faucet` channel
3. Type: `!faucet 0x742d35Cc6635C0532925a3b8D41c4e9E4532D3eE`

### **Option 3: Alternative Faucets**
- **https://faucet.atlantic-2.seinetwork.io/**
- **https://faucet.sei.io/**

## **Check Your Balance:**
```bash
# After getting tokens, check balance:
curl -X POST https://evm-rpc-testnet.sei-apis.com \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0x742d35Cc6635C0532925a3b8D41c4e9E4532D3eE","latest"],"id":1}'
```

## **Next Steps:**
1. Get testnet tokens
2. Update `.env` file with your private key
3. Deploy the factory contract
4. Update frontend with contract address