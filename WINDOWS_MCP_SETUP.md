# 🪟 **Windows MCP Setup Instructions**

## 🚀 **Quick Setup (Choose One Method)**

### **Method 1: Automated PowerShell Script (Recommended)**

1. **Open PowerShell as Administrator**
   - Press `Win + X` and select "Windows PowerShell (Admin)"

2. **Run the setup script**
   ```powershell
   # Navigate to your project
   cd path\to\your\seifun\project
   
   # Run the PowerShell setup script
   .\scripts\setup-mcp-windows.ps1
   ```

### **Method 2: Simple Batch File**

1. **Double-click the batch file**
   - Navigate to your project folder
   - Double-click `scripts\setup-mcp-simple.bat`

### **Method 3: Manual Commands**

1. **Open Command Prompt or PowerShell**

2. **Run these commands one by one:**
   ```cmd
   REM Create the .cursor directory
   mkdir "%USERPROFILE%\.cursor"
   
   REM Create the MCP configuration file
   echo {> "%USERPROFILE%\.cursor\mcp.json"
   echo   "mcpServers": {>> "%USERPROFILE%\.cursor\mcp.json"
   echo     "sei-mcp-server": {>> "%USERPROFILE%\.cursor\mcp.json"
   echo       "command": "npx",>> "%USERPROFILE%\.cursor\mcp.json"
   echo       "args": ["-y", "@sei-js/mcp-server"],>> "%USERPROFILE%\.cursor\mcp.json"
   echo       "env": {>> "%USERPROFILE%\.cursor\mcp.json"
   echo         "PRIVATE_KEY": "0x7c5e4b6198276efe786d05f2e3f3ef8f91409066a5de3f1ca58e630c3445c684">> "%USERPROFILE%\.cursor\mcp.json"
   echo       }>> "%USERPROFILE%\.cursor\mcp.json"
   echo     }>> "%USERPROFILE%\.cursor\mcp.json"
   echo   }>> "%USERPROFILE%\.cursor\mcp.json"
   echo }>> "%USERPROFILE%\.cursor\mcp.json"
   ```

---

## ✅ **After Setup**

### **Step 1: Restart Cursor**
1. **Close Cursor completely** (make sure it's fully quit)
2. **Reopen Cursor**
3. **Open your Seifun project**

### **Step 2: Test MCP Functionality**
Ask the AI assistant these questions:

1. **"What's my wallet address?"**
   - ✅ **Success**: Shows `0x966CBf1baa5C08e4458f08A4CF1ECbb6Ae50894e`
   - ❌ **Failed**: Says "I can't access real data"

2. **"Check my SEI balance"**
   - ✅ **Success**: Shows real balance from blockchain
   - ❌ **Failed**: Shows mock data or error

3. **"Analyze token 0x3894085ef7ff0f0aedf52e2a2704928d1ec074f1"**
   - ✅ **Success**: Real contract verification and security analysis
   - ❌ **Failed**: Generic mock analysis

---

## 🔍 **Configuration Details**

### **File Location:**
- **Path**: `%USERPROFILE%\.cursor\mcp.json`
- **Example**: `C:\Users\YourName\.cursor\mcp.json`

### **Configuration Content:**
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

### **Test Wallet Details:**
- **Address**: `0x966CBf1baa5C08e4458f08A4CF1ECbb6Ae50894e`
- **Network**: Sei Testnet
- **Balance**: ~104 SEI (for testing)

---

## 🚨 **Troubleshooting**

### **Issue 1: MCP Not Detected**
**Solutions:**
1. Check file exists: `%USERPROFILE%\.cursor\mcp.json`
2. Verify JSON syntax is correct
3. Make sure Cursor version is 0.47.8+
4. Restart Cursor completely

### **Issue 2: Node.js Required**
**If you get Node.js errors:**
1. Download Node.js from https://nodejs.org/
2. Install the LTS version
3. Restart your computer
4. Retry the setup

### **Issue 3: Permission Issues**
**If you get permission errors:**
1. Run PowerShell as Administrator
2. Or manually create the folder and file

### **Issue 4: File Path Issues**
**Check these paths exist:**
- Directory: `%USERPROFILE%\.cursor\`
- File: `%USERPROFILE%\.cursor\mcp.json`

---

## 🎯 **Expected Results**

### **Before MCP (Current):**
```
You: "What's my wallet address?"
AI: "I can't access real blockchain data yet..."
```

### **After MCP (Expected):**
```
You: "What's my wallet address?"
AI: "Your wallet address is 0x966CBf1baa5C08e4458f08A4CF1ECbb6Ae50894e
     You have 104.567 SEI ($87.23) in your wallet.
     Would you like me to analyze your recent transactions?"
```

---

## 📞 **Support**

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify all file paths are correct
3. Make sure Node.js is installed
4. Ensure Cursor is the latest version

**Once MCP is working, Seilor 0 will become a truly intelligent AI trading agent! 🚀**