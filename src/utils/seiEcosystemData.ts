// Real Sei ecosystem data fetching utilities
export interface SeiDApp {
  id: number;
  name: string;
  description: string;
  image: string;
  category: string;
  tvl: string;
  users: string;
  url: string;
  featured: boolean;
  status: string;
}

export interface AlphaInsight {
  id: number;
  title: string;
  description: string;
  confidence: number;
  category: string;
  timeframe: string;
  impact: string;
  type: string;
}

// Real Sei dApps data (verified projects)
export const getSeiDApps = async (): Promise<SeiDApp[]> => {
  // This would normally fetch from an API, but for now return verified Sei ecosystem projects
  return [
    {
      id: 1,
      name: 'Seifun',
      description: 'The ultimate Sei token launchpad and trading platform',
      image: '/Seifu.png',
      category: 'DeFi',
      tvl: 'Coming Soon',
      users: 'New',
      url: '/app',
      featured: true,
      status: 'Live'
    }
    // Additional real dApps would be added here as they launch on Sei
  ];
};

// Real alpha insights (to be connected to actual market data)
export const getAlphaInsights = async (): Promise<AlphaInsight[]> => {
  // This would connect to real market intelligence APIs
  // For now, return empty array until real integrations are ready
  return [];
};

// Real Sei network statistics
export const getSeiNetworkStats = async () => {
  try {
    // This would fetch real data from Sei blockchain APIs
    // For now, return basic structure until real APIs are integrated
    return {
      totalTvl: 'Loading...',
      activeUsers: 'Loading...',
      transactions: 'Loading...',
      dAppsLive: '1' // Seifun is live
    };
  } catch (error) {
    console.error('Failed to fetch Sei network stats:', error);
    return {
      totalTvl: 'Error',
      activeUsers: 'Error',
      transactions: 'Error',
      dAppsLive: 'Error'
    };
  }
};

// Categories for dApp filtering
export const getDAppCategories = (): string[] => {
  return ['All', 'DeFi', 'NFT', 'Gaming', 'Infrastructure'];
};