// Token Metadata Storage System
import { IPFSUploader } from './ipfsUpload';

export interface TokenMetadata {
  name: string;
  symbol: string;
  description?: string;
  image?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  discord?: string;
  github?: string;
  totalSupply: string;
  decimals: number;
  contractAddress?: string;
  creator?: string;
  createdAt: string;
  version: string;
}

export class TokenMetadataManager {
  private static readonly METADATA_VERSION = '1.0.0';

  // Create metadata object from form data
  public static createMetadata(formData: any, contractAddress?: string, creator?: string): TokenMetadata {
    return {
      name: formData.name,
      symbol: formData.symbol,
      description: formData.description || '',
      image: formData.tokenImage || '',
      website: formData.website || '',
      twitter: formData.twitter || '',
      telegram: formData.telegram || '',
      discord: formData.discord || '',
      github: formData.github || '',
      totalSupply: formData.totalSupply,
      decimals: formData.decimals || 18,
      contractAddress: contractAddress || '',
      creator: creator || '',
      createdAt: new Date().toISOString(),
      version: this.METADATA_VERSION
    };
  }

  // Upload metadata to IPFS
  public static async uploadMetadata(metadata: TokenMetadata): Promise<string> {
    try {
      // Convert metadata to JSON blob
      const metadataJson = JSON.stringify(metadata, null, 2);
      const metadataBlob = new Blob([metadataJson], { type: 'application/json' });
      const metadataFile = new File([metadataBlob], `${metadata.symbol}-metadata.json`, { type: 'application/json' });

      // Upload to IPFS
      const metadataUrl = await IPFSUploader.uploadLogo(metadataFile);
      console.log('✅ Token metadata uploaded to IPFS:', metadataUrl);
      
      return metadataUrl;
    } catch (error) {
      console.error('❌ Failed to upload metadata:', error);
      throw error;
    }
  }

  // Store metadata reference on-chain (simplified version)
  public static async storeMetadataReference(
    tokenAddress: string, 
    metadataUrl: string, 
    signer: any
  ): Promise<string> {
    try {
      // For now, we'll store this in localStorage as a registry
      // In production, this could be stored in a smart contract registry
      const metadataRegistry = this.getMetadataRegistry();
      metadataRegistry[tokenAddress.toLowerCase()] = {
        metadataUrl,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem('tokenMetadataRegistry', JSON.stringify(metadataRegistry));
      console.log('✅ Metadata reference stored for token:', tokenAddress);
      
      return metadataUrl;
    } catch (error) {
      console.error('❌ Failed to store metadata reference:', error);
      throw error;
    }
  }

  // Get metadata registry from localStorage
  private static getMetadataRegistry(): Record<string, any> {
    try {
      const registry = localStorage.getItem('tokenMetadataRegistry');
      return registry ? JSON.parse(registry) : {};
    } catch (error) {
      console.error('Failed to parse metadata registry:', error);
      return {};
    }
  }

  // Get metadata URL for a token address
  public static getMetadataUrl(tokenAddress: string): string | null {
    try {
      const registry = this.getMetadataRegistry();
      const entry = registry[tokenAddress.toLowerCase()];
      return entry ? entry.metadataUrl : null;
    } catch (error) {
      console.error('Failed to get metadata URL:', error);
      return null;
    }
  }

  // Fetch metadata from IPFS URL
  public static async fetchMetadata(metadataUrl: string): Promise<TokenMetadata | null> {
    try {
      const response = await fetch(metadataUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch metadata: ${response.statusText}`);
      }
      
      const metadata = await response.json();
      return metadata as TokenMetadata;
    } catch (error) {
      console.error('Failed to fetch metadata:', error);
      return null;
    }
  }

  // Get all stored tokens with metadata
  public static getAllTokensWithMetadata(): Array<{ address: string; metadataUrl: string; timestamp: string }> {
    try {
      const registry = this.getMetadataRegistry();
      return Object.entries(registry).map(([address, data]: [string, any]) => ({
        address,
        metadataUrl: data.metadataUrl,
        timestamp: data.timestamp
      }));
    } catch (error) {
      console.error('Failed to get tokens with metadata:', error);
      return [];
    }
  }

  // Validate metadata format
  public static validateMetadata(metadata: any): boolean {
    try {
      return (
        typeof metadata.name === 'string' &&
        typeof metadata.symbol === 'string' &&
        typeof metadata.totalSupply === 'string' &&
        typeof metadata.decimals === 'number' &&
        typeof metadata.createdAt === 'string' &&
        typeof metadata.version === 'string'
      );
    } catch (error) {
      return false;
    }
  }
}

// React hook for metadata management
export const useTokenMetadata = () => {
  const createAndUploadMetadata = async (
    formData: any, 
    contractAddress?: string, 
    creator?: string
  ): Promise<string> => {
    const metadata = TokenMetadataManager.createMetadata(formData, contractAddress, creator);
    return await TokenMetadataManager.uploadMetadata(metadata);
  };

  const storeMetadataReference = async (
    tokenAddress: string, 
    metadataUrl: string, 
    signer: any
  ): Promise<string> => {
    return await TokenMetadataManager.storeMetadataReference(tokenAddress, metadataUrl, signer);
  };

  const getMetadataUrl = (tokenAddress: string): string | null => {
    return TokenMetadataManager.getMetadataUrl(tokenAddress);
  };

  const fetchMetadata = async (metadataUrl: string): Promise<TokenMetadata | null> => {
    return await TokenMetadataManager.fetchMetadata(metadataUrl);
  };

  const getAllTokens = (): Array<{ address: string; metadataUrl: string; timestamp: string }> => {
    return TokenMetadataManager.getAllTokensWithMetadata();
  };

  return {
    createAndUploadMetadata,
    storeMetadataReference,
    getMetadataUrl,
    fetchMetadata,
    getAllTokens,
    validateMetadata: TokenMetadataManager.validateMetadata
  };
};