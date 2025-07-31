// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./TokenSafeChecker.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenCheckerFactory is Ownable {
    // Mapping from token address to checker address
    mapping(address => address) public tokenToChecker;
    
    // Array of all deployed checkers
    address[] public deployedCheckers;
    
    // Events
    event CheckerDeployed(
        address indexed tokenAddress,
        address indexed checkerAddress,
        uint256 timestamp
    );
    
    event CheckerRemoved(
        address indexed tokenAddress,
        address indexed checkerAddress,
        uint256 timestamp
    );

    constructor() Ownable(msg.sender) {}

    // Internal deployment logic
    function _deployChecker(address tokenAddress) internal returns (address checkerAddress) {
        require(tokenAddress != address(0), "Token address cannot be zero");
        require(tokenToChecker[tokenAddress] == address(0), "Checker already exists for this token");
        TokenSafeChecker checker = new TokenSafeChecker(tokenAddress);
        checkerAddress = address(checker);
        tokenToChecker[tokenAddress] = checkerAddress;
        deployedCheckers.push(checkerAddress);
        emit CheckerDeployed(tokenAddress, checkerAddress, block.timestamp);
        return checkerAddress;
    }
    
    /**
     * @notice Deploy a new TokenSafeChecker for a specific token
     * @param tokenAddress The address of the token to monitor
     * @return checkerAddress The address of the deployed checker
     */
    function deployChecker(address tokenAddress) external returns (address checkerAddress) {
        return _deployChecker(tokenAddress);
    }
    
    /**
     * @notice Get the checker address for a specific token
     * @param tokenAddress The address of the token
     * @return The address of the checker, or zero address if not found
     */
    function getCheckerAddress(address tokenAddress) external view returns (address) {
        return tokenToChecker[tokenAddress];
    }
    
    /**
     * @notice Check if a token has a deployed checker
     * @param tokenAddress The address of the token
     * @return True if checker exists, false otherwise
     */
    function hasChecker(address tokenAddress) external view returns (bool) {
        return tokenToChecker[tokenAddress] != address(0);
    }
    
    /**
     * @notice Get all deployed checkers
     * @return Array of all checker addresses
     */
    function getAllCheckers() external view returns (address[] memory) {
        return deployedCheckers;
    }
    
    /**
     * @notice Get the total number of deployed checkers
     * @return The count of deployed checkers
     */
    function getCheckerCount() external view returns (uint256) {
        return deployedCheckers.length;
    }
    
    /**
     * @notice Remove a checker (admin only)
     * @param tokenAddress The address of the token whose checker to remove
     */
    function removeChecker(address tokenAddress) external onlyOwner {
        address checkerAddress = tokenToChecker[tokenAddress];
        require(checkerAddress != address(0), "Checker does not exist");
        
        // Remove from mapping
        delete tokenToChecker[tokenAddress];
        
        // Remove from array
        for (uint256 i = 0; i < deployedCheckers.length; i++) {
            if (deployedCheckers[i] == checkerAddress) {
                deployedCheckers[i] = deployedCheckers[deployedCheckers.length - 1];
                deployedCheckers.pop();
                break;
            }
        }
        
        emit CheckerRemoved(tokenAddress, checkerAddress, block.timestamp);
    }
    
    /**
     * @notice Batch deploy checkers for multiple tokens
     * @param tokenAddresses Array of token addresses
     * @return Array of deployed checker addresses
     */
    function batchDeployCheckers(address[] calldata tokenAddresses) external returns (address[] memory) {
        address[] memory deployedAddresses = new address[](tokenAddresses.length);
        
        for (uint256 i = 0; i < tokenAddresses.length; i++) {
            if (tokenToChecker[tokenAddresses[i]] == address(0)) {
                deployedAddresses[i] = _deployChecker(tokenAddresses[i]);
            } else {
                deployedAddresses[i] = tokenToChecker[tokenAddresses[i]];
            }
        }
        
        return deployedAddresses;
    }
    
    /**
     * @notice Get checker info for multiple tokens
     * @param tokenAddresses Array of token addresses
     * @return Array of checker addresses (zero address if not found)
     */
    function getMultipleCheckerAddresses(address[] calldata tokenAddresses) external view returns (address[] memory) {
        address[] memory checkerAddresses = new address[](tokenAddresses.length);
        
        for (uint256 i = 0; i < tokenAddresses.length; i++) {
            checkerAddresses[i] = tokenToChecker[tokenAddresses[i]];
        }
        
        return checkerAddresses;
    }
}
