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