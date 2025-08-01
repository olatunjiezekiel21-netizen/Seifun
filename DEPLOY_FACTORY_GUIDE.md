# 🚀 Deploy SimpleTokenFactory to Sei Testnet

## ✅ **Prerequisites Met**
- ✅ **Contract**: `SimpleTokenFactory.sol` - Compiled and ready
- ✅ **Dev Wallet**: `0x966CBf1baa5C08e4458f08A4CF1ECbb6Ae50894e` 
- ✅ **Balance**: **108+ SEI** (sufficient for deployment)
- ✅ **Network**: Sei Testnet configured
- ✅ **Deployment Cost**: ~0.1 SEI

---

## 🎯 **Quick Deploy (3 Minutes)**

### **Option 1: Remix IDE (Recommended)**

#### **Step 1: Open Remix**
👉 **Go to**: https://remix.ethereum.org/

#### **Step 2: Create Contract File**
1. Click **"Create New File"**
2. Name it: `SimpleTokenFactory.sol`
3. Copy and paste the complete contract code below:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleToken {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;
    address public owner;
    
    mapping(address => uint256) private balances;
    mapping(address => mapping(address => uint256)) private allowances;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _totalSupply,
        address _owner
    ) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        totalSupply = _totalSupply * 10**_decimals;
        owner = _owner;
        balances[_owner] = totalSupply;
        emit Transfer(address(0), _owner, totalSupply);
    }
    
    function balanceOf(address account) public view returns (uint256) {
        return balances[account];
    }
    
    function transfer(address to, uint256 amount) public returns (bool) {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        balances[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }
    
    function approve(address spender, uint256 amount) public returns (bool) {
        allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }
    
    function allowance(address owner_, address spender) public view returns (uint256) {
        return allowances[owner_][spender];
    }
    
    function transferFrom(address from, address to, uint256 amount) public returns (bool) {
        require(balances[from] >= amount, "Insufficient balance");
        require(allowances[from][msg.sender] >= amount, "Insufficient allowance");
        
        balances[from] -= amount;
        balances[to] += amount;
        allowances[from][msg.sender] -= amount;
        
        emit Transfer(from, to, amount);
        return true;
    }
}

contract SimpleTokenFactory {
    uint256 public creationFee = 2 ether; // 2 SEI
    address public feeRecipient;
    
    struct TokenInfo {
        address tokenAddress;
        address owner;
        string name;
        string symbol;
        uint8 decimals;
        uint256 totalSupply;
        uint256 createdAt;
    }
    
    TokenInfo[] public allTokens;
    mapping(address => TokenInfo[]) public userTokens;
    
    event TokenCreated(
        address indexed tokenAddress,
        address indexed owner,
        string name,
        string symbol,
        uint8 decimals,
        uint256 totalSupply
    );
    
    constructor() {
        feeRecipient = msg.sender;
    }
    
    function createToken(
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 totalSupply
    ) external payable returns (address) {
        require(msg.value >= creationFee, "Insufficient fee");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(symbol).length > 0, "Symbol cannot be empty");
        require(decimals <= 18, "Decimals cannot exceed 18");
        require(totalSupply > 0, "Total supply must be greater than 0");
        
        // Deploy new token
        SimpleToken newToken = new SimpleToken(
            name,
            symbol,
            decimals,
            totalSupply,
            msg.sender
        );
        address tokenAddress = address(newToken);
        
        // Store token info
        TokenInfo memory tokenInfo = TokenInfo({
            tokenAddress: tokenAddress,
            owner: msg.sender,
            name: name,
            symbol: symbol,
            decimals: decimals,
            totalSupply: totalSupply,
            createdAt: block.timestamp
        });
        
        userTokens[msg.sender].push(tokenInfo);
        allTokens.push(tokenInfo);
        
        // Transfer fee to recipient
        if (msg.value > 0) {
            payable(feeRecipient).transfer(msg.value);
        }
        
        emit TokenCreated(tokenAddress, msg.sender, name, symbol, decimals, totalSupply);
        
        return tokenAddress;
    }
    
    function getUserTokens(address user) external view returns (TokenInfo[] memory) {
        return userTokens[user];
    }
    
    function getAllTokens() external view returns (TokenInfo[] memory) {
        return allTokens;
    }
    
    function getTotalTokensCreated() external view returns (uint256) {
        return allTokens.length;
    }
    
    function updateCreationFee(uint256 newFee) external {
        require(msg.sender == feeRecipient, "Only fee recipient can update fee");
        creationFee = newFee;
    }
    
    function updateFeeRecipient(address newRecipient) external {
        require(msg.sender == feeRecipient, "Only current fee recipient can update");
        feeRecipient = newRecipient;
    }
}
```

#### **Step 3: Compile**
1. Go to **"Solidity Compiler"** tab (📄 icon)
2. Select compiler version: **0.8.19** or higher
3. Click **"Compile SimpleTokenFactory.sol"**
4. ✅ Should compile without errors

#### **Step 4: Configure Sei Testnet in MetaMask**
Add Sei Testnet to MetaMask:
- **Network Name**: `Sei Testnet`
- **RPC URL**: `https://evm-rpc-testnet.sei-apis.com`
- **Chain ID**: `1328`
- **Currency Symbol**: `SEI`
- **Block Explorer**: `https://seitrace.com`

#### **Step 5: Deploy**
1. Go to **"Deploy & Run Transactions"** tab (🚀 icon)
2. Environment: Select **"Injected Provider - MetaMask"**
3. Connect your wallet with address: `0x966CBf1baa5C08e4458f08A4CF1ECbb6Ae50894e`
4. Verify you're on **Sei Testnet** and see **108+ SEI** balance
5. Select **"SimpleTokenFactory"** contract
6. Click **"Deploy"** (no constructor arguments needed)
7. **Confirm transaction** in MetaMask

#### **Step 6: Verify Deployment**
After deployment:
1. **Copy the contract address**
2. Test these functions:
   - `creationFee()` → should return `2000000000000000000` (2 SEI)
   - `feeRecipient()` → should return your wallet address
   - `getTotalTokensCreated()` → should return `0`

---

## 📋 **After Deployment**

### **Step 1: Update Environment Variables**
Update `.env.production` with the new factory address:

```env
VITE_FACTORY_CONTRACT_ADDRESS=YOUR_NEW_FACTORY_ADDRESS_HERE
```

### **Step 2: Add Dev Wallet Private Key (for testnet)**
Add to `.env.production`:

```env
VITE_DEV_WALLET_PRIVATE_KEY=your_private_key_here
```

### **Step 3: Rebuild and Deploy**
```bash
npm run build
# Deploy to Netlify
```

---

## 🎉 **Success Indicators**

✅ **Contract deployed successfully**  
✅ **Functions return expected values**  
✅ **Environment variables updated**  
✅ **Application rebuilt and deployed**  
✅ **Token creation works on testnet**

---

## 🛠️ **Alternative: Hardhat Deployment**

If you have the private key, you can use Hardhat:

```bash
# Add private key to .env.local
echo "PRIVATE_KEY=your_private_key_here" > .env.local

# Deploy using Hardhat
npx hardhat run scripts/deploy-factory.js --network seiTestnet
```

---

## 🔗 **Useful Links**

- **Sei Testnet Faucet**: https://faucet.sei.io/
- **SeiTrace Explorer**: https://seitrace.com
- **Remix IDE**: https://remix.ethereum.org/
- **MetaMask**: https://metamask.io/

---

## 📞 **Need Help?**

If you encounter any issues:
1. Check your SEI balance (need at least 0.1 SEI)
2. Verify you're on Sei Testnet
3. Ensure contract compiles without errors
4. Try refreshing MetaMask connection

**Ready to deploy! Everything is prepared for a successful deployment.** 🚀