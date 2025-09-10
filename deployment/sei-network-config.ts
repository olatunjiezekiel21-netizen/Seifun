// Sei Network Deployment Configuration for Seifun AI Services
export interface SeiNetworkConfig {
  // Network configuration
  network: {
    name: string;
    chainId: string;
    rpcUrl: string;
    restUrl: string;
    explorerUrl: string;
    gasPrice: string;
    gasAdjustment: number;
  };
  
  // Contract addresses (will be populated after deployment)
  contracts: {
    contextStore: string;
    aiRegistry: string;
    portfolioManager: string;
    riskEngine: string;
    yieldOptimizer: string;
    arbitrageDetector: string;
  };
  
  // Deployment settings
  deployment: {
    adminAddress: string;
    feeCollector: string;
    validatorAddress: string;
    maxGas: number;
    timeout: number;
  };
  
  // AI service configuration
  aiServices: {
    mcpServer: string;
    z1LabsEndpoint: string;
    contextStorage: string;
    modelRegistry: string;
  };
  
  // Economic parameters
  economics: {
    contextStorageFee: number; // in SEI
    aiServiceFee: number; // in SEI
    validatorReward: number; // percentage
    treasuryFee: number; // percentage
  };
}

// Mainnet configuration
export const seiMainnetConfig: SeiNetworkConfig = {
  network: {
    name: 'Sei Mainnet',
    chainId: 'sei-1',
    rpcUrl: 'https://rpc.sei.io',
    restUrl: 'https://rest.sei.io',
    explorerUrl: 'https://sei.io/explorer',
    gasPrice: '0.025usei',
    gasAdjustment: 1.3
  },
  
  contracts: {
    contextStore: '', // Will be populated after deployment
    aiRegistry: '',
    portfolioManager: '',
    riskEngine: '',
    yieldOptimizer: '',
    arbitrageDetector: ''
  },
  
  deployment: {
    adminAddress: '', // Will be set during deployment
    feeCollector: '', // Will be set during deployment
    validatorAddress: '', // Will be set during deployment
    maxGas: 5000000,
    timeout: 300000 // 5 minutes
  },
  
  aiServices: {
    mcpServer: 'https://mcp.seifun.ai',
    z1LabsEndpoint: 'https://api.z1labs.ai',
    contextStorage: 'https://context.seifun.ai',
    modelRegistry: 'https://models.seifun.ai'
  },
  
  economics: {
    contextStorageFee: 0.001, // 0.001 SEI per context storage
    aiServiceFee: 0.005, // 0.005 SEI per AI service call
    validatorReward: 0.7, // 70% to validators
    treasuryFee: 0.3 // 30% to treasury
  }
};

// Testnet configuration
export const seiTestnetConfig: SeiNetworkConfig = {
  network: {
    name: 'Sei Testnet',
    chainId: 'sei-testnet-1',
    rpcUrl: 'https://testnet-rpc.sei.io',
    restUrl: 'https://testnet-rest.sei.io',
    explorerUrl: 'https://testnet.sei.io/explorer',
    gasPrice: '0.025usei',
    gasAdjustment: 1.5
  },
  
  contracts: {
    contextStore: '',
    aiRegistry: '',
    portfolioManager: '',
    riskEngine: '',
    yieldOptimizer: '',
    arbitrageDetector: ''
  },
  
  deployment: {
    adminAddress: '',
    feeCollector: '',
    validatorAddress: '',
    maxGas: 10000000, // Higher gas limit for testnet
    timeout: 600000 // 10 minutes for testnet
  },
  
  aiServices: {
    mcpServer: 'https://testnet-mcp.seifun.ai',
    z1LabsEndpoint: 'https://testnet-api.z1labs.ai',
    contextStorage: 'https://testnet-context.seifun.ai',
    modelRegistry: 'https://testnet-models.seifun.ai'
  },
  
  economics: {
    contextStorageFee: 0.0001, // Lower fees for testnet
    aiServiceFee: 0.0005,
    validatorReward: 0.8, // Higher rewards for testnet validators
    treasuryFee: 0.2
  }
};

// Deployment scripts configuration
export interface DeploymentScripts {
  // Contract deployment order
  deploymentOrder: string[];
  
  // Verification settings
  verification: {
    enabled: boolean;
    apiKey: string;
    explorerUrl: string;
  };
  
  // Migration settings
  migration: {
    enabled: boolean;
    fromVersion: string;
    toVersion: string;
    steps: string[];
  };
  
  // Testing settings
  testing: {
    enabled: boolean;
    testAccounts: string[];
    testAmounts: number[];
  };
}

export const deploymentScripts: DeploymentScripts = {
  deploymentOrder: [
    'ContextStore',
    'AIRegistry',
    'PortfolioManager',
    'RiskEngine',
    'YieldOptimizer',
    'ArbitrageDetector'
  ],
  
  verification: {
    enabled: true,
    apiKey: process.env.SEI_EXPLORER_API_KEY || '',
    explorerUrl: 'https://sei.io/explorer'
  },
  
  migration: {
    enabled: false,
    fromVersion: '1.0.0',
    toVersion: '2.0.0',
    steps: [
      'Deploy new contracts',
      'Migrate existing data',
      'Update frontend references',
      'Decommission old contracts'
    ]
  },
  
  testing: {
    enabled: true,
    testAccounts: [
      'sei1testaccount1...',
      'sei1testaccount2...',
      'sei1testaccount3...'
    ],
    testAmounts: [100, 1000, 10000] // SEI amounts
  }
};

// Environment-specific configuration
export function getConfig(environment: 'mainnet' | 'testnet'): SeiNetworkConfig {
  return environment === 'mainnet' ? seiMainnetConfig : seiTestnetConfig;
}

// Contract deployment parameters
export interface ContractDeploymentParams {
  contractName: string;
  constructorArgs: any[];
  gasLimit: number;
  gasPrice: string;
  adminAddress: string;
  verification: boolean;
}

export const contractDeploymentParams: Record<string, ContractDeploymentParams> = {
  ContextStore: {
    contractName: 'ContextStore',
    constructorArgs: [
      'Seifun Context Store', // name
      'SCTX', // symbol
      '0.001', // storage fee
      '0.7', // validator reward
      '0.3' // treasury fee
    ],
    gasLimit: 5000000,
    gasPrice: '0.025usei',
    adminAddress: '',
    verification: true
  },
  
  AIRegistry: {
    contractName: 'AIRegistry',
    constructorArgs: [
      'Seifun AI Registry', // name
      '0.005', // service fee
      '0.8', // validator reward
      '0.2' // treasury fee
    ],
    gasLimit: 3000000,
    gasPrice: '0.025usei',
    adminAddress: '',
    verification: true
  },
  
  PortfolioManager: {
    contractName: 'PortfolioManager',
    constructorArgs: [
      'Seifun Portfolio Manager', // name
      '0.002', // management fee
      '0.6', // validator reward
      '0.4' // treasury fee
    ],
    gasLimit: 4000000,
    gasPrice: '0.025usei',
    adminAddress: '',
    verification: true
  },
  
  RiskEngine: {
    contractName: 'RiskEngine',
    constructorArgs: [
      'Seifun Risk Engine', // name
      '0.003', // risk assessment fee
      '0.75', // validator reward
      '0.25' // treasury fee
    ],
    gasLimit: 3500000,
    gasPrice: '0.025usei',
    adminAddress: '',
    verification: true
  },
  
  YieldOptimizer: {
    contractName: 'YieldOptimizer',
    constructorArgs: [
      'Seifun Yield Optimizer', // name
      '0.004', // optimization fee
      '0.65', // validator reward
      '0.35' // treasury fee
    ],
    gasLimit: 4500000,
    gasPrice: '0.025usei',
    adminAddress: '',
    verification: true
  },
  
  ArbitrageDetector: {
    contractName: 'ArbitrageDetector',
    constructorArgs: [
      'Seifun Arbitrage Detector', // name
      '0.006', // detection fee
      '0.7', // validator reward
      '0.3' // treasury fee
    ],
    gasLimit: 5000000,
    gasPrice: '0.025usei',
    adminAddress: '',
    verification: true
  }
};

// Deployment utilities
export class DeploymentUtils {
  // Validate configuration
  static validateConfig(config: SeiNetworkConfig): boolean {
    const requiredFields = [
      'network.rpcUrl',
      'network.chainId',
      'deployment.adminAddress',
      'deployment.feeCollector'
    ];
    
    for (const field of requiredFields) {
      const value = field.split('.').reduce((obj, key) => obj?.[key], config);
      if (!value) {
        console.error(`❌ Missing required field: ${field}`);
        return false;
      }
    }
    
    return true;
  }
  
  // Generate deployment script
  static generateDeploymentScript(config: SeiNetworkConfig, scripts: DeploymentScripts): string {
    let script = `#!/bin/bash\n\n`;
    script += `# Seifun AI Services Deployment Script\n`;
    script += `# Network: ${config.network.name}\n`;
    script += `# Chain ID: ${config.network.chainId}\n\n`;
    
    script += `set -e\n\n`;
    
    script += `echo "🚀 Starting Seifun AI Services deployment on ${config.network.name}"\n\n`;
    
    for (const contract of scripts.deploymentOrder) {
      const params = contractDeploymentParams[contract];
      if (params) {
        script += `echo "📦 Deploying ${contract}..."\n`;
        script += `sei tx wasm store ./artifacts/${contract}.wasm \\\n`;
        script += `  --from \${ADMIN_ADDRESS} \\\n`;
        script += `  --chain-id ${config.network.chainId} \\\n`;
        script += `  --gas ${params.gasLimit} \\\n`;
        script += `  --gas-prices ${params.gasPrice} \\\n`;
        script += `  --yes\n\n`;
        
        script += `echo "✅ ${contract} deployed successfully"\n\n`;
      }
    }
    
    script += `echo "🎉 All contracts deployed successfully!"\n`;
    script += `echo "🔗 Explorer: ${config.network.explorerUrl}\n"`;
    
    return script;
  }
  
  // Generate verification script
  static generateVerificationScript(config: SeiNetworkConfig, scripts: DeploymentScripts): string {
    if (!scripts.verification.enabled) {
      return '# Verification disabled\n';
    }
    
    let script = `#!/bin/bash\n\n`;
    script += `# Contract Verification Script\n`;
    script += `# Network: ${config.network.name}\n\n`;
    
    script += `set -e\n\n`;
    
    for (const contract of scripts.deploymentOrder) {
      script += `echo "🔍 Verifying ${contract}..."\n`;
      script += `sei tx wasm verify ${contract} \\\n`;
      script += `  --chain-id ${config.network.chainId} \\\n`;
      script += `  --yes\n\n`;
    }
    
    script += `echo "✅ All contracts verified successfully!"\n`;
    
    return script;
  }
  
  // Generate test script
  static generateTestScript(config: SeiNetworkConfig, scripts: DeploymentScripts): string {
    if (!scripts.testing.enabled) {
      return '# Testing disabled\n';
    }
    
    let script = `#!/bin/bash\n\n`;
    script += `# Contract Testing Script\n`;
    script += `# Network: ${config.network.name}\n\n`;
    
    script += `set -e\n\n`;
    
    script += `echo "🧪 Testing deployed contracts..."\n\n`;
    
    for (const contract of scripts.deploymentOrder) {
      script += `echo "🧪 Testing ${contract}..."\n`;
      script += `npm run test:${contract.toLowerCase()} \\\n`;
      script += `  --network ${config.network.name} \\\n`;
      script += `  --chain-id ${config.network.chainId}\n\n`;
    }
    
    script += `echo "✅ All tests passed successfully!"\n`;
    
    return script;
  }
}

// Export all configurations
export {
  seiMainnetConfig,
  seiTestnetConfig,
  deploymentScripts,
  contractDeploymentParams,
  DeploymentUtils
};