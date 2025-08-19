/**
 * 🔗 Direct MCP Service Integration
 * 
 * Alternative to Cursor MCP integration - uses HTTP server mode
 * This allows us to use MCP functionality even if Cursor integration doesn't work
 */

export class DirectMCPService {
  private mcpServerUrl = 'http://localhost:3001';
  private isServerRunning = false;

  constructor() {
    this.checkServerStatus();
  }

  /**
   * Check if MCP server is running
   */
  async checkServerStatus(): Promise<boolean> {
    try {
      const response = await fetch(`${this.mcpServerUrl}/health`);
      this.isServerRunning = response.ok;
      return this.isServerRunning;
    } catch (error) {
      this.isServerRunning = false;
      return false;
    }
  }

  /**
   * Start MCP server in HTTP mode
   */
  async startMCPServer(): Promise<void> {
    console.log('🚀 Starting MCP Server in HTTP mode...');
    
    // In a real implementation, you would start the server
    // For now, we'll provide instructions
    console.log(`
    📋 To start the MCP server manually:
    
    1. Open a new terminal
    2. Run: npx @sei-js/mcp-server --http --port 3001
    3. Set environment variable: PRIVATE_KEY=<your-private-key>
    
    The server will be available at http://localhost:3001
    `);
  }

  /**
   * Call MCP server directly via HTTP
   */
  async callMCP(method: string, params: any = {}): Promise<any> {
    if (!this.isServerRunning) {
      throw new Error('MCP Server is not running. Please start it first.');
    }

    try {
      const response = await fetch(`${this.mcpServerUrl}/rpc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method,
          params
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(`MCP Error: ${result.error.message}`);
      }

      return result.result;
    } catch (error) {
      console.error('❌ Direct MCP call failed:', error);
      throw error;
    }
  }

  /**
   * Get wallet address using direct MCP call
   */
  async getWalletAddress(): Promise<string> {
    try {
      return await this.callMCP('get-address-from-private-key');
    } catch (error) {
      console.error('❌ Failed to get wallet address via MCP:', error);
      throw new Error('Failed to retrieve wallet address');
    }
  }

  /**
   * Get wallet balance using direct MCP call
   */
  async getWalletBalance(address?: string): Promise<string> {
    try {
      const targetAddress = address || await this.getWalletAddress();
      return await this.callMCP('get-balance', { address: targetAddress });
    } catch (error) {
      console.error('❌ Failed to get balance via MCP:', error);
      throw new Error('Failed to retrieve wallet balance');
    }
  }

  /**
   * Get token info using direct MCP call
   */
  async getTokenInfo(address: string): Promise<any> {
    try {
      return await this.callMCP('get-token-info', { address });
    } catch (error) {
      console.error('❌ Failed to get token info via MCP:', error);
      throw new Error('Failed to retrieve token information');
    }
  }

  /**
   * Transfer SEI using direct MCP call
   */
  async transferSEI(to: string, amount: string): Promise<string> {
    try {
      return await this.callMCP('transfer-sei', { to, amount });
    } catch (error) {
      console.error('❌ Failed to transfer SEI via MCP:', error);
      throw new Error('Failed to execute SEI transfer');
    }
  }

  /**
   * Check if address is contract using direct MCP call
   */
  async isContract(address: string): Promise<boolean> {
    try {
      return await this.callMCP('is-contract', { address });
    } catch (error) {
      console.error('❌ Failed to check contract via MCP:', error);
      return false;
    }
  }

  /**
   * Get transaction details using direct MCP call
   */
  async getTransaction(hash: string): Promise<any> {
    try {
      return await this.callMCP('get-transaction', { hash });
    } catch (error) {
      console.error('❌ Failed to get transaction via MCP:', error);
      throw new Error('Failed to retrieve transaction');
    }
  }

  /**
   * Read contract using direct MCP call
   */
  async readContract(address: string, method: string, params: any[] = []): Promise<any> {
    try {
      return await this.callMCP('read-contract', { address, method, params });
    } catch (error) {
      console.error('❌ Failed to read contract via MCP:', error);
      throw new Error('Failed to read contract');
    }
  }
}

// Export singleton instance
export const directMCPService = new DirectMCPService();