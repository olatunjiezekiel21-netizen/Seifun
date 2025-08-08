@echo off
echo 🚀 Setting up Sei MCP Server for Cursor on Windows...

REM Create the .cursor directory
if not exist "%USERPROFILE%\.cursor" (
    mkdir "%USERPROFILE%\.cursor"
    echo ✅ Created .cursor directory
) else (
    echo ✅ .cursor directory already exists
)

REM Create the MCP configuration file
echo 📄 Creating MCP configuration...

(
echo {
echo   "mcpServers": {
echo     "sei-mcp-server": {
echo       "command": "npx",
echo       "args": ["-y", "@sei-js/mcp-server"],
echo       "env": {
echo         "PRIVATE_KEY": "0x7c5e4b6198276efe786d05f2e3f3ef8f91409066a5de3f1ca58e630c3445c684"
echo       }
echo     }
echo   }
echo }
) > "%USERPROFILE%\.cursor\mcp.json"

echo ✅ Created mcp.json configuration file

echo.
echo 📋 Configuration Summary:
echo    📁 Config Directory: %USERPROFILE%\.cursor
echo    📄 Config File: %USERPROFILE%\.cursor\mcp.json
echo    🔑 Wallet Address: 0x966CBf1baa5C08e4458f08A4CF1ECbb6Ae50894e
echo    💰 Network: Sei Testnet

echo.
echo 🎯 Next Steps:
echo    1. 🔄 Close Cursor completely
echo    2. 🚀 Reopen Cursor  
echo    3. 📂 Open your Seifun project
echo    4. 🧪 Test with: "What's my wallet address?"

echo.
echo ✅ MCP Setup Complete! 🎉

pause