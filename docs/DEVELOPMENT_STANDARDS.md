# Seifun Development Standards & Conventions

## 🎯 **Project Overview**
Seifun is a dual-chain DeFi platform supporting both Sei EVM and Sei Native environments with sub-second execution requirements (≤ 390ms finality).

## 🏗️ **Architecture Principles**

### **Dual-Chain Strategy**
- **Sei EVM**: Solidity contracts, EVM-compatible tooling
- **Sei Native**: CosmWasm contracts, Cosmos SDK integration
- **Unified Frontend**: Single React/Next.js app with chain detection
- **Microservice Backend**: Language-optimized services (Go for latency, Node.js for orchestration, Python for ML)

### **Performance Requirements**
- Sub-second execution (≤ 390ms finality)
- Non-custodial operations
- Safety-first design
- Real-time data processing

## 📁 **Repository Structure**

```
seifun/
├── contracts/
│   ├── evm/                    # Solidity contracts
│   │   ├── FeeCollector.sol
│   │   ├── Router.sol
│   │   └── tests/
│   └── native/                 # CosmWasm contracts
│       ├── router-helper/
│       ├── staking-manager/
│       └── tests/
├── backend/
│   ├── indexer/               # Go/Node.js
│   ├── token-scanner/         # Node.js/TypeScript
│   ├── risk-engine/           # Go
│   ├── order-router/          # Go
│   ├── execution-service/     # Go
│   ├── seilor-agent/          # Python/FastAPI
│   ├── staking-manager/       # Node.js
│   └── telemetry/             # Go
├── frontend/                  # React/Next.js
├── infrastructure/
│   ├── kubernetes/
│   ├── terraform/
│   └── docker/
├── tests/
│   ├── integration/
│   ├── e2e/
│   └── performance/
└── docs/
```

## 🔧 **Tech Stack Standards**

### **Frontend (React/Next.js)**
```typescript
// Chain detection and switching
interface ChainConfig {
  chainId: string;
  name: string;
  type: 'evm' | 'native';
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

// Dual-chain wallet integration
interface WalletAdapter {
  connect(): Promise<WalletConnection>;
  switchChain(chainId: string): Promise<void>;
  signTransaction(tx: Transaction): Promise<string>;
  getBalance(address: string): Promise<BigNumber>;
}
```

### **Backend Services**

#### **Go Services (High Performance)**
```go
// Service interface standard
type Service interface {
    Start(ctx context.Context) error
    Stop(ctx context.Context) error
    Health() HealthStatus
}

// Dual-chain data structures
type ChainType string

const (
    ChainTypeEVM    ChainType = "evm"
    ChainTypeNative ChainType = "native"
)

type Transaction struct {
    ChainType ChainType `json:"chain_type"`
    Hash      string    `json:"hash"`
    Data      []byte    `json:"data"`
}
```

#### **Node.js Services (Orchestration)**
```typescript
// Service base class
abstract class BaseService {
  abstract start(): Promise<void>;
  abstract stop(): Promise<void>;
  abstract healthCheck(): Promise<HealthStatus>;
  
  protected async handleChainType(chainType: 'evm' | 'native'): Promise<void> {
    // Chain-specific logic
  }
}

// Dual-chain event handling
interface ChainEvent {
  chainType: 'evm' | 'native';
  eventType: string;
  data: any;
  timestamp: number;
}
```

#### **Python Services (ML/AI)**
```python
# Agent base class
from abc import ABC, abstractmethod
from typing import Dict, Any, Union
from enum import Enum

class ChainType(Enum):
    EVM = "evm"
    NATIVE = "native"

class BaseAgent(ABC):
    @abstractmethod
    async def process_signal(self, signal: Dict[str, Any], chain_type: ChainType) -> Dict[str, Any]:
        pass
    
    @abstractmethod
    async def execute_action(self, action: Dict[str, Any], chain_type: ChainType) -> str:
        pass
```

## 🔒 **Security Standards**

### **Smart Contract Security**

#### **Solidity (EVM)**
```solidity
// Security patterns
contract SecureContract {
    using ReentrancyGuard for *;
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }
    
    // Gas optimization
    function optimizedFunction() external {
        // Use assembly for gas-critical operations
        assembly {
            // Optimized bytecode
        }
    }
}
```

#### **CosmWasm (Native)**
```rust
// Security patterns
use cosmwasm_std::{Deps, DepsMut, Env, MessageInfo, Response, StdResult};
use cw_storage_plus::Item;

pub const OWNER: Item<String> = Item::new("owner");

pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> StdResult<Response> {
    match msg {
        ExecuteMsg::SecureAction { .. } => {
            // Verify sender is owner
            let owner = OWNER.load(deps.storage)?;
            if info.sender.to_string() != owner {
                return Err(StdError::unauthorized());
            }
            // Execute secure action
        }
    }
}
```

## 🧪 **Testing Standards**

### **Smart Contract Testing**

#### **Foundry (EVM)**
```solidity
// Test structure
contract FeeCollectorTest is Test {
    FeeCollector public feeCollector;
    
    function setUp() public {
        feeCollector = new FeeCollector();
    }
    
    function testFeeCollection() public {
        // Test fee collection logic
    }
    
    function testFuzzFeeAmount(uint256 amount) public {
        // Fuzz testing
    }
}
```

#### **CosmWasm Testing**
```rust
#[cfg(test)]
mod tests {
    use super::*;
    use cosmwasm_std::testing::{mock_dependencies, mock_env, mock_info};
    
    #[test]
    fn test_secure_action() {
        let mut deps = mock_dependencies();
        let env = mock_env();
        let info = mock_info("owner", &[]);
        
        // Test secure action execution
    }
}
```

### **Integration Testing**
```typescript
// Dual-chain integration tests
describe('Seifun Integration Tests', () => {
  describe('EVM Chain', () => {
    it('should execute trades on EVM', async () => {
      // EVM-specific test
    });
  });
  
  describe('Native Chain', () => {
    it('should execute trades on Native', async () => {
      // Native-specific test
    });
  });
  
  describe('Cross-Chain', () => {
    it('should handle cross-chain operations', async () => {
      // Cross-chain test
    });
  });
});
```

## 📊 **Performance Standards**

### **Latency Requirements**
- **Order Routing**: ≤ 50ms
- **Execution**: ≤ 100ms
- **Finality**: ≤ 390ms
- **UI Response**: ≤ 200ms

### **Monitoring & Metrics**
```typescript
// Performance monitoring
interface PerformanceMetrics {
  latency: {
    orderRouting: number;
    execution: number;
    finality: number;
  };
  throughput: {
    ordersPerSecond: number;
    transactionsPerSecond: number;
  };
  errorRate: number;
  chainType: 'evm' | 'native';
}
```

## 🔄 **CI/CD Standards**

### **GitHub Actions Workflow**
```yaml
name: Seifun CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test-evm:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Test EVM Contracts
        run: |
          cd contracts/evm
          forge test
          
  test-native:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Test Native Contracts
        run: |
          cd contracts/native
          cargo test
          
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Test Backend Services
        run: |
          cd backend
          npm test
          go test ./...
          python -m pytest
```

## 📝 **Code Review Standards**

### **Pull Request Template**
```markdown
## Changes
- [ ] EVM contracts
- [ ] Native contracts
- [ ] Backend services
- [ ] Frontend components
- [ ] Tests
- [ ] Documentation

## Chain Compatibility
- [ ] Sei EVM
- [ ] Sei Native
- [ ] Cross-chain operations

## Performance Impact
- [ ] Latency impact: < 10ms
- [ ] Gas optimization
- [ ] Memory usage

## Security Review
- [ ] Smart contract security
- [ ] Input validation
- [ ] Access controls
```

## 🚀 **Deployment Standards**

### **Environment Configuration**
```yaml
# kubernetes/values.yaml
environments:
  development:
    chains:
      evm:
        rpcUrl: "https://evm-rpc.sei-apis.com"
        chainId: "1328"
      native:
        rpcUrl: "https://sei-rpc.polkachu.com"
        chainId: "sei-1"
  
  production:
    chains:
      evm:
        rpcUrl: "https://evm-rpc.sei-apis.com"
        chainId: "1328"
      native:
        rpcUrl: "https://sei-rpc.polkachu.com"
        chainId: "sei-1"
```

This comprehensive standard ensures consistent development across both Sei EVM and Native environments while maintaining the performance and security requirements of the Seifun platform.