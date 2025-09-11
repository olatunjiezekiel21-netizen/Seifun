// Feature Flags Configuration
// Controls which features are available in development vs production

export interface FeatureFlags {
  // Core Features
  safeChecker: boolean;
  seilor: boolean;
  docs: boolean;
  
  // Launch Features (Coming Soon)
  seifunLaunch: boolean;
  seilist: boolean;
  
  // Development Features (Hidden in production)
  devPlus: boolean;
  charts: boolean;
  
  // Advanced Features
  nativeSeiScanning: boolean;
  realTimeData: boolean;
  aiTrading: boolean;
}

// Development Mode Configuration
export const isDevelopmentMode = import.meta.env.MODE === 'development' || 
                                 import.meta.env.VITE_DEV_MODE === 'true';

// Production Feature Flags
export const productionFlags: FeatureFlags = {
  // Core features - Always available
  safeChecker: true,
  seilor: true,
  docs: true,
  
  // Launch features - Coming Soon
  seifunLaunch: false, // Coming Soon
  seilist: false, // Coming Soon
  
  // Development features - Hidden in production
  devPlus: false,
  charts: false,
  
  // Advanced features - Coming Soon
  nativeSeiScanning: false, // Coming Soon
  realTimeData: false, // Coming Soon
  aiTrading: false, // Coming Soon
};

// Development Feature Flags
export const developmentFlags: FeatureFlags = {
  // Core features
  safeChecker: true,
  seilor: true,
  docs: true,
  
  // Launch features - Available in dev
  seifunLaunch: false,
  seilist: false,
  
  // Development features - Available in dev
  devPlus: false,
  charts: false,
  
  // Advanced features - Available in dev
  nativeSeiScanning: true,
  realTimeData: true,
  aiTrading: true,
};

// Get current feature flags based on environment
export const getFeatureFlags = (): FeatureFlags => {
  return isDevelopmentMode ? developmentFlags : productionFlags;
};

// Individual feature checks
export const isFeatureEnabled = (feature: keyof FeatureFlags): boolean => {
  const flags = getFeatureFlags();
  return flags[feature];
};

// Coming Soon features
export const comingSoonFeatures = [
  'seifunLaunch',
  'seilist', 
  'nativeSeiScanning',
  'realTimeData',
  'aiTrading'
] as const;

// Development-only features
export const developmentOnlyFeatures = [
  'devPlus',
  'charts'
] as const;

// Check if a feature is coming soon
export const isComingSoon = (feature: keyof FeatureFlags): boolean => {
  return comingSoonFeatures.includes(feature as any);
};

// Check if a feature is development-only
export const isDevelopmentOnly = (feature: keyof FeatureFlags): boolean => {
  return developmentOnlyFeatures.includes(feature as any);
};