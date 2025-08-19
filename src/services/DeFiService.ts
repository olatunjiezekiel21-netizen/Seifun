// Sei Network Configuration
const SEI_TESTNET_CONFIG = {
  chainId: 1328,
  rpcUrl: 'https://evm-rpc-testnet.sei-apis.com',
  nativeCurrency: {
    name: 'SEI',
    symbol: 'SEI',
    decimals: 18
  }
};

// Contract Addresses on Sei Testnet
const CONTRACTS = {
  // USDC on Sei EVM testnet (override via env if provided)
  USDC: (import.meta as any).env?.VITE_USDC_TESTNET || '0x4fCF1784B31630811181f670Aea7A7bEF803eaED',
  // Astroport Router (placeholder until wired)
  ASTROPORT_ROUTER: '0x0000000000000000000000000000000000000000',
  // Dragonswap Router (placeholder) 
  DRAGONSWAP_ROUTER: '0x0000000000000000000000000000000000000000',
  // Our deployed token factory (override via env if provided)
  TOKEN_FACTORY: (import.meta as any).env?.VITE_FACTORY_ADDRESS_TESTNET || '0x50C0b92b3BC34D7FeD7Da0C48a2F16a636D95C9F'
};