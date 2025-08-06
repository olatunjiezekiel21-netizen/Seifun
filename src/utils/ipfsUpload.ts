// IPFS Upload Utility for Token Logos
export class IPFSUploader {
  private static readonly PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY || '';
  private static readonly PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY || '';
  private static readonly PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';

  // Upload file to IPFS via Pinata
  public static async uploadToIPFS(file: File): Promise<string> {
    if (!this.PINATA_API_KEY || !this.PINATA_SECRET_KEY) {
      console.warn('IPFS upload not configured, using local URL');
      return URL.createObjectURL(file);
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const metadata = JSON.stringify({
        name: `token-logo-${Date.now()}`,
        keyvalues: {
          type: 'token-logo',
          timestamp: new Date().toISOString()
        }
      });
      formData.append('pinataMetadata', metadata);

      const options = JSON.stringify({
        cidVersion: 0,
      });
      formData.append('pinataOptions', options);

      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.PINATA_API_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`IPFS upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      const ipfsUrl = `${this.PINATA_GATEWAY}${result.IpfsHash}`;
      
      console.log('✅ Logo uploaded to IPFS:', ipfsUrl);
      return ipfsUrl;

    } catch (error) {
      console.error('❌ IPFS upload failed:', error);
      // Fallback to local URL
      return URL.createObjectURL(file);
    }
  }

  // Alternative: Upload to Web3.Storage (free option)
  public static async uploadToWeb3Storage(file: File): Promise<string> {
    const WEB3_STORAGE_TOKEN = import.meta.env.VITE_WEB3_STORAGE_TOKEN;
    
    if (!WEB3_STORAGE_TOKEN) {
      console.warn('Web3.Storage not configured, using local URL');
      return URL.createObjectURL(file);
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('https://api.web3.storage/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WEB3_STORAGE_TOKEN}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Web3.Storage upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      const ipfsUrl = `https://${result.cid}.ipfs.w3s.link/${file.name}`;
      
      console.log('✅ Logo uploaded to Web3.Storage:', ipfsUrl);
      return ipfsUrl;

    } catch (error) {
      console.error('❌ Web3.Storage upload failed:', error);
      // Fallback to local URL
      return URL.createObjectURL(file);
    }
  }

  // Upload with automatic fallback
  public static async uploadLogo(file: File): Promise<string> {
    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      throw new Error('File size too large (max 5MB)');
    }

    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Try IPFS upload first, then fallback to Web3.Storage, then local
    try {
      return await this.uploadToIPFS(file);
    } catch (error) {
      console.warn('IPFS upload failed, trying Web3.Storage...');
      try {
        return await this.uploadToWeb3Storage(file);
      } catch (error) {
        console.warn('Web3.Storage upload failed, using local URL');
        return URL.createObjectURL(file);
      }
    }
  }

  // Validate IPFS URL
  public static isValidIPFSUrl(url: string): boolean {
    return url.includes('ipfs') || url.includes('gateway') || url.startsWith('https://');
  }

  // Convert IPFS hash to gateway URL
  public static hashToGatewayUrl(hash: string): string {
    if (hash.startsWith('http')) return hash;
    if (hash.startsWith('Qm') || hash.startsWith('bafy')) {
      return `${this.PINATA_GATEWAY}${hash}`;
    }
    return hash;
  }
}

// React hook for logo upload
export const useLogoUpload = () => {
  const uploadLogo = async (file: File): Promise<string> => {
    return await IPFSUploader.uploadLogo(file);
  };

  const validateFile = (file: File): string | null => {
    if (file.size > 5 * 1024 * 1024) {
      return 'File size too large (max 5MB)';
    }
    if (!file.type.startsWith('image/')) {
      return 'File must be an image';
    }
    return null;
  };

  return {
    uploadLogo,
    validateFile,
    isValidIPFSUrl: IPFSUploader.isValidIPFSUrl,
    hashToGatewayUrl: IPFSUploader.hashToGatewayUrl
  };
};