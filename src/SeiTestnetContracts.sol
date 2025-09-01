// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// 🚀 SEI TESTNET SMART CONTRACTS - REAL ON-CHAIN IMPLEMENTATION

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// Context Store for AI Data
contract ContextStore is Ownable, ReentrancyGuard {
    struct AIContext {
        string userQuery;
        string aiResponse;
        string transactionHash;
        uint256 timestamp;
        bool success;
        address user;
    }
    
    uint256 private _contextId;
    mapping(uint256 => AIContext) public contexts;
    mapping(address => uint256[]) public userContexts;
    
    event ContextStored(uint256 indexed contextId, address indexed user, string transactionHash);
    
    constructor(address initialOwner) Ownable(initialOwner) {}
    
    function storeContext(
        string memory userQuery,
        string memory aiResponse,
        string memory transactionHash,
        bool success
    ) external returns (uint256) {
        _contextId++;
        uint256 contextId = _contextId;
        
        contexts[contextId] = AIContext({
            userQuery: userQuery,
            aiResponse: aiResponse,
            transactionHash: transactionHash,
            timestamp: block.timestamp,
            success: success,
            user: msg.sender
        });
        
        userContexts[msg.sender].push(contextId);
        
        emit ContextStored(contextId, msg.sender, transactionHash);
        return contextId;
    }
    
    function getUserContexts(address user) external view returns (uint256[] memory) {
        return userContexts[user];
    }
    
    function getContext(uint256 contextId) external view returns (AIContext memory) {
        return contexts[contextId];
    }
}

// Portfolio Manager
contract PortfolioManager is Ownable, ReentrancyGuard {
    struct Portfolio {
        address user;
        uint256 totalValue;
        uint256 lastUpdate;
        bool active;
    }
    
    mapping(address => Portfolio) public portfolios;
    mapping(address => mapping(address => uint256)) public userBalances; // user => token => balance
    
    event PortfolioUpdated(address indexed user, uint256 totalValue);
    event BalanceUpdated(address indexed user, address indexed token, uint256 balance);
    
    constructor(address initialOwner) Ownable(initialOwner) {}
    
    function updatePortfolio(address user, uint256 totalValue) external onlyOwner {
        portfolios[user] = Portfolio({
            user: user,
            totalValue: totalValue,
            lastUpdate: block.timestamp,
            active: true
        });
        
        emit PortfolioUpdated(user, totalValue);
    }
    
    function updateBalance(address user, address token, uint256 balance) external onlyOwner {
        userBalances[user][token] = balance;
        emit BalanceUpdated(user, token, balance);
    }
    
    function getPortfolio(address user) external view returns (Portfolio memory) {
        return portfolios[user];
    }
    
    function getUserBalance(address user, address token) external view returns (uint256) {
        return userBalances[user][token];
    }
}

// Staking Contract
contract StakingContract is Ownable, ReentrancyGuard {
    struct Stake {
        uint256 id;
        address user;
        uint256 amount;
        uint256 startTime;
        uint256 endTime;
        bool active;
        uint256 rewards;
    }
    
    uint256 private _stakeId;
    mapping(uint256 => Stake) public stakes;
    mapping(address => uint256[]) public userStakes;
    
    uint256 public constant REWARD_RATE = 12; // 12% APY
    uint256 public constant LOCK_PERIOD = 21 days;
    
    event Staked(uint256 indexed stakeId, address indexed user, uint256 amount);
    event Unstaked(uint256 indexed stakeId, address indexed user, uint256 amount, uint256 rewards);
    
    constructor(address initialOwner) Ownable(initialOwner) {}
    
    function stake() external payable nonReentrant {
        require(msg.value > 0, "Amount must be greater than 0");
        
        _stakeId++;
        uint256 stakeId = _stakeId;
        
        stakes[stakeId] = Stake({
            id: stakeId,
            user: msg.sender,
            amount: msg.value,
            startTime: block.timestamp,
            endTime: block.timestamp + LOCK_PERIOD,
            active: true,
            rewards: 0
        });
        
        userStakes[msg.sender].push(stakeId);
        
        emit Staked(stakeId, msg.sender, msg.value);
    }
    
    function unstake(uint256 stakeId) external nonReentrant {
        Stake storage userStake = stakes[stakeId];
        require(userStake.user == msg.sender, "Not your stake");
        require(userStake.active, "Stake not active");
        require(block.timestamp >= userStake.endTime, "Lock period not ended");
        
        uint256 rewards = calculateRewards(stakeId);
        uint256 totalAmount = userStake.amount + rewards;
        
        userStake.active = false;
        userStake.rewards = rewards;
        
        payable(msg.sender).transfer(totalAmount);
        
        emit Unstaked(stakeId, msg.sender, userStake.amount, rewards);
    }
    
    function calculateRewards(uint256 stakeId) public view returns (uint256) {
        Stake memory userStake = stakes[stakeId];
        if (!userStake.active) return userStake.rewards;
        
        uint256 timeStaked = block.timestamp - userStake.startTime;
        uint256 daysStaked = timeStaked / 1 days;
        
        return (userStake.amount * REWARD_RATE * daysStaked) / (365 * 100);
    }
    
    function getUserStakes(address user) external view returns (uint256[] memory) {
        return userStakes[user];
    }
    
    function getStake(uint256 stakeId) external view returns (Stake memory) {
        return stakes[stakeId];
    }
}

// Lending Pool
contract LendingPool is Ownable, ReentrancyGuard {
    struct Loan {
        uint256 id;
        address borrower;
        uint256 amount;
        uint256 interestRate;
        uint256 startTime;
        uint256 dueTime;
        bool active;
        bool repaid;
    }
    
    uint256 private _loanId;
    mapping(uint256 => Loan) public loans;
    mapping(address => uint256[]) public userLoans;
    
    uint256 public constant INTEREST_RATE = 8; // 8% APY
    uint256 public constant LOAN_DURATION = 30 days;
    
    event LoanCreated(uint256 indexed loanId, address indexed borrower, uint256 amount);
    event LoanRepaid(uint256 indexed loanId, address indexed borrower, uint256 amount, uint256 interest);
    
    constructor(address initialOwner) Ownable(initialOwner) {}
    
    function borrow() external payable nonReentrant {
        require(msg.value > 0, "Amount must be greater than 0");
        
        _loanId++;
        uint256 loanId = _loanId;
        
        loans[loanId] = Loan({
            id: loanId,
            borrower: msg.sender,
            amount: msg.value,
            interestRate: INTEREST_RATE,
            startTime: block.timestamp,
            dueTime: block.timestamp + LOAN_DURATION,
            active: true,
            repaid: false
        });
        
        userLoans[msg.sender].push(loanId);
        
        payable(msg.sender).transfer(msg.value);
        
        emit LoanCreated(loanId, msg.sender, msg.value);
    }
    
    function repay(uint256 loanId) external payable nonReentrant {
        Loan storage userLoan = loans[loanId];
        require(userLoan.borrower == msg.sender, "Not your loan");
        require(userLoan.active, "Loan not active");
        require(!userLoan.repaid, "Loan already repaid");
        
        uint256 interest = calculateInterest(loanId);
        uint256 totalAmount = userLoan.amount + interest;
        
        require(msg.value >= totalAmount, "Insufficient repayment amount");
        
        userLoan.active = false;
        userLoan.repaid = true;
        
        emit LoanRepaid(loanId, msg.sender, userLoan.amount, interest);
    }
    
    function calculateInterest(uint256 loanId) public view returns (uint256) {
        Loan memory userLoan = loans[loanId];
        if (!userLoan.active || userLoan.repaid) return 0;
        
        uint256 timeElapsed = block.timestamp - userLoan.startTime;
        uint256 daysElapsed = timeElapsed / 1 days;
        
        return (userLoan.amount * userLoan.interestRate * daysElapsed) / (365 * 100);
    }
    
    function getUserLoans(address user) external view returns (uint256[] memory) {
        return userLoans[user];
    }
    
    function getLoan(uint256 loanId) external view returns (Loan memory) {
        return loans[loanId];
    }
}