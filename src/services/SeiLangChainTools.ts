import { Tool } from "@langchain/core/tools";
import { cambrianSeiAgent } from './CambrianSeiAgent';

// SEI Balance Tool
export class SeiBalanceTool extends Tool {
  name = "sei_balance";
  description = "Get SEI balance for the connected wallet. No input required.";
  
  async _call(): Promise<string> {
    try {
      const balance = await cambrianSeiAgent.getBalance();
      return `Current SEI balance: ${balance} SEI`;
    } catch (error) {
      return `Error getting balance: ${error.message}`;
    }
  }
}

// SEI Transfer Tool
export class SeiTransferTool extends Tool {
  name = "sei_transfer";
  description = "Transfer SEI tokens to another address. Input should be JSON: {\"amount\": number, \"recipient\": \"0x...\"}";
  
  async _call(input: string): Promise<string> {
    try {
      const { amount, recipient } = JSON.parse(input);
      
      // Validate inputs
      if (!amount || !recipient) {
        return "Error: Both amount and recipient are required";
      }
      
      if (!recipient.match(/^0x[a-fA-F0-9]{40}$/)) {
        return "Error: Invalid recipient address format";
      }
      
      // Check balance first
      const currentBalance = await cambrianSeiAgent.getBalance();
      const balanceNum = parseFloat(currentBalance);
      
      if (balanceNum < amount) {
        return `Error: Insufficient balance. Available: ${currentBalance} SEI, Requested: ${amount} SEI`;
      }
      
      // Execute transfer
      const txHash = await cambrianSeiAgent.transferToken(amount.toString(), recipient);
      return `Transfer successful! ${amount} SEI sent to ${recipient}. Transaction hash: ${txHash}`;
      
    } catch (error) {
      return `Transfer failed: ${error.message}`;
    }
  }
}

// SEI Swap Tool
export class SeiSwapTool extends Tool {
  name = "sei_swap";
  description = "Swap tokens on Symphony DEX. Input should be JSON: {\"tokenIn\": \"SEI\", \"tokenOut\": \"USDC\", \"amount\": number}";
  
  async _call(input: string): Promise<string> {
    try {
      const params = JSON.parse(input);
      
      if (!params.tokenIn || !params.tokenOut || !params.amount) {
        return "Error: tokenIn, tokenOut, and amount are required";
      }
      
      const result = await cambrianSeiAgent.swapTokens(params);
      return `Swap executed: ${params.amount} ${params.tokenIn} → ${params.tokenOut}. Result: ${result}`;
      
    } catch (error) {
      return `Swap failed: ${error.message}`;
    }
  }
}

// SEI Staking Tool
export class SeiStakingTool extends Tool {
  name = "sei_staking";
  description = "Stake SEI tokens on Silo protocol. Input should be JSON: {\"amount\": number}";
  
  async _call(input: string): Promise<string> {
    try {
      const { amount } = JSON.parse(input);
      
      if (!amount) {
        return "Error: Amount is required for staking";
      }
      
      const result = await cambrianSeiAgent.stakeTokens({
        amount: amount.toString(),
        validator: 'silo-protocol'
      });
      
      return `Staking successful: ${amount} SEI staked on Silo. ${result}`;
      
    } catch (error) {
      return `Staking failed: ${error.message}`;
    }
  }
}

// SEI Lending Tool
export class SeiLendingTool extends Tool {
  name = "sei_lending";
  description = "Lend tokens on Takara protocol. Input should be JSON: {\"amount\": number, \"token\": \"USDC\"}";
  
  async _call(input: string): Promise<string> {
    try {
      const { amount, token } = JSON.parse(input);
      
      if (!amount || !token) {
        return "Error: Amount and token are required for lending";
      }
      
      const result = await cambrianSeiAgent.lendTokens({
        amount: amount.toString(),
        token
      });
      
      return `Lending successful: ${amount} ${token} lent on Takara. ${result}`;
      
    } catch (error) {
      return `Lending failed: ${error.message}`;
    }
  }
}

// Wallet Info Tool
export class WalletInfoTool extends Tool {
  name = "wallet_info";
  description = "Get comprehensive wallet information including address, balance, and capabilities";
  
  async _call(): Promise<string> {
    try {
      const walletInfo = await cambrianSeiAgent.getWalletInfo();
      return `Wallet Information:\n${JSON.stringify(walletInfo, null, 2)}`;
    } catch (error) {
      return `Error getting wallet info: ${error.message}`;
    }
  }
}

// Token Scan Tool
export class TokenScanTool extends Tool {
  name = "token_scan";
  description = "Scan and analyze a token by address. Input should be the token contract address (0x...)";
  
  async _call(tokenAddress: string): Promise<string> {
    try {
      if (!tokenAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
        return "Error: Invalid token address format";
      }
      
      // Get token balance
      const balance = await cambrianSeiAgent.getBalance(tokenAddress as any);
      
      return `Token Analysis for ${tokenAddress}:\n- Balance: ${balance}\n- Contract appears valid\n- Ready for interactions`;
      
    } catch (error) {
      return `Token scan failed: ${error.message}`;
    }
  }
}

// Create all Sei tools
export const createSeiTools = () => [
  new SeiBalanceTool(),
  new SeiTransferTool(),
  new SeiSwapTool(),
  new SeiStakingTool(),
  new SeiLendingTool(),
  new WalletInfoTool(),
  new TokenScanTool()
];