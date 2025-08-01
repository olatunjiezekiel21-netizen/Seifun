# 🚀 Deploy Factory Contract - Step by Step

## ✅ **Ready for Deployment**
- **Dev Wallet**: `0x966CBf1baa5C08e4458f08A4CF1ECbb6Ae50894e`  
- **Balance**: **108+ SEI** (plenty for deployment!)
- **Contract**: Compiled and ready
- **Network**: Sei Testnet configured

---

## 🎯 **Quick Deployment via Remix IDE**

### **Step 1: Open Remix**
1. Go to [https://remix.ethereum.org/](https://remix.ethereum.org/)
2. Create new file: `SimpleTokenFactory.sol`

### **Step 2: Copy Contract Code**
Copy the complete contract from `contracts/SimpleTokenFactory.sol`:

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

### **Step 3: Compile Contract**
1. Select **Solidity Compiler** tab
2. Choose compiler version: **0.8.19** or higher
3. Click **Compile SimpleTokenFactory.sol**
4. Ensure no errors

### **Step 4: Configure Sei Testnet**
1. Select **Deploy & Run** tab
2. Environment: **Injected Provider - MetaMask**
3. Add Sei Testnet to MetaMask:
   - **Network Name**: Sei Testnet
   - **RPC URL**: `https://evm-rpc-testnet.sei-apis.com`
   - **Chain ID**: `1328`
   - **Currency Symbol**: `SEI`
   - **Block Explorer**: `https://seitrace.com`

### **Step 5: Connect Your Wallet**
1. Connect MetaMask with your dev wallet
2. Switch to Sei Testnet
3. Verify balance shows **108+ SEI**

### **Step 6: Deploy**
1. Select **SimpleTokenFactory** contract
2. Click **Deploy** (no constructor arguments needed)
3. Confirm transaction in MetaMask
4. Wait for deployment confirmation

### **Step 7: Verify Deployment**
1. Copy the deployed contract address
2. Call `creationFee()` - should return `2000000000000000000` (2 SEI)
3. Call `feeRecipient()` - should return your wallet address
4. Call `getTotalTokensCreated()` - should return `0`

---

## 🔧 **After Deployment**

### **Update Environment Variables**
Add to `.env.production`:
```env
VITE_FACTORY_CONTRACT_ADDRESS=YOUR_DEPLOYED_ADDRESS_HERE
VITE_DEV_WALLET_PRIVATE_KEY=your_private_key_here
```

### **Test Token Creation**
1. Build and deploy your app
2. Go to `/launchpad`
3. See testnet mode indicator
4. Create a test token
5. Verify on SeiTrace testnet

---

## 🎉 **Success!**

Your factory contract will be:
- ✅ **Deployed on Sei Testnet**
- ✅ **Ready for real token creation**
- ✅ **Integrated with your app**
- ✅ **Viewable on SeiTrace**

**Estimated deployment cost: ~0.1 SEI** (you have 108+ SEI, so plenty!)

---

## 🆘 **Need Help?**

If you encounter issues:
1. Ensure MetaMask is connected to Sei Testnet
2. Check you have sufficient SEI balance
3. Verify contract compilation has no errors
4. Try refreshing Remix if deployment fails

**Everything is ready - just follow these steps to deploy!** 🚀