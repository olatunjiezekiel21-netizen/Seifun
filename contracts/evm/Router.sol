// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./FeeCollector.sol";

/**
 * @title SeifunRouter
 * @dev Minimal router contract for Sei EVM trading operations
 * @notice Optimized for sub-second execution with CLOB and AMM integration
 */
contract SeifunRouter is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // Events
    event TradeExecuted(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        uint256 fee,
        bytes32 orderId
    );
    
    event LiquidityAdded(
        address indexed user,
        address indexed tokenA,
        address indexed tokenB,
        uint256 amountA,
        uint256 amountB,
        uint256 liquidity
    );
    
    event LiquidityRemoved(
        address indexed user,
        address indexed tokenA,
        address indexed tokenB,
        uint256 amountA,
        uint256 amountB,
        uint256 liquidity
    );

    // Trade types
    enum TradeType {
        MARKET,
        LIMIT,
        STOP_LOSS,
        TAKE_PROFIT
    }

    // Order structure
    struct Order {
        address user;
        address tokenIn;
        address tokenOut;
        uint256 amountIn;
        uint256 minAmountOut;
        uint256 price;
        TradeType tradeType;
        uint256 deadline;
        bool isActive;
        bytes32 orderId;
    }

    // State variables
    FeeCollector public feeCollector;
    address public orderBook; // CLOB contract address
    address public ammFactory; // AMM factory address
    
    mapping(bytes32 => Order) public orders;
    mapping(address => bytes32[]) public userOrders;
    mapping(address => mapping(address => uint256)) public liquidityBalances;
    
    uint256 public constant MAX_SLIPPAGE = 500; // 5% max slippage
    uint256 public constant BASIS_POINTS = 10000;
    
    // Performance tracking
    uint256 public totalTrades;
    uint256 public totalVolume;
    uint256 public lastTradeTime;

    constructor(
        address _feeCollector,
        address _orderBook,
        address _ammFactory
    ) {
        require(_feeCollector != address(0), "Invalid fee collector");
        require(_orderBook != address(0), "Invalid order book");
        require(_ammFactory != address(0), "Invalid AMM factory");
        
        feeCollector = FeeCollector(_feeCollector);
        orderBook = _orderBook;
        ammFactory = _ammFactory;
    }

    /**
     * @dev Execute a market trade
     * @param tokenIn Input token address
     * @param tokenOut Output token address
     * @param amountIn Amount of input token
     * @param minAmountOut Minimum amount of output token
     * @param deadline Trade deadline
     */
    function executeMarketTrade(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut,
        uint256 deadline
    ) external payable nonReentrant returns (uint256 amountOut) {
        require(block.timestamp <= deadline, "Trade expired");
        require(amountIn > 0, "Invalid amount");
        require(tokenIn != tokenOut, "Same token");

        // Calculate fee
        uint256 fee = feeCollector.calculateFee(tokenIn, amountIn);
        uint256 amountAfterFee = amountIn - fee;

        // Execute trade through CLOB or AMM
        amountOut = _executeTrade(
            tokenIn,
            tokenOut,
            amountAfterFee,
            minAmountOut,
            TradeType.MARKET
        );

        // Collect fees
        if (fee > 0) {
            if (tokenIn == address(0)) {
                // Native SEI
                feeCollector.collectFees{value: fee}(tokenIn, amountIn, msg.sender);
            } else {
                // ERC20 token
                IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);
                IERC20(tokenIn).safeTransfer(address(feeCollector), fee);
                feeCollector.collectFees(tokenIn, amountIn, msg.sender);
            }
        }

        // Transfer output tokens to user
        if (tokenOut == address(0)) {
            // Native SEI
            (bool success, ) = msg.sender.call{value: amountOut}("");
            require(success, "Native SEI transfer failed");
        } else {
            // ERC20 token
            IERC20(tokenOut).safeTransfer(msg.sender, amountOut);
        }

        // Update tracking
        totalTrades++;
        totalVolume += amountIn;
        lastTradeTime = block.timestamp;

        // Emit event
        bytes32 orderId = keccak256(abi.encodePacked(
            msg.sender,
            tokenIn,
            tokenOut,
            amountIn,
            block.timestamp
        ));

        emit TradeExecuted(
            msg.sender,
            tokenIn,
            tokenOut,
            amountIn,
            amountOut,
            fee,
            orderId
        );

        return amountOut;
    }

    /**
     * @dev Create a limit order
     * @param tokenIn Input token address
     * @param tokenOut Output token address
     * @param amountIn Amount of input token
     * @param price Limit price
     * @param deadline Order deadline
     */
    function createLimitOrder(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 price,
        uint256 deadline
    ) external payable nonReentrant returns (bytes32 orderId) {
        require(block.timestamp <= deadline, "Order expired");
        require(amountIn > 0, "Invalid amount");
        require(price > 0, "Invalid price");
        require(tokenIn != tokenOut, "Same token");

        orderId = keccak256(abi.encodePacked(
            msg.sender,
            tokenIn,
            tokenOut,
            amountIn,
            price,
            block.timestamp
        ));

        // Create order
        Order memory order = Order({
            user: msg.sender,
            tokenIn: tokenIn,
            tokenOut: tokenOut,
            amountIn: amountIn,
            minAmountOut: 0,
            price: price,
            tradeType: TradeType.LIMIT,
            deadline: deadline,
            isActive: true,
            orderId: orderId
        });

        orders[orderId] = order;
        userOrders[msg.sender].push(orderId);

        // Lock tokens
        if (tokenIn == address(0)) {
            // Native SEI
            require(msg.value >= amountIn, "Insufficient native SEI");
        } else {
            // ERC20 token
            IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);
        }

        return orderId;
    }

    /**
     * @dev Cancel a limit order
     * @param orderId Order ID to cancel
     */
    function cancelOrder(bytes32 orderId) external nonReentrant {
        Order storage order = orders[orderId];
        require(order.user == msg.sender, "Not order owner");
        require(order.isActive, "Order not active");

        order.isActive = false;

        // Return locked tokens
        if (order.tokenIn == address(0)) {
            // Native SEI
            (bool success, ) = msg.sender.call{value: order.amountIn}("");
            require(success, "Native SEI transfer failed");
        } else {
            // ERC20 token
            IERC20(order.tokenIn).safeTransfer(msg.sender, order.amountIn);
        }
    }

    /**
     * @dev Add liquidity to AMM
     * @param tokenA First token address
     * @param tokenB Second token address
     * @param amountA Amount of token A
     * @param amountB Amount of token B
     * @param minLiquidity Minimum liquidity to receive
     */
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountA,
        uint256 amountB,
        uint256 minLiquidity
    ) external payable nonReentrant returns (uint256 liquidity) {
        require(amountA > 0 && amountB > 0, "Invalid amounts");
        require(tokenA != tokenB, "Same token");

        // Transfer tokens to contract
        if (tokenA == address(0)) {
            require(msg.value >= amountA, "Insufficient native SEI");
        } else {
            IERC20(tokenA).safeTransferFrom(msg.sender, address(this), amountA);
        }

        if (tokenB == address(0)) {
            require(msg.value >= amountA + amountB, "Insufficient native SEI");
        } else {
            IERC20(tokenB).safeTransferFrom(msg.sender, address(this), amountB);
        }

        // Add liquidity to AMM (simplified - would integrate with actual AMM)
        liquidity = _addLiquidityToAMM(tokenA, tokenB, amountA, amountB);
        require(liquidity >= minLiquidity, "Insufficient liquidity");

        // Update user liquidity balance
        liquidityBalances[msg.sender][tokenA] += amountA;
        liquidityBalances[msg.sender][tokenB] += amountB;

        emit LiquidityAdded(msg.sender, tokenA, tokenB, amountA, amountB, liquidity);

        return liquidity;
    }

    /**
     * @dev Remove liquidity from AMM
     * @param tokenA First token address
     * @param tokenB Second token address
     * @param liquidity Liquidity to remove
     * @param minAmountA Minimum amount of token A
     * @param minAmountB Minimum amount of token B
     */
    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint256 liquidity,
        uint256 minAmountA,
        uint256 minAmountB
    ) external nonReentrant returns (uint256 amountA, uint256 amountB) {
        require(liquidity > 0, "Invalid liquidity");

        // Remove liquidity from AMM (simplified - would integrate with actual AMM)
        (amountA, amountB) = _removeLiquidityFromAMM(tokenA, tokenB, liquidity);
        require(amountA >= minAmountA && amountB >= minAmountB, "Insufficient amounts");

        // Update user liquidity balance
        liquidityBalances[msg.sender][tokenA] -= amountA;
        liquidityBalances[msg.sender][tokenB] -= amountB;

        // Transfer tokens to user
        if (tokenA == address(0)) {
            (bool success, ) = msg.sender.call{value: amountA}("");
            require(success, "Native SEI transfer failed");
        } else {
            IERC20(tokenA).safeTransfer(msg.sender, amountA);
        }

        if (tokenB == address(0)) {
            (bool success, ) = msg.sender.call{value: amountB}("");
            require(success, "Native SEI transfer failed");
        } else {
            IERC20(tokenB).safeTransfer(msg.sender, amountB);
        }

        emit LiquidityRemoved(msg.sender, tokenA, tokenB, amountA, amountB, liquidity);

        return (amountA, amountB);
    }

    /**
     * @dev Get user's orders
     * @param user User address
     * @return Array of order IDs
     */
    function getUserOrders(address user) external view returns (bytes32[] memory) {
        return userOrders[user];
    }

    /**
     * @dev Get order details
     * @param orderId Order ID
     * @return Order details
     */
    function getOrder(bytes32 orderId) external view returns (Order memory) {
        return orders[orderId];
    }

    /**
     * @dev Get user's liquidity balance
     * @param user User address
     * @param token Token address
     * @return Liquidity balance
     */
    function getUserLiquidity(address user, address token) external view returns (uint256) {
        return liquidityBalances[user][token];
    }

    /**
     * @dev Internal function to execute trade
     */
    function _executeTrade(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut,
        TradeType tradeType
    ) internal returns (uint256 amountOut) {
        // Try CLOB first (better prices)
        amountOut = _tryCLOBTrade(tokenIn, tokenOut, amountIn, minAmountOut);
        
        if (amountOut == 0) {
            // Fallback to AMM
            amountOut = _tryAMMTrade(tokenIn, tokenOut, amountIn, minAmountOut);
        }

        require(amountOut >= minAmountOut, "Insufficient output amount");
        return amountOut;
    }

    /**
     * @dev Try to execute trade on CLOB
     */
    function _tryCLOBTrade(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut
    ) internal returns (uint256 amountOut) {
        // Simplified CLOB integration
        // In production, this would call the actual CLOB contract
        return 0; // Placeholder
    }

    /**
     * @dev Try to execute trade on AMM
     */
    function _tryAMMTrade(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut
    ) internal returns (uint256 amountOut) {
        // Simplified AMM integration
        // In production, this would call the actual AMM contract
        return amountIn; // Placeholder - 1:1 ratio
    }

    /**
     * @dev Add liquidity to AMM
     */
    function _addLiquidityToAMM(
        address tokenA,
        address tokenB,
        uint256 amountA,
        uint256 amountB
    ) internal returns (uint256 liquidity) {
        // Simplified AMM integration
        // In production, this would call the actual AMM contract
        return amountA + amountB; // Placeholder
    }

    /**
     * @dev Remove liquidity from AMM
     */
    function _removeLiquidityFromAMM(
        address tokenA,
        address tokenB,
        uint256 liquidity
    ) internal returns (uint256 amountA, uint256 amountB) {
        // Simplified AMM integration
        // In production, this would call the actual AMM contract
        amountA = liquidity / 2; // Placeholder
        amountB = liquidity / 2; // Placeholder
    }

    /**
     * @dev Update contract addresses
     */
    function updateAddresses(
        address _feeCollector,
        address _orderBook,
        address _ammFactory
    ) external onlyOwner {
        require(_feeCollector != address(0), "Invalid fee collector");
        require(_orderBook != address(0), "Invalid order book");
        require(_ammFactory != address(0), "Invalid AMM factory");
        
        feeCollector = FeeCollector(_feeCollector);
        orderBook = _orderBook;
        ammFactory = _ammFactory;
    }

    /**
     * @dev Emergency withdrawal function
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");

        if (token == address(0)) {
            require(address(this).balance >= amount, "Insufficient balance");
            (bool success, ) = owner().call{value: amount}("");
            require(success, "Native SEI transfer failed");
        } else {
            IERC20(token).safeTransfer(owner(), amount);
        }
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