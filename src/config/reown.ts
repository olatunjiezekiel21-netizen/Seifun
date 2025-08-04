export const reownConfig = {
  projectId: import.meta.env.VITE_REOWN_PROJECT_ID || 'your_project_id',
  appId: import.meta.env.VITE_REOWN_APP_ID || 'your_app_id',
  relayUrl: import.meta.env.VITE_REOWN_RELAY_URL || 'wss://relay.reown.com',
  chains: ['sei:atlantic-2'], // Sei testnet - change to 'sei:sei-network' for mainnet
  appName: 'Seifun',
  appDescription: 'The ultimate Sei token launchpad and trading platform',
  appUrl: 'https://seifun.io',
  appIcon: '/Seifu.png'
};

export const getSeiNetworkConfig = (isMainnet = false) => {
  return {
    chainId: isMainnet ? 1329 : 1328,
    rpcUrl: isMainnet 
      ? 'https://evm-rpc.sei-apis.com'
      : 'https://evm-rpc-testnet.sei-apis.com',
    networkName: isMainnet ? 'Sei Network' : 'Sei Testnet',
    nativeCurrency: {
      name: 'SEI',
      symbol: 'SEI',
      decimals: 18
    },
    blockExplorerUrl: isMainnet 
      ? 'https://seitrace.com'
      : 'https://seitrace.com/?chain=sei-testnet'
  };
};