# 🛠️ Sei MCP Server Configuration Guide

## 🎯 **Overview**
This guide provides multiple methods to configure the Sei MCP Server with Cursor for real AI blockchain integration.

---

## 📋 **Method 1: Cursor JSON Configuration (Recommended)**

### **Step 1: Create Configuration Files**

We've created the configuration files in multiple locations to ensure Cursor finds them:

- ✅ `/workspace/.cursor/cursor.json` - Cursor project config
- ✅ `/workspace/cursor.json` - Project root config  
- ✅ `/workspace/mcp.json` - Original MCP config

### **Step 2: Restart Cursor**

1. **Close Cursor completely**
2. **Reopen Cursor** 
3. **Open your project** (`/workspace`)
4. **Look for MCP notification** - Cursor should show "MCP Server Connected" or similar

### **Step 3: Verify Configuration**

Check if MCP is working by:
- Looking for MCP-related notifications in Cursor
- Checking the Command Palette (`Cmd/Ctrl + Shift + P`) for MCP commands
- Observing if AI responses become more intelligent

---

## 📋 **Method 2: Manual Cursor Settings**

### **Step 1: Open Cursor Settings**
```
1. Press Cmd/Ctrl + , (comma)
2. Search for "MCP" or "Model Context Protocol"
3. Look for "MCP Servers" section
```

### **Step 2: Add MCP Server**
```json
Server Name: sei-mcp-server
Command: npx
Arguments: ["-y", "@sei-js/mcp-server"]
Environment Variables:
  - PRIVATE_KEY: 0x7c5e4b6198276efe786d05f2e3f3ef8f91409066a5de3f1ca58e630c3445c684
```

### **Step 3: Save and Restart**
- Save settings
- Restart Cursor
- Verify MCP connection

---

## 📋 **Method 3: Direct HTTP Integration (Alternative)**

If Cursor MCP integration doesn't work, use our direct HTTP method:

### **Step 1: Start MCP Server**
```bash
# Open a new terminal
cd /workspace

# Start MCP server in HTTP mode
PRIVATE_KEY=0x7c5e4b6198276efe786d05f2e3f3ef8f91409066a5de3f1ca58e630c3445c684 npx @sei-js/mcp-server --http --port 3001
```

### **Step 2: Verify Server**
```bash
# Check if server is running
curl http://localhost:3001/health
```

### **Step 3: Use Direct Integration**
The `DirectMCPService` will automatically connect to the HTTP server and provide all MCP functionality.

---

## 🔧 **Configuration Files Created**

### **1. .cursor/cursor.json**
```json
{
  "mcpServers": {
    "sei-mcp-server": {
      "command": "npx",
      "args": ["-y", "@sei-js/mcp-server"],
      "env": {
        "PRIVATE_KEY": "0x7c5e4b6198276efe786d05f2e3f3ef8f91409066a5de3f1ca58e630c3445c684"
      }
    }
  }
}
```

### **2. cursor.json (Project Root)**
```json
{
  "mcpServers": {
    "sei-mcp-server": {
      "command": "npx",
      "args": ["-y", "@sei-js/mcp-server"],
      "env": {
        "PRIVATE_KEY": "0x7c5e4b6198276efe786d05f2e3f3ef8f91409066a5de3f1ca58e630c3445c684"
      }
    }
  }
}
```

### **3. DirectMCPService.ts**
Alternative HTTP-based integration that works independently of Cursor MCP.

---

## ✅ **Testing MCP Integration**

### **Test Commands (Once Configured)**

Ask the AI assistant these questions to test MCP functionality:

1. **Wallet Address:**
   ```
   "What's my wallet address?"
   Expected: Real address from private key
   ```

2. **Balance Check:**
   ```
   "Check my SEI balance"
   Expected: Live balance from Sei blockchain
   ```

3. **Token Analysis:**
   ```
   "Analyze token 0x3894085ef7ff0f0aedf52e2a2704928d1ec074f1"
   Expected: Real contract verification and security analysis
   ```

4. **Transaction History:**
   ```
   "Show my recent transactions"
   Expected: Actual transaction data from blockchain
   ```

### **Success Indicators**

✅ **MCP Working:**
- AI gives specific wallet addresses
- Real balance amounts (not mock data)
- Detailed token analysis with real contract info
- Actual transaction hashes and timestamps

❌ **MCP Not Working:**
- AI says "I can't access real data yet"
- Mock responses with placeholder data
- Generic token analysis without real verification

---

## 🚨 **Troubleshooting**

### **Issue 1: Cursor Not Recognizing MCP**
**Solution:**
1. Ensure configuration files are in correct locations
2. Restart Cursor completely
3. Check Cursor version (MCP requires newer versions)
4. Try Method 3 (Direct HTTP) as fallback

### **Issue 2: Private Key Errors**
**Solution:**
1. Verify private key format (starts with 0x)
2. Ensure sufficient SEI balance for testing
3. Check network connectivity to Sei testnet

### **Issue 3: Package Installation Issues**
**Solution:**
```bash
# Reinstall MCP server package
npm uninstall @sei-js/mcp-server
npm install @sei-js/mcp-server

# Or use global installation
npm install -g @sei-js/mcp-server
```

### **Issue 4: Server Connection Failed**
**Solution:**
1. Check if Node.js 18+ is installed
2. Verify network access to Sei RPC endpoints
3. Try running MCP server manually first
4. Use Direct HTTP integration as backup

---

## 🎯 **Next Steps After Configuration**

1. **Verify MCP is working** using test commands
2. **Complete AI integration** - Replace mock responses with real MCP data
3. **Test advanced features** - Token analysis, trading, portfolio management
4. **Deploy enhanced Seilor 0** - Fully intelligent AI trading agent

---

## 🔗 **Useful Commands**

### **Check MCP Server Status**
```bash
# Test if MCP server can be started
npx @sei-js/mcp-server --help

# Start in HTTP mode for testing
PRIVATE_KEY=0x7c5e4b6198276efe786d05f2e3f3ef8f91409066a5de3f1ca58e630c3445c684 npx @sei-js/mcp-server --http
```

### **Verify Private Key**
```bash
# Check wallet address from private key
node -e "
const { ethers } = require('ethers');
const wallet = new ethers.Wallet('0x7c5e4b6198276efe786d05f2e3f3ef8f91409066a5de3f1ca58e630c3445c684');
console.log('Wallet Address:', wallet.address);
"
```

---

## 📞 **Support**

If you encounter issues:
1. Check the console for error messages
2. Verify all configuration files are in place
3. Try the Direct HTTP method as fallback
4. Ensure your Cursor version supports MCP

**The goal is to get real blockchain data flowing to our AI agent! 🚀**