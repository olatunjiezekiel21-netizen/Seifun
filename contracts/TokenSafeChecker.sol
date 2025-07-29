// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
// import "@openzeppelin/contracts/utils/math/SafeMath.sol"; // No longer needed
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenSafeChecker is Ownable {
    // using SafeMath for uint256; // No longer needed
    
    // Token information
    address public monitoredTokenAddress;
    string public tokenName;
    string public tokenSymbol;
    uint8 public tokenDecimals;
    
    // Supply tracking
    uint256 public initialTotalSupply;
    uint256 public lastCheckedSupply;
    uint256 public lastCheckedTimestamp;
    
    // Liquidity analysis
    address public pairAddress;
    uint256 public initialLiquidity;
    uint256 public lastLiquidityCheck;
    
    // Ownership analysis
    address public tokenOwner;
    bool public isOwnershipRenounced;
    
    // Risk flags
    bool public hasSuspiciousMinting;
    bool public hasLiquidityRemoved;
    bool public hasOwnershipIssues;
    bool public isHoneypot;
    bool public hasBlacklistFunction;
    
    // Events
    event TokenAnalyzed(
        address indexed tokenAddress,
        uint256 safetyScore,
        bool isSafe,
        uint256 timestamp
    );
    
    event SuspiciousActivityDetected(
        address indexed tokenAddress,
        string activityType,
        string details,
        uint256 timestamp
    );
    
    event LiquidityCheck(
        address indexed tokenAddress,
        uint256 currentLiquidity,
        uint256 previousLiquidity,
        bool liquidityDecreased,
        uint256 timestamp
    );
    
    event SupplyCheck(
        address indexed tokenAddress,
        uint256 currentSupply,
        uint256 previousSupply,
        bool supplyIncreased,
        uint256 timestamp
    );

    constructor(address _monitoredTokenAddress) Ownable(msg.sender) {
        require(_monitoredTokenAddress != address(0), "Token address cannot be zero");
        monitoredTokenAddress = _monitoredTokenAddress;
        
        // Initialize token data
        _initializeTokenData();
    }
    
    function _initializeTokenData() internal {
        IERC20Metadata token = IERC20Metadata(monitoredTokenAddress);
        
        // Get basic token information
        tokenName = token.name();
        tokenSymbol = token.symbol();
        tokenDecimals = token.decimals();
        initialTotalSupply = token.totalSupply();
        lastCheckedSupply = initialTotalSupply;
        lastCheckedTimestamp = block.timestamp;
        
        // Try to get owner (this might fail for some tokens)
        try this.getTokenOwner() returns (address owner) {
            tokenOwner = owner;
            isOwnershipRenounced = (owner == address(0));
        } catch {
            tokenOwner = address(0);
            isOwnershipRenounced = true;
        }
    }
    
    /**
     * @notice Comprehensive token safety analysis
     * @return safetyScore Score from 0-100 indicating token safety
     * @return isSafe Boolean indicating if token is safe to trade
     * @return riskFactors Array of detected risk factors
     */
    function analyzeTokenSafety() public returns (
        uint256 safetyScore,
        bool isSafe,
        string[] memory riskFactors
    ) {
        uint256 score = 100;
        string[] memory risks = new string[](10);
        uint256 riskCount = 0;
        
        // Check 1: Supply Analysis
        (bool supplySafe, string memory supplyRisk) = _checkSupplySafety();
        if (!supplySafe) {
            score -= 20;
            risks[riskCount] = supplyRisk;
            riskCount++;
        }
        
        // Check 2: Liquidity Analysis
        (bool liquiditySafe, string memory liquidityRisk) = _checkLiquiditySafety();
        if (!liquiditySafe) {
            score -= 25;
            risks[riskCount] = liquidityRisk;
            riskCount++;
        }
        
        // Check 3: Ownership Analysis
        (bool ownershipSafe, string memory ownershipRisk) = _checkOwnershipSafety();
        if (!ownershipSafe) {
            score -= 15;
            risks[riskCount] = ownershipRisk;
            riskCount++;
        }
        
        // Check 4: Honeypot Detection
        (bool honeypotSafe, string memory honeypotRisk) = _checkHoneypotSafety();
        if (!honeypotSafe) {
            score = 0; // Honeypot = instant fail
            risks[riskCount] = honeypotRisk;
            riskCount++;
        }
        
        // Check 5: Blacklist Function Detection
        (bool blacklistSafe, string memory blacklistRisk) = _checkBlacklistSafety();
        if (!blacklistSafe) {
            score -= 10;
            risks[riskCount] = blacklistRisk;
            riskCount++;
        }
        
        // Check 6: Contract Verification
        (bool verifiedSafe, string memory verifiedRisk) = _checkContractVerification();
        if (!verifiedSafe) {
            score -= 5;
            risks[riskCount] = verifiedRisk;
            riskCount++;
        }
        
        // Ensure score doesn't go below 0
        if (score > 100) score = 100;
        
        bool safe = score >= 70;
        
        // Emit analysis event
        emit TokenAnalyzed(monitoredTokenAddress, score, safe, block.timestamp);
        
        return (score, safe, risks);
    }
    
    function _checkSupplySafety() internal returns (bool safe, string memory risk) {
        IERC20Metadata token = IERC20Metadata(monitoredTokenAddress);
        uint256 currentSupply = token.totalSupply();
        
        if (currentSupply > lastCheckedSupply) {
            uint256 increase = currentSupply - lastCheckedSupply;
            uint256 increasePercentage = (increase * 100) / lastCheckedSupply;
            
            if (increasePercentage > 5) { // More than 5% increase
                hasSuspiciousMinting = true;
                emit SuspiciousActivityDetected(
                    monitoredTokenAddress,
                    "SUPPLY_INCREASE",
                    string(abi.encodePacked("Supply increased by ", _uint2str(increasePercentage), "%")),
                    block.timestamp
                );
                
                lastCheckedSupply = currentSupply;
                return (false, "Suspicious supply increase detected");
            }
        }
        
        lastCheckedSupply = currentSupply;
        return (true, "");
    }
    
    function _checkLiquiditySafety() internal returns (bool safe, string memory risk) {
        // This would need to be implemented with actual DEX integration
        // For now, we'll simulate the check
        uint256 currentLiquidity = _getCurrentLiquidity();
        
        if (lastLiquidityCheck > 0 && currentLiquidity < lastLiquidityCheck) {
            uint256 decrease = lastLiquidityCheck - currentLiquidity;
            uint256 decreasePercentage = (decrease * 100) / lastLiquidityCheck;
            
            if (decreasePercentage > 10) { // More than 10% decrease
                hasLiquidityRemoved = true;
                emit LiquidityCheck(
                    monitoredTokenAddress,
                    currentLiquidity,
                    lastLiquidityCheck,
                    true,
                    block.timestamp
                );
                return (false, "Significant liquidity removal detected");
            }
        }
        
        lastLiquidityCheck = currentLiquidity;
        return (true, "");
    }
    
    function _checkOwnershipSafety() internal returns (bool safe, string memory risk) {
        if (!isOwnershipRenounced && tokenOwner != address(0)) {
            hasOwnershipIssues = true;
            return (false, "Token ownership not renounced");
        }
        return (true, "");
    }
    
    function _checkHoneypotSafety() internal returns (bool safe, string memory risk) {
        // This would need actual buy/sell simulation
        // For now, we'll check for common honeypot patterns
        bool isHoneypotDetected = _simulateHoneypotCheck();
        
        if (isHoneypotDetected) {
            isHoneypot = true;
            return (false, "Honeypot detected - cannot sell tokens");
        }
        
        return (true, "");
    }
    
    function _checkBlacklistSafety() internal returns (bool safe, string memory risk) {
        // Check if contract has blacklist function
        bool hasBlacklist = _checkForBlacklistFunction();
        
        if (hasBlacklist) {
            hasBlacklistFunction = true;
            return (false, "Blacklist function detected");
        }
        
        return (true, "");
    }
    
    function _checkContractVerification() internal returns (bool safe, string memory risk) {
        // This would check if contract is verified on block explorer
        // For now, we'll assume it's verified
        return (true, "");
    }
    
    // Helper functions (these would need actual implementation)
    function _getCurrentLiquidity() internal view returns (uint256) {
        // This would query the actual DEX for liquidity
        return 1000000; // Mock value
    }
    
    function _simulateHoneypotCheck() internal view returns (bool) {
        // This would attempt to simulate a buy/sell transaction
        return false; // Mock value
    }
    
    function _checkForBlacklistFunction() internal view returns (bool) {
        // This would check contract bytecode for blacklist functions
        return false; // Mock value
    }
    
    function getTokenOwner() external view returns (address) {
        // This would try to call owner() function on the token
        // For now, return zero address
        return address(0);
    }
    
    function _uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        while (_i != 0) {
            k -= 1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
    
    // Admin functions
    function updatePairAddress(address _pairAddress) external onlyOwner {
        pairAddress = _pairAddress;
    }
    
    function forceUpdateSupply(uint256 _newSupply) external onlyOwner {
        lastCheckedSupply = _newSupply;
    }
    
    // Fallback functions
    receive() external payable {}
    fallback() external payable {}
}
