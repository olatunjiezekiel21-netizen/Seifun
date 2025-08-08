# 🪟 Windows MCP Setup Script for Cursor
# This script sets up the Sei MCP Server configuration for Cursor IDE on Windows

Write-Host "🚀 Setting up Sei MCP Server for Cursor on Windows..." -ForegroundColor Green

# Step 1: Create the .cursor directory in user's home folder
$cursorDir = "$env:USERPROFILE\.cursor"
Write-Host "📁 Creating directory: $cursorDir" -ForegroundColor Yellow

try {
    if (!(Test-Path $cursorDir)) {
        New-Item -ItemType Directory -Path $cursorDir -Force | Out-Null
        Write-Host "✅ Created .cursor directory" -ForegroundColor Green
    } else {
        Write-Host "✅ .cursor directory already exists" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Failed to create directory: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Create the MCP configuration file
$mcpConfigPath = "$cursorDir\mcp.json"
Write-Host "📄 Creating MCP configuration: $mcpConfigPath" -ForegroundColor Yellow

$mcpConfig = @'
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
'@

try {
    $mcpConfig | Out-File -FilePath $mcpConfigPath -Encoding UTF8 -Force
    Write-Host "✅ Created mcp.json configuration file" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to create mcp.json: $_" -ForegroundColor Red
    exit 1
}

# Step 3: Verify the configuration file
Write-Host "🔍 Verifying configuration file..." -ForegroundColor Yellow

try {
    $configContent = Get-Content $mcpConfigPath -Raw
    $configJson = $configContent | ConvertFrom-Json
    
    if ($configJson.mcpServers."sei-mcp-server") {
        Write-Host "✅ Configuration file is valid JSON" -ForegroundColor Green
    } else {
        Write-Host "❌ Configuration file is missing sei-mcp-server" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Configuration file is invalid JSON: $_" -ForegroundColor Red
    exit 1
}

# Step 4: Check Node.js installation
Write-Host "🔍 Checking Node.js installation..." -ForegroundColor Yellow

try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "✅ Node.js is installed: $nodeVersion" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Node.js not found. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
        Write-Host "   MCP server requires Node.js to run." -ForegroundColor Red
    }
} catch {
    Write-Host "⚠️  Node.js not found. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
}

# Step 5: Display configuration details
Write-Host "`n📋 Configuration Summary:" -ForegroundColor Cyan
Write-Host "   📁 Config Directory: $cursorDir" -ForegroundColor White
Write-Host "   📄 Config File: $mcpConfigPath" -ForegroundColor White
Write-Host "   🔑 Wallet Address: 0x966CBf1baa5C08e4458f08A4CF1ECbb6Ae50894e" -ForegroundColor White
Write-Host "   💰 Network: Sei Testnet" -ForegroundColor White

# Step 6: Display next steps
Write-Host "`n🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. 🔄 Close Cursor completely (make sure it's fully quit)" -ForegroundColor Yellow
Write-Host "   2. 🚀 Reopen Cursor" -ForegroundColor Yellow
Write-Host "   3. 📂 Open your Seifun project" -ForegroundColor Yellow
Write-Host "   4. 🧪 Test MCP functionality with these questions:" -ForegroundColor Yellow
Write-Host "      • 'What's my wallet address?'" -ForegroundColor White
Write-Host "      • 'Check my SEI balance'" -ForegroundColor White
Write-Host "      • 'Analyze token 0x3894085ef7ff0f0aedf52e2a2704928d1ec074f1'" -ForegroundColor White

Write-Host "`n✅ MCP Setup Complete! Cursor should now have real blockchain capabilities! 🎉" -ForegroundColor Green

# Step 7: Display the configuration file content for verification
Write-Host "`n📄 Configuration File Content:" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray
Get-Content $mcpConfigPath
Write-Host "----------------------------------------" -ForegroundColor Gray

Write-Host "`n🔍 If MCP doesn't work after restarting Cursor:" -ForegroundColor Yellow
Write-Host "   • Check that Cursor version is 0.47.8 or newer" -ForegroundColor White
Write-Host "   • Verify the config file exists at: $mcpConfigPath" -ForegroundColor White
Write-Host "   • Make sure Node.js is installed and accessible" -ForegroundColor White
Write-Host "   • Look for MCP-related notifications in Cursor" -ForegroundColor White