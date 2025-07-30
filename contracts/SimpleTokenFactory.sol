// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleToken is ERC20, Ownable {
    uint8 private _decimals;
    
    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_,
        uint256 totalSupply,
        address owner
    ) ERC20(name, symbol) {
        _decimals = decimals_;
        _mint(owner, totalSupply * 10**decimals_);
        _transferOwnership(owner);
    }
    
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
    
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}

contract SimpleTokenFactory {
    event TokenCreated(
        address indexed tokenAddress,
        address indexed owner,
        string name,
        string symbol,
        uint8 decimals,
        uint256 totalSupply
    );
    
    struct TokenInfo {
        address tokenAddress;
        address owner;
        string name;
        string symbol;
        uint8 decimals;
        uint256 totalSupply;
        uint256 createdAt;
    }
    
    mapping(address => TokenInfo[]) public userTokens;
    TokenInfo[] public allTokens;
    
    uint256 public creationFee = 0.01 ether; // Small fee to prevent spam
    address public feeRecipient;
    
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
        
        // Create new token
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