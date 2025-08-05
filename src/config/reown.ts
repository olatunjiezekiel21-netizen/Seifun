export const reownConfig = {
  projectId: '8e9c0a8e42b574886bd130cfadc084f7',
  appName: 'Seifun',
  appDescription: 'The ultimate Sei token launchpad and trading platform',
  appUrl: 'https://seifun.netlify.app',
  appIcon: '/Seifu.png',
  metadata: {
    name: 'Seifun',
    description: 'The ultimate Sei token launchpad and trading platform',
    url: 'https://seifun.netlify.app',
    icons: ['/Seifu.png']
  }
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