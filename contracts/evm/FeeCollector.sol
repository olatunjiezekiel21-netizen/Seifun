// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title FeeCollector
 * @dev Collects and distributes fees from Seifun trading operations
 * @notice Optimized for Sei EVM with sub-second execution requirements
 */
contract FeeCollector is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // Events
    event FeeCollected(address indexed token, uint256 amount, address indexed from);
    event FeeDistributed(address indexed token, uint256 amount, address indexed to);
    event FeeRateUpdated(address indexed token, uint256 newRate);
    event TreasuryUpdated(address indexed newTreasury);

    // Fee structure
    struct FeeInfo {
        uint256 rate; // Basis points (100 = 1%)
        uint256 collected;
        bool isActive;
    }

    // State variables
    mapping(address => FeeInfo) public feeRates;
    address public treasury;
    uint256 public constant MAX_FEE_RATE = 1000; // 10% max
    uint256 public constant BASIS_POINTS = 10000;

    // Supported tokens
    address[] public supportedTokens;
    mapping(address => bool) public isSupportedToken;

    // Performance tracking
    uint256 public totalFeesCollected;
    uint256 public totalFeesDistributed;
    uint256 public lastDistributionTime;

    constructor(address _treasury) {
        require(_treasury != address(0), "Invalid treasury address");
        treasury = _treasury;
        
        // Initialize with SEI token (assuming it's the native token)
        // In Sei EVM, we'll need to determine the actual SEI token address
        _addSupportedToken(address(0), 25); // 0.25% default fee for native SEI
    }

    /**
     * @dev Collect fees from trading operations
     * @param token Token address (address(0) for native SEI)
     * @param amount Amount of fees to collect
     * @param from Address paying the fees
     */
    function collectFees(
        address token,
        uint256 amount,
        address from
    ) external payable nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(isSupportedToken[token], "Token not supported");

        FeeInfo storage feeInfo = feeRates[token];
        require(feeInfo.isActive, "Fee collection not active");

        uint256 feeAmount = (amount * feeInfo.rate) / BASIS_POINTS;
        require(feeAmount > 0, "Fee amount too small");

        if (token == address(0)) {
            // Native SEI
            require(msg.value >= feeAmount, "Insufficient native SEI sent");
            // Native SEI is automatically held in contract
        } else {
            // ERC20 token
            IERC20(token).safeTransferFrom(from, address(this), feeAmount);
        }

        feeInfo.collected += feeAmount;
        totalFeesCollected += feeAmount;

        emit FeeCollected(token, feeAmount, from);
    }

    /**
     * @dev Distribute collected fees to treasury
     * @param token Token to distribute
     * @param amount Amount to distribute
     */
    function distributeFees(
        address token,
        uint256 amount
    ) external onlyOwner nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(treasury != address(0), "Treasury not set");

        FeeInfo storage feeInfo = feeRates[token];
        require(feeInfo.collected >= amount, "Insufficient collected fees");

        feeInfo.collected -= amount;
        totalFeesDistributed += amount;
        lastDistributionTime = block.timestamp;

        if (token == address(0)) {
            // Native SEI
            (bool success, ) = treasury.call{value: amount}("");
            require(success, "Native SEI transfer failed");
        } else {
            // ERC20 token
            IERC20(token).safeTransfer(treasury, amount);
        }

        emit FeeDistributed(token, amount, treasury);
    }

    /**
     * @dev Add a new supported token
     * @param token Token address
     * @param rate Fee rate in basis points
     */
    function addSupportedToken(address token, uint256 rate) external onlyOwner {
        require(rate <= MAX_FEE_RATE, "Fee rate too high");
        _addSupportedToken(token, rate);
    }

    /**
     * @dev Update fee rate for a token
     * @param token Token address
     * @param newRate New fee rate in basis points
     */
    function updateFeeRate(address token, uint256 newRate) external onlyOwner {
        require(isSupportedToken[token], "Token not supported");
        require(newRate <= MAX_FEE_RATE, "Fee rate too high");

        feeRates[token].rate = newRate;
        emit FeeRateUpdated(token, newRate);
    }

    /**
     * @dev Update treasury address
     * @param newTreasury New treasury address
     */
    function updateTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Invalid treasury address");
        treasury = newTreasury;
        emit TreasuryUpdated(newTreasury);
    }

    /**
     * @dev Toggle fee collection for a token
     * @param token Token address
     * @param isActive Whether fee collection is active
     */
    function toggleFeeCollection(address token, bool isActive) external onlyOwner {
        require(isSupportedToken[token], "Token not supported");
        feeRates[token].isActive = isActive;
    }

    /**
     * @dev Get fee information for a token
     * @param token Token address
     * @return rate Fee rate in basis points
     * @return collected Total fees collected
     * @return isActive Whether fee collection is active
     */
    function getFeeInfo(address token) external view returns (
        uint256 rate,
        uint256 collected,
        bool isActive
    ) {
        FeeInfo memory feeInfo = feeRates[token];
        return (feeInfo.rate, feeInfo.collected, feeInfo.isActive);
    }

    /**
     * @dev Get all supported tokens
     * @return Array of supported token addresses
     */
    function getSupportedTokens() external view returns (address[] memory) {
        return supportedTokens;
    }

    /**
     * @dev Calculate fee amount for a given trade amount
     * @param token Token address
     * @param amount Trade amount
     * @return Fee amount
     */
    function calculateFee(address token, uint256 amount) external view returns (uint256) {
        require(isSupportedToken[token], "Token not supported");
        FeeInfo memory feeInfo = feeRates[token];
        return (amount * feeInfo.rate) / BASIS_POINTS;
    }

    /**
     * @dev Emergency withdrawal function
     * @param token Token address
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");

        if (token == address(0)) {
            // Native SEI
            require(address(this).balance >= amount, "Insufficient balance");
            (bool success, ) = owner().call{value: amount}("");
            require(success, "Native SEI transfer failed");
        } else {
            // ERC20 token
            IERC20(token).safeTransfer(owner(), amount);
        }
    }

    /**
     * @dev Internal function to add supported token
     */
    function _addSupportedToken(address token, uint256 rate) internal {
        require(!isSupportedToken[token], "Token already supported");
        
        supportedTokens.push(token);
        isSupportedToken[token] = true;
        feeRates[token] = FeeInfo({
            rate: rate,
            collected: 0,
            isActive: true
        });
    }

    /**
     * @dev Receive function for native SEI
     */
    receive() external payable {
        // Allow contract to receive native SEI
    }

    /**
     * @dev Fallback function
     */
    fallback() external payable {
        // Allow contract to receive native SEI
    }
}