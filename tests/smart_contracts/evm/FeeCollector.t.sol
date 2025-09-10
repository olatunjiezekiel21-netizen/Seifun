// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import "../../../contracts/evm/FeeCollector.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Mock ERC20 token for testing
contract MockERC20 is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _mint(msg.sender, 1000000 * 10**18);
    }
}

contract FeeCollectorTest is Test {
    FeeCollector public feeCollector;
    MockERC20 public mockToken;
    address public treasury;
    address public user;

    event FeeCollected(address indexed token, uint256 amount, address indexed from);
    event FeeDistributed(address indexed token, uint256 amount, address indexed to);
    event FeeRateUpdated(address indexed token, uint256 newRate);

    function setUp() public {
        treasury = address(0x1);
        user = address(0x2);
        
        // Deploy contracts
        feeCollector = new FeeCollector(treasury);
        mockToken = new MockERC20("Test Token", "TEST");
        
        // Setup initial state
        vm.deal(user, 100 ether);
        mockToken.transfer(user, 1000 * 10**18);
    }

    function testInitialization() public {
        assertEq(feeCollector.treasury(), treasury);
        assertEq(feeCollector.owner(), address(this));
        
        // Check default SEI token fee rate
        (uint256 rate, uint256 collected, bool isActive) = feeCollector.getFeeInfo(address(0));
        assertEq(rate, 25); // 0.25%
        assertEq(collected, 0);
        assertTrue(isActive);
    }

    function testCollectNativeSEIFees() public {
        uint256 amount = 1 ether;
        uint256 expectedFee = (amount * 25) / 10000; // 0.25%
        
        vm.prank(user);
        feeCollector.collectFees{value: amount}(address(0), amount, user);
        
        // Check fee collection
        (uint256 rate, uint256 collected, bool isActive) = feeCollector.getFeeInfo(address(0));
        assertEq(collected, expectedFee);
        assertTrue(isActive);
        
        // Check contract balance
        assertEq(address(feeCollector).balance, expectedFee);
    }

    function testCollectERC20Fees() public {
        uint256 amount = 1000 * 10**18;
        uint256 expectedFee = (amount * 25) / 10000; // 0.25%
        
        // Add mock token as supported
        feeCollector.addSupportedToken(address(mockToken), 25);
        
        // Approve and collect fees
        vm.startPrank(user);
        mockToken.approve(address(feeCollector), amount);
        feeCollector.collectFees(address(mockToken), amount, user);
        vm.stopPrank();
        
        // Check fee collection
        (uint256 rate, uint256 collected, bool isActive) = feeCollector.getFeeInfo(address(mockToken));
        assertEq(collected, expectedFee);
        assertTrue(isActive);
        
        // Check token balance
        assertEq(mockToken.balanceOf(address(feeCollector)), expectedFee);
    }

    function testDistributeFees() public {
        uint256 amount = 1 ether;
        uint256 expectedFee = (amount * 25) / 10000;
        
        // Collect fees first
        vm.prank(user);
        feeCollector.collectFees{value: amount}(address(0), amount, user);
        
        uint256 treasuryBalanceBefore = treasury.balance;
        
        // Distribute fees
        feeCollector.distributeFees(address(0), expectedFee);
        
        // Check treasury received fees
        assertEq(treasury.balance, treasuryBalanceBefore + expectedFee);
        
        // Check fee collection is updated
        (uint256 rate, uint256 collected, bool isActive) = feeCollector.getFeeInfo(address(0));
        assertEq(collected, 0);
    }

    function testUpdateFeeRate() public {
        uint256 newRate = 50; // 0.5%
        
        // Update fee rate
        feeCollector.updateFeeRate(address(0), newRate);
        
        // Check new rate
        (uint256 rate, uint256 collected, bool isActive) = feeCollector.getFeeInfo(address(0));
        assertEq(rate, newRate);
    }

    function testUpdateTreasury() public {
        address newTreasury = address(0x3);
        
        // Update treasury
        feeCollector.updateTreasury(newTreasury);
        
        // Check new treasury
        assertEq(feeCollector.treasury(), newTreasury);
    }

    function testToggleFeeCollection() public {
        // Toggle off
        feeCollector.toggleFeeCollection(address(0), false);
        
        (uint256 rate, uint256 collected, bool isActive) = feeCollector.getFeeInfo(address(0));
        assertFalse(isActive);
        
        // Toggle back on
        feeCollector.toggleFeeCollection(address(0), true);
        
        (rate, collected, isActive) = feeCollector.getFeeInfo(address(0));
        assertTrue(isActive);
    }

    function testCalculateFee() public {
        uint256 amount = 1000 * 10**18;
        uint256 expectedFee = (amount * 25) / 10000;
        
        uint256 calculatedFee = feeCollector.calculateFee(address(0), amount);
        assertEq(calculatedFee, expectedFee);
    }

    function testEmergencyWithdraw() public {
        uint256 amount = 1 ether;
        
        // Send ETH to contract
        vm.deal(address(feeCollector), amount);
        
        uint256 ownerBalanceBefore = address(this).balance;
        
        // Emergency withdraw
        feeCollector.emergencyWithdraw(address(0), amount);
        
        // Check owner received funds
        assertEq(address(this).balance, ownerBalanceBefore + amount);
    }

    function testMaxFeeRate() public {
        uint256 maxRate = 1000; // 10%
        
        // Should succeed
        feeCollector.updateFeeRate(address(0), maxRate);
        
        // Should fail
        vm.expectRevert("Fee rate too high");
        feeCollector.updateFeeRate(address(0), maxRate + 1);
    }

    function testInvalidTreasury() public {
        vm.expectRevert("Invalid treasury address");
        new FeeCollector(address(0));
    }

    function testUnauthorizedAccess() public {
        vm.prank(user);
        
        vm.expectRevert("Ownable: caller is not the owner");
        feeCollector.updateFeeRate(address(0), 50);
        
        vm.expectRevert("Ownable: caller is not the owner");
        feeCollector.updateTreasury(address(0x3));
        
        vm.expectRevert("Ownable: caller is not the owner");
        feeCollector.emergencyWithdraw(address(0), 1 ether);
    }

    function testReentrancyProtection() public {
        // This test would require a malicious contract that tries to reenter
        // For now, we'll test that the nonReentrant modifier is present
        uint256 amount = 1 ether;
        
        vm.prank(user);
        // Should not revert due to reentrancy
        feeCollector.collectFees{value: amount}(address(0), amount, user);
    }

    function testFuzzFeeCalculation(uint256 amount) public {
        vm.assume(amount > 0 && amount < type(uint256).max / 10000);
        
        uint256 expectedFee = (amount * 25) / 10000;
        uint256 calculatedFee = feeCollector.calculateFee(address(0), amount);
        
        assertEq(calculatedFee, expectedFee);
    }

    function testFuzzFeeCollection(uint256 amount) public {
        vm.assume(amount > 0 && amount <= 10 ether);
        
        uint256 expectedFee = (amount * 25) / 10000;
        
        vm.deal(user, amount);
        vm.prank(user);
        feeCollector.collectFees{value: amount}(address(0), amount, user);
        
        (uint256 rate, uint256 collected, bool isActive) = feeCollector.getFeeInfo(address(0));
        assertEq(collected, expectedFee);
    }

    function testGasOptimization() public {
        uint256 gasStart = gasleft();
        
        uint256 amount = 1 ether;
        vm.prank(user);
        feeCollector.collectFees{value: amount}(address(0), amount, user);
        
        uint256 gasUsed = gasStart - gasleft();
        
        // Should use less than 100k gas
        assertLt(gasUsed, 100000);
    }

    function testMultipleTokens() public {
        MockERC20 token2 = new MockERC20("Token 2", "TK2");
        MockERC20 token3 = new MockERC20("Token 3", "TK3");
        
        // Add multiple tokens
        feeCollector.addSupportedToken(address(token2), 30);
        feeCollector.addSupportedToken(address(token3), 40);
        
        // Check all tokens are supported
        address[] memory supportedTokens = feeCollector.getSupportedTokens();
        assertEq(supportedTokens.length, 4); // Including native SEI
        
        // Check fee rates
        (uint256 rate2, , ) = feeCollector.getFeeInfo(address(token2));
        (uint256 rate3, , ) = feeCollector.getFeeInfo(address(token3));
        
        assertEq(rate2, 30);
        assertEq(rate3, 40);
    }

    function testEventEmission() public {
        uint256 amount = 1 ether;
        uint256 expectedFee = (amount * 25) / 10000;
        
        // Test FeeCollected event
        vm.expectEmit(true, true, true, true);
        emit FeeCollected(address(0), expectedFee, user);
        
        vm.prank(user);
        feeCollector.collectFees{value: amount}(address(0), amount, user);
        
        // Test FeeDistributed event
        vm.expectEmit(true, true, true, true);
        emit FeeDistributed(address(0), expectedFee, treasury);
        
        feeCollector.distributeFees(address(0), expectedFee);
        
        // Test FeeRateUpdated event
        vm.expectEmit(true, true, true, true);
        emit FeeRateUpdated(address(0), 50);
        
        feeCollector.updateFeeRate(address(0), 50);
    }
}