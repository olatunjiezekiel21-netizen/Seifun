// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleToken is ERC20, Ownable {
    uint8 private _decimals;
    string private _tokenURI;
    
    // Events for better tracking
    event TokensBurned(address indexed burner, uint256 amount);
    event MetadataUpdated(string newTokenURI);
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        uint8 tokenDecimals,
        address owner,
        string memory tokenURI
    ) ERC20(name, symbol) Ownable(owner) {
        _decimals = tokenDecimals;
        _tokenURI = tokenURI;
        _mint(owner, totalSupply * 10**tokenDecimals);
    }
    
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    function tokenURI() public view returns (string memory) {
        return _tokenURI;
    }
    
    // Update metadata (only owner)
    function updateTokenURI(string memory newTokenURI) external onlyOwner {
        _tokenURI = newTokenURI;
        emit MetadataUpdated(newTokenURI);
    }
    
    // REAL BURN FUNCTIONALITY - Anyone can burn their own tokens
    function burn(uint256 amount) external returns (bool) {
        require(amount > 0, "Burn amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance to burn");
        
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount);
        return true;
    }
    
    // BURN FROM - Allow approved addresses to burn tokens (for advanced use cases)
    function burnFrom(address from, uint256 amount) external returns (bool) {
        require(amount > 0, "Burn amount must be greater than 0");
        
        uint256 currentAllowance = allowance(from, msg.sender);
        require(currentAllowance >= amount, "Burn amount exceeds allowance");
        
        _approve(from, msg.sender, currentAllowance - amount);
        _burn(from, amount);
        emit TokensBurned(from, amount);
        return true;
    }
    
    // Get burn history (view function)
    function getBurnInfo() external view returns (uint256 totalBurned) {
        // Calculate total burned as initial supply minus current supply
        // Note: This assumes no additional minting after deployment
        return (10**decimals()) * 1000000000 - totalSupply(); // Assuming 1B initial supply
    }
    
    // Owner can mint additional tokens if needed (optional - can be removed for fixed supply)
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}

contract SimpleTokenFactory {
    event TokenCreated(
        address indexed tokenAddress,
        string name,
        string symbol,
        uint256 totalSupply,
        address indexed creator,
        string tokenURI
    );
    
    // Keep track of all created tokens
    address[] public allTokens;
    mapping(address => address[]) public userTokens;
    mapping(address => bool) public isTokenFromFactory;
    
    // Factory fee (optional)
    uint256 public creationFee = 0.001 ether; // Small fee for deployment
    address public feeRecipient;
    
    constructor() {
        feeRecipient = msg.sender;
    }
    
    function createToken(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        uint8 decimals,
        string memory tokenURI
    ) external payable returns (address) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(symbol).length > 0, "Symbol cannot be empty");
        require(totalSupply > 0, "Total supply must be greater than 0");
        require(msg.value >= creationFee, "Insufficient fee");
        
        // Deploy new token contract
        SimpleToken newToken = new SimpleToken(
            name,
            symbol,
            totalSupply,
            decimals,
            msg.sender, // Token creator becomes owner
            tokenURI
        );
        
        address tokenAddress = address(newToken);
        
        // Track the token
        allTokens.push(tokenAddress);
        userTokens[msg.sender].push(tokenAddress);
        isTokenFromFactory[tokenAddress] = true;
        
        // Send fee to recipient
        if (msg.value > 0) {
            payable(feeRecipient).transfer(msg.value);
        }
        
        emit TokenCreated(
            tokenAddress,
            name,
            symbol,
            totalSupply,
            msg.sender,
            tokenURI
        );
        
        return tokenAddress;
    }
    
    function getTokenCount() external view returns (uint256) {
        return allTokens.length;
    }
    
    function getUserTokens(address user) external view returns (address[] memory) {
        return userTokens[user];
    }
    
    function getUserTokenCount(address user) external view returns (uint256) {
        return userTokens[user].length;
    }
    
    // Admin functions
    function updateCreationFee(uint256 newFee) external {
        require(msg.sender == feeRecipient, "Only fee recipient can update fee");
        creationFee = newFee;
    }
    
    function updateFeeRecipient(address newRecipient) external {
        require(msg.sender == feeRecipient, "Only fee recipient can update recipient");
        feeRecipient = newRecipient;
    }
    
    // Withdraw any stuck ETH
    function withdraw() external {
        require(msg.sender == feeRecipient, "Only fee recipient can withdraw");
        payable(feeRecipient).transfer(address(this).balance);
    }
}