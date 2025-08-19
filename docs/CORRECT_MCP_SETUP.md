# 🎯 **DEFINITIVE Cursor MCP Setup Guide**

## 📍 **Correct Configuration Location**

Based on official documentation, the MCP configuration file must be located at:

### **File Path:**
- **macOS/Linux**: `~/.cursor/mcp.json`
- **Windows**: `%USERPROFILE%\.cursor\mcp.json`

### **Important Notes:**
- The file MUST be named `mcp.json` (not `cursor.json`)
- It MUST be in the `.cursor` directory in your home directory
- Create the `.cursor` directory if it doesn't exist

---

## 🛠️ **Step-by-Step Setup**

### **Step 1: Create the Configuration Directory**

```bash
# macOS/Linux
mkdir -p ~/.cursor

# Windows (PowerShell)
mkdir "$env:USERPROFILE\.cursor"
```

### **Step 2: Create the MCP Configuration File**

Create `~/.cursor/mcp.json` with this exact content:

```json
{
  "mcpServers": {
    "sei-mcp-server": {
      "command": "npx",
      "args": ["-y", "@sei-js/mcp-server"],
      "env": {
        "PRIVATE_KEY": "<your-private-key>"
      }
    }
  }
}
```

### **Step 3: Restart Cursor**

1. **Close Cursor completely** (make sure it's fully quit)
2. **Reopen Cursor**
3. **Open your project**
4. **Look for MCP notification** - Cursor should show "MCP Server Connected"

---

## ✅ **Verification Steps**

### **Check if MCP is Working:**

1. **Look for MCP indicators** in Cursor's interface
2. **Test with AI queries:**
   - "What's my wallet address?"
   - "Check my SEI balance"
   - "Analyze token 0x3894085ef7ff0f0aedf52e2a2704928d1ec074f1"

### **Success Indicators:**
- ✅ Real wallet addresses (not mock data)
- ✅ Actual balance amounts from blockchain
- ✅ Detailed token analysis with contract verification
- ✅ Real transaction hashes and timestamps

### **Failure Indicators:**
- ❌ "I can't access real data yet"
- ❌ Mock responses with placeholder data
- ❌ Generic analysis without real verification

---

## 🚨 **Troubleshooting**

### **Issue 1: MCP Not Detected**
**Solutions:**
1. Verify file path: `~/.cursor/mcp.json`
2. Check JSON syntax (use JSON validator)
3. Ensure Cursor version supports MCP (0.47.8+)
4. Restart Cursor completely

### **Issue 2: Permission Errors**
**Solutions:**
```bash
# Fix permissions (macOS/Linux)
chmod 755 ~/.cursor
chmod 644 ~/.cursor/mcp.json
```

### **Issue 3: Package Not Found**
**Solutions:**
```bash
# Install the MCP server package globally
npm install -g @sei-js/mcp-server

# Or verify Node.js is installed
node --version
npm --version
```

---

## 🔧 **Alternative: Manual Commands**

If you prefer to create the file manually:

### **macOS/Linux:**
```bash
# Create directory
mkdir -p ~/.cursor

# Create configuration file
cat > ~/.cursor/mcp.json << 'EOF'
{
  "mcpServers": {
    "sei-mcp-server": {
      "command": "npx",
      "args": ["-y", "@sei-js/mcp-server"],
      "env": {
        "PRIVATE_KEY": "<your-private-key>"
      }
    }
  }
}
EOF

# Verify file was created
cat ~/.cursor/mcp.json
```

### **Windows (PowerShell):**
```powershell
# Create directory
mkdir "$env:USERPROFILE\.cursor" -Force

# Create configuration file
@'
{
  "mcpServers": {
    "sei-mcp-server": {
      "command": "npx",
      "args": ["-y", "@sei-js/mcp-server"],
      "env": {
        "PRIVATE_KEY": "<your-private-key>"
      }
    }
  }
}
'@ | Out-File -FilePath "$env:USERPROFILE\.cursor\mcp.json" -Encoding UTF8

# Verify file was created
Get-Content "$env:USERPROFILE\.cursor\mcp.json"
```

---

## 🎯 **What Happens Next**

Once configured correctly:

1. **Cursor detects MCP configuration** automatically
2. **Starts the Sei MCP server** in the background
3. **AI assistant gains real blockchain capabilities**
4. **You can test with real blockchain queries**

### **Expected Transformation:**
```
Before: "I can't access real blockchain data yet..."

After: "Your wallet address is 0x966CBf1baa5C08e4458f08A4CF1ECbb6Ae50894e
       You have 104.567 SEI ($87.23) in your wallet.
       Would you like me to analyze your recent transactions?"
```

---

## 📋 **Multiple MCP Servers (Advanced)**

You can add multiple MCP servers to the same configuration:

```json
{
  "mcpServers": {
    "sei-mcp-server": {
      "command": "npx",
      "args": ["-y", "@sei-js/mcp-server"],
      "env": {
        "PRIVATE_KEY": "0x7c5e4b6198276efe786d05f2e3f3ef8f91409066a5de3f1ca58e630c3445c684"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/files"]
    },
    "browser-tools": {
      "command": "npx",
      "args": ["-y", "@agentdeskai/browser-tools", "--stdio"]
    }
  }
}
```

---

## 🚀 **Ready to Test!**

The configuration is now ready. Follow these steps:

1. **Create the file** using the commands above
2. **Restart Cursor completely**
3. **Open your project**
4. **Test MCP functionality** with the verification steps

**This is the official, correct way to configure MCP in Cursor! 🎉**