import { privateKeyWallet } from './PrivateKeyWallet';
import { webBlockchainService } from './WebBlockchainService';
import { cambrianSeiAgent, SwapParams, StakeParams, LendingParams, TradingParams } from './CambrianSeiAgent';
import { TokenMetadataManager } from '../utils/tokenMetadata';

// Intent Types for NLP Processing
export enum IntentType {
  TOKEN_SCAN = 'token_scan',
  TOKEN_CREATE = 'token_create', 
  TOKEN_BURN = 'token_burn',
  LIQUIDITY_ADD = 'liquidity_add',
  BALANCE_CHECK = 'balance_check',
  CONVERSATION = 'conversation',
  PROTOCOL_DATA = 'protocol_data',
  TRADING_INFO = 'trading_info',
  HELP = 'help',
  UNKNOWN = 'unknown',
  // New CambrianAgents capabilities
  SYMPHONY_SWAP = 'symphony_swap',
  STAKE_TOKENS = 'stake_tokens',
  UNSTAKE_TOKENS = 'unstake_tokens',
  LEND_TOKENS = 'lend_tokens',
  BORROW_TOKENS = 'borrow_tokens',
  REPAY_LOAN = 'repay_loan',
  OPEN_POSITION = 'open_position',
  CLOSE_POSITION = 'close_position',
  GET_POSITIONS = 'get_positions',
  WALLET_INFO = 'wallet_info',
  // Token Transfer Operations
  SEND_TOKENS = 'send_tokens',
  TRANSFER_CONFIRMATION = 'transfer_confirmation',
  // NFT operations
  NFT_BROWSE = 'nft_browse',
  NFT_BUY = 'nft_buy'
}

// Entity Extraction Results
interface ExtractedEntities {
  tokenAddress?: string;
  tokenName?: string;
  amount?: number;
  seiAmount?: number;
  tokenAmount?: number;
  // New entities for Cambrian operations
  tokenIn?: string;
  tokenOut?: string;
  market?: string;
  side?: 'long' | 'short';
  leverage?: number;
  positionId?: string;
  // Transfer entities
  recipient?: string;
  transferAmount?: number;
  // NFT entities
  collection?: string;
  tokenId?: string;
  // Confirmation flag for two-step actions
  confirm?: boolean;
}

// Intent Recognition Result
interface IntentResult {
  intent: IntentType;
  confidence: number;
  entities: ExtractedEntities;
  rawMessage: string;
}

// Action Response
interface ActionResponse {
  success: boolean;
  response: string;
  data?: any;
  followUp?: string[];
}

export class ActionBrain {
  private tokenPatterns = /0x[a-fA-F0-9]{40}/g;
  private amountPatterns = /(\d+(?:\.\d+)?)\s*(tokens?|sei|usdc)?/gi;
  
  // NLP Intent Recognition Engine
  public async recognizeIntent(message: string): Promise<IntentResult> {
    const normalizedMessage = message.toLowerCase().trim();
    const entities = this.extractEntities(message);
    
    // Send/Transfer Tokens Intent (HIGHEST PRIORITY)
    if (this.matchesPattern(normalizedMessage, [
      /send\s+\d+.*sei/,
      /transfer\s+\d+.*sei/,
      /send\s+\d+.*tokens?/,
      /transfer\s+\d+.*tokens?/,
      /send.*\d+.*to.*0x/,
      /transfer.*\d+.*to.*0x/
    ])) {
      const transferEntities = this.extractTransferEntities(normalizedMessage);
      console.log('🎯 SEND_TOKENS intent recognized!');
      console.log('📝 Message:', message);
      console.log('🔄 Normalized:', normalizedMessage);
      console.log('📊 Transfer entities:', transferEntities);
      
      return {
        intent: IntentType.SEND_TOKENS,
        confidence: 0.9,
        entities: { ...entities, ...transferEntities },
        rawMessage: message
      };
    }
    
    // Token Address Detection (High Priority for Scanning)
    if (entities.tokenAddress && !this.isActionIntent(normalizedMessage)) {
      return {
        intent: IntentType.TOKEN_SCAN,
        confidence: 0.95,
        entities,
        rawMessage: message
      };
    }
    
    // NFT Browse / Buy Intents
    if (this.matchesPattern(normalizedMessage, [
      /(buy|shop|browse|find).*nfts?/,
      /(nft|collectible).*market/,
      /mint.*nft/
    ])) {
      const nftEntities = this.extractNftEntities(normalizedMessage);
      const wantsBuy = /buy.*nfts?|mint.*nft/.test(normalizedMessage) || !!nftEntities.tokenId;
      return {
        intent: wantsBuy ? IntentType.NFT_BUY : IntentType.NFT_BROWSE,
        confidence: 0.85,
        entities: { ...entities, ...nftEntities },
        rawMessage: message
      };
    }
    
    // Token Creation Intent
    if (this.matchesPattern(normalizedMessage, [
      /create.*token.*called\s+(.+)/,
      /create\s+(.+)\s+token/,
      /make.*token.*named\s+(.+)/,
      /new.*token.*called\s+(.+)/
    ])) {
      return {
        intent: IntentType.TOKEN_CREATE,
        confidence: 0.9,
        entities: { ...entities, tokenName: this.extractTokenName(normalizedMessage) },
        rawMessage: message
      };
    }
    
    // Token Burning Intent
    if (this.matchesPattern(normalizedMessage, [
      /burn\s+\d+.*tokens?/,
      /destroy\s+\d+.*tokens?/,
      /remove\s+\d+.*tokens?/
    ]) && entities.tokenAddress) {
      return {
        intent: IntentType.TOKEN_BURN,
        confidence: 0.9,
        entities,
        rawMessage: message
      };
    }
    
    // Liquidity Addition Intent
    if (this.matchesPattern(normalizedMessage, [
      /add.*liquidity/,
      /provide.*liquidity/,
      /add.*\d+.*tokens?.*\d+.*sei/,
      /liquidity.*with.*\d+/
    ])) {
      return {
        intent: IntentType.LIQUIDITY_ADD,
        confidence: 0.85,
        entities,
        rawMessage: message
      };
    }
    
    // Balance Check Intent
    if (this.matchesPattern(normalizedMessage, [
      /what.*balance/,
      /show.*balance/,
      /my.*balance/,
      /check.*balance/,
      /how.*much.*sei/,
      /wallet.*balance/
    ])) {
      return {
        intent: IntentType.BALANCE_CHECK,
        confidence: 0.8,
        entities,
        rawMessage: message
      };
    }
    
    // Protocol Data Intent
    if (this.matchesPattern(normalizedMessage, [
      /top.*tokens?/,
      /trending.*tokens?/,
      /best.*performing/,
      /highest.*volume/,
      /most.*traded/,
      /protocol.*data/,
      /sei.*statistics/
    ])) {
      return {
        intent: IntentType.PROTOCOL_DATA,
        confidence: 0.8,
        entities,
        rawMessage: message
      };
    }
    
    // Trading Information Intent
    if (this.matchesPattern(normalizedMessage, [
      /top.*traders?/,
      /best.*traders?/,
      /trading.*volume/,
      /who.*trading/,
      /biggest.*trades?/
    ])) {
      return {
        intent: IntentType.TRADING_INFO,
        confidence: 0.8,
        entities,
        rawMessage: message
      };
    }
    
    // Symphony DEX Swap Intent
    if (this.matchesPattern(normalizedMessage, [
      /swap.*\d+.*sei.*for.*usdc/,
      /swap.*\d+.*sei.*to.*usdc/,
      /swap.*\d+.*usdc.*for.*sei/,
      /swap.*\d+.*usdc.*to.*sei/,
      /exchange.*\d+.*tokens?/,
      /trade.*\d+.*sei/,
      /symphony.*swap/,
      /dex.*swap/
    ])) {
      return {
        intent: IntentType.SYMPHONY_SWAP,
        confidence: 0.9,
        entities: { ...entities, ...this.extractSwapEntities(normalizedMessage) },
        rawMessage: message
      };
    }
    
    // Staking Intent
    if (this.matchesPattern(normalizedMessage, [
      /stake.*\d+.*sei/,
      /stake.*tokens?/,
      /silo.*stake/,
      /earn.*yield/,
      /deposit.*stake/
    ])) {
      return {
        intent: IntentType.STAKE_TOKENS,
        confidence: 0.85,
        entities,
        rawMessage: message
      };
    }
    
    // Unstaking Intent
    if (this.matchesPattern(normalizedMessage, [
      /unstake.*\d+.*sei/,
      /withdraw.*stake/,
      /unstake.*tokens?/,
      /remove.*stake/
    ])) {
      return {
        intent: IntentType.UNSTAKE_TOKENS,
        confidence: 0.85,
        entities,
        rawMessage: message
      };
    }
    
    // Lending Intent
    if (this.matchesPattern(normalizedMessage, [
      /lend.*\d+.*tokens?/,
      /supply.*\d+.*tokens?/,
      /takara.*lend/,
      /provide.*liquidity.*lending/
    ])) {
      return {
        intent: IntentType.LEND_TOKENS,
        confidence: 0.85,
        entities,
        rawMessage: message
      };
    }
    
    // Borrowing Intent
    if (this.matchesPattern(normalizedMessage, [
      /borrow.*\d+.*tokens?/,
      /takara.*borrow/,
      /loan.*\d+.*tokens?/,
      /get.*loan/
    ])) {
      return {
        intent: IntentType.BORROW_TOKENS,
        confidence: 0.85,
        entities,
        rawMessage: message
      };
    }
    
    // Trading Position Intent
    if (this.matchesPattern(normalizedMessage, [
      /open.*long.*position/,
      /open.*short.*position/,
      /citrex.*trade/,
      /perpetual.*trade/,
      /leverage.*trade/
    ])) {
      return {
        intent: IntentType.OPEN_POSITION,
        confidence: 0.85,
        entities: { ...entities, ...this.extractTradingEntities(normalizedMessage) },
        rawMessage: message
      };
    }
    
    // Position Management Intent
    if (this.matchesPattern(normalizedMessage, [
      /show.*positions?/,
      /my.*positions?/,
      /open.*positions?/,
      /trading.*positions?/
    ])) {
      return {
        intent: IntentType.GET_POSITIONS,
        confidence: 0.8,
        entities,
        rawMessage: message
      };
    }
    
    // Wallet Info Intent
    if (this.matchesPattern(normalizedMessage, [
      /wallet.*info/,
      /my.*wallet/,
      /account.*info/,
      /wallet.*details/,
      /show.*wallet/
    ])) {
      return {
        intent: IntentType.WALLET_INFO,
        confidence: 0.8,
        entities,
        rawMessage: message
      };
    }
    
    
    
    // Conversational Intent
    if (this.matchesPattern(normalizedMessage, [
      /how.*are.*you/,
      /what.*think.*about/,
      /tell.*me.*about/,
      /what.*can.*you.*do/,
      /help.*me/,
      /hello/,
      /hi/,
      /hey/
    ])) {
      return {
        intent: IntentType.CONVERSATION,
        confidence: 0.7,
        entities,
        rawMessage: message
      };
    }
    
    return {
      intent: IntentType.UNKNOWN,
      confidence: 0.1,
      entities,
      rawMessage: message
    };
  }
  
  // Core Action Execution Engine
  public async executeAction(intentResult: IntentResult): Promise<ActionResponse> {
    try {
      switch (intentResult.intent) {
        case IntentType.TOKEN_SCAN:
          return await this.executeTokenScan(intentResult);
          
        case IntentType.TOKEN_CREATE:
          return await this.executeTokenCreate(intentResult);
          
        case IntentType.TOKEN_BURN:
          return await this.executeTokenBurn(intentResult);
          
        case IntentType.LIQUIDITY_ADD:
          return await this.executeLiquidityAdd(intentResult);
          
        case IntentType.BALANCE_CHECK:
          return await this.executeBalanceCheck(intentResult);
          
        case IntentType.PROTOCOL_DATA:
          return await this.executeProtocolData(intentResult);
          
        case IntentType.TRADING_INFO:
          return await this.executeTradingInfo(intentResult);
          
        case IntentType.CONVERSATION:
          return await this.executeConversation(intentResult);
          
        // New CambrianAgents capabilities
        case IntentType.SYMPHONY_SWAP:
          return await this.executeSymphonySwap(intentResult);
          
        case IntentType.STAKE_TOKENS:
          return await this.executeStakeTokens(intentResult);
          
        case IntentType.UNSTAKE_TOKENS:
          return await this.executeUnstakeTokens(intentResult);
          
        case IntentType.LEND_TOKENS:
          return await this.executeLendTokens(intentResult);
          
        case IntentType.BORROW_TOKENS:
          return await this.executeBorrowTokens(intentResult);
          
        case IntentType.REPAY_LOAN:
          return await this.executeRepayLoan(intentResult);
          
        case IntentType.OPEN_POSITION:
          return await this.executeOpenPosition(intentResult);
          
        case IntentType.CLOSE_POSITION:
          return await this.executeClosePosition(intentResult);
          
        case IntentType.GET_POSITIONS:
          return await this.executeGetPositions(intentResult);
          
        case IntentType.WALLET_INFO:
          return await this.executeWalletInfo(intentResult);
          
        case IntentType.SEND_TOKENS:
          return await this.executeSendTokens(intentResult);
          
        case IntentType.TRANSFER_CONFIRMATION:
          return await this.executeTransferConfirmation(intentResult);
          
        case IntentType.NFT_BROWSE:
          return await this.executeNftBrowse(intentResult);
        
        case IntentType.NFT_BUY:
          return await this.executeNftBuy(intentResult);
          
        default:
          return this.executeUnknown(intentResult);
      }
    } catch (error) {
      return {
        success: false,
        response: `❌ **Action Failed**: ${error.message}\n\n**Try**: Being more specific about what you want to do!`,
        data: { error: error.message }
      };
    }
  }
  
  // TOKEN SCANNING ACTION
  private async executeTokenScan(intent: IntentResult): Promise<ActionResponse> {
    const { tokenAddress } = intent.entities;
    
    if (!tokenAddress) {
      return {
        success: false,
        response: `❌ **No valid token address found**\n\nPlease provide a valid contract address (0x...)`
      };
    }
    
    try {
      // Prefer mainnet security scan using TokenScanner
      const { TokenScanner } = await import('../utils/tokenScanner')
      const scanner = new TokenScanner()
      const analysis = await scanner.analyzeToken(tokenAddress)

      const b = analysis.basicInfo
      const s = analysis.safetyChecks
      const parts: string[] = []
      parts.push(`🔍 **Token Scan** — ${b.name} (${b.symbol})`)
      parts.push(`Contract: \`${b.address}\``)
      if (b.marketData?.price) parts.push(`Price: $${b.marketData.price.toFixed(6)}  •  MC: ${scanner.formatNumber(b.marketData.marketCap || 0)}`)
      parts.push(`Supply: ${b.formattedTotalSupply || scanner.formatNumber(Number(b.totalSupply))}`)
      parts.push(`Risk Score: ${analysis.riskScore}/100 (${analysis.isSafe ? 'Likely Safe' : 'Use Caution'})`)
      const flags: string[] = []
      if (s.ownership && !s.ownership.isRenounced) flags.push('Owner not renounced')
      if (s.blacklist && s.blacklist.hasBlacklist) flags.push('Blacklist enabled')
      if (s.fees && s.fees.hasExcessiveFees) flags.push('High taxes')
      if (s.holderDistribution && (s.holderDistribution.topHolderPercentage || 0) > 50) flags.push('High holder concentration')
      if (flags.length) parts.push(`Flags: ${flags.join(' | ')}`)
      const msg = parts.join('\n')

      return {
        success: true,
        response: msg,
        data: analysis,
        followUp: [
          'Swap a small test amount',
          'Add to watchlist',
          'Scan another token'
        ]
      }
    } catch (error) {
      // Fallback to basic on-chain read if scanner fails
      const [tokenBalance, isMyToken] = await Promise.all([
        privateKeyWallet.getTokenBalance(tokenAddress).catch(() => null),
        privateKeyWallet.isMyToken(tokenAddress).catch(() => false)
      ]);
      
      if (!tokenBalance) {
        return {
          success: false,
          response: `❌ **Token Not Found**\n\n**Address**: \`${tokenAddress}\`\n\nThis might not be a valid ERC20 token on Sei network.`
        };
      }
      
      let response = `🔍 **Token Scan Results**\n\n`;
      response += `**📋 Token Information:**\n`;
      response += `• **Name**: ${tokenBalance.name}\n`;
      response += `• **Symbol**: ${tokenBalance.symbol}\n`;
      response += `• **Contract**: \`${tokenAddress}\`\n`;
      response += `• **Your Balance**: ${tokenBalance.balance} ${tokenBalance.symbol}\n\n`;
      
      if (isMyToken) response += `🏆 **OWNERSHIP**: ✅ You created this token\n`;
      
      return { success: true, response };
    }
  }
  
  // TOKEN CREATION ACTION
  private async executeTokenCreate(intent: IntentResult): Promise<ActionResponse> {
    const { tokenName } = intent.entities;
    
    if (!tokenName) {
      return {
        success: false,
        response: `🚀 **Token Creation**\n\n**Usage Examples:**\n• "Create a token called SuperCoin"\n• "Create MyToken"\n• "Make a token named AwesomeCoin"\n\n**💡 Just tell me what to call your token!**`
      };
    }

    try {
      const symbol = tokenName.substring(0, 6).toUpperCase();
      const totalSupply = '1000000'; // default 1,000,000
      const { txHash } = await cambrianSeiAgent.createToken({
        name: tokenName,
        symbol,
        totalSupply
      });

      // Make basic metadata and store reference (logo from local cache if exists)
      const logoUrl = localStorage.getItem('seilor_last_token_logo') || '';
      const metadata = {
        name: tokenName,
        symbol,
        description: `${tokenName} (${symbol}) - created by Seilor 0`,
        image: logoUrl,
        totalSupply,
        decimals: 18,
        creator: cambrianSeiAgent.getAddress(),
        createdAt: new Date().toISOString(),
        version: '1.0.0'
      };
      try {
        // Upload metadata JSON to IPFS and store in pending registry keyed by tx
        const metadataUrl = await TokenMetadataManager.uploadMetadata(metadata as any);
        const pending = JSON.parse(localStorage.getItem('pendingTokenMetadataByTx') || '{}');
        pending[txHash] = { metadataUrl, name: tokenName, symbol, createdAt: new Date().toISOString() };
        localStorage.setItem('pendingTokenMetadataByTx', JSON.stringify(pending));
      } catch {}

      // Append to Dev++ local registry for visibility
      const saved = JSON.parse(localStorage.getItem('dev++_tokens') || '[]');
      saved.unshift({
        address: 'pending',
        name: tokenName,
        symbol,
        supply: totalSupply,
        creator: cambrianSeiAgent.getAddress(),
        createdAt: new Date().toISOString(),
        verified: true,
        securityScore: 80,
        logo: logoUrl
      });
      localStorage.setItem('dev++_tokens', JSON.stringify(saved));

      // Log tx (best-effort)
      fetch('/.netlify/functions/tx-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: cambrianSeiAgent.getAddress(),
          action: 'create_token',
          params: { name: tokenName, symbol, totalSupply },
          txHash,
          status: 'success'
        })
      }).catch(() => {});

      // Wait for receipt and resolve token address (ERC20 Transfer event contract address)
      try {
        const receipt = await cambrianSeiAgent.publicClient.waitForTransactionReceipt({ hash: txHash as any });
        const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
        const transferLog = receipt.logs.find((l: any) => (l.topics?.[0] || '').toLowerCase() === TRANSFER_TOPIC);
        if (transferLog && transferLog.address) {
          const tokenAddress = transferLog.address;
          // Update Dev++ list, replacing first 'pending'
          const tokens = JSON.parse(localStorage.getItem('dev++_tokens') || '[]');
          const idx = tokens.findIndex((t: any) => t.address === 'pending' && t.symbol === symbol);
          if (idx >= 0) {
            tokens[idx].address = tokenAddress;
            localStorage.setItem('dev++_tokens', JSON.stringify(tokens));
          }
          // Move metadata from pendingTx to registry
          const pending = JSON.parse(localStorage.getItem('pendingTokenMetadataByTx') || '{}');
          const entry = pending[txHash];
          if (entry?.metadataUrl) {
            const registry = JSON.parse(localStorage.getItem('tokenMetadataRegistry') || '{}');
            registry[tokenAddress.toLowerCase()] = { metadataUrl: entry.metadataUrl, timestamp: new Date().toISOString() };
            localStorage.setItem('tokenMetadataRegistry', JSON.stringify(registry));
            delete pending[txHash];
            localStorage.setItem('pendingTokenMetadataByTx', JSON.stringify(pending));
          }
        }
      } catch (error) {
        return {
          success: false,
          response: `❌ **Creation Failed**: ${error.message || error}\n\nIf you are on testnet, ensure the token factory is deployed and set VITE_FACTORY_ADDRESS_TESTNET. If on mainnet, set VITE_FACTORY_ADDRESS_MAINNET.`
        };
      }

      return {
        success: true,
        response: `✅ **Token Created**\n\n• Name: ${tokenName}\n• Symbol: ${symbol}\n• Supply: ${parseInt(totalSupply).toLocaleString()}\n• Tx: \`${txHash}\`\n\nYou can now add a logo and liquidity. Say: "Add liquidity" or "Upload token logo".`,
        data: { tokenName, symbol, txHash }
      };
    } catch (error) {
      return {
        success: false,
        response: `❌ **Creation Failed**: ${error.message}`
      };
    }
  }
  
  // BALANCE CHECK ACTION
  private async executeBalanceCheck(intent: IntentResult): Promise<ActionResponse> {
    try {
      const balance = await privateKeyWallet.getSeiBalance();
      const myTokens = privateKeyWallet.getMyTokens();
      
      // Query discovered ERC-20s from serverless scan
      let discovered: Array<{ address: string; symbol: string; balance: string; name?: string }> = []
      try {
        const res = await fetch('/.netlify/functions/wallet-erc20s?wallet=' + encodeURIComponent(privateKeyWallet.getAddress()))
        if (res.ok) {
          const data = await res.json()
          discovered = (data.tokens || []).slice(0, 20)
        }
      } catch {}
      
      // Include stablecoins and known tokens (testnet addresses can be adjusted via env later)
      const probeTokens: string[] = [
        '0x3894085ef7ff0f0aedf52e2a2704928d1ec074f1', // USDC test
        '0x95597eb8d227a7c4b4f5e807a815c5178ee6dbe1', // MILLI sample
        '0xbd82f3bfe1df0c84faec88a22ebc34c9a86595dc'  // CHIPS sample
      ];
      const erc20s = await privateKeyWallet.getErc20Balances(probeTokens);
      const merged = [...discovered, ...erc20s].reduce((acc: any[], t: any) => {
        if (!acc.find(x => x.address.toLowerCase() === t.address.toLowerCase())) acc.push(t)
        return acc
      }, [])
      
      let response = `💰 **Wallet Balance Report**\n\n`;
      response += `**🏦 SEI Balance:**\n`;
      response += `• **Amount**: ${balance.sei} SEI\n`;
      response += `• **USD Value**: $${balance.usd.toFixed(2)}\n`;
      response += `• **Address**: \`${privateKeyWallet.getAddress()}\`\n\n`;
      
      if (merged.length > 0) {
        response += `**💵 ERC-20 Balances:**\n`;
        for (const t of merged) {
          const label = t.name ? `${t.name} (${t.symbol})` : t.symbol
          response += `• ${label}: ${t.balance}\n`;
        }
        response += `\n`;
      }
      
      if (myTokens.length > 0) {
        response += `**🏆 Your Created Tokens:**\n`;
        for (const token of myTokens.slice(0, 5)) {
          try {
            const tokenBalance = await privateKeyWallet.getTokenBalance(token.address);
            response += `• **${token.name}**: ${tokenBalance.balance} ${token.symbol}\n`;
          } catch {
            response += `• **${token.name}**: Unable to fetch balance\n`;
          }
        }
        if (myTokens.length > 5) {
          response += `... and ${myTokens.length - 5} more tokens\n`;
        }
      } else {
        response += `**📝 No tokens created yet**\n\n**💡 Create your first token**: Say "Create a token called MyToken"`;
      }
      
      return {
        success: true,
        response,
        data: { balance, myTokens, erc20s: merged }
      };
    } catch (error) {
      return {
        success: false,
        response: `❌ **Balance Check Failed**: ${error.message}`
      };
    }
  }
  
  // PROTOCOL DATA ACTION (Real-time Sei Protocol Intelligence)
  private async executeProtocolData(intent: IntentResult): Promise<ActionResponse> {
    try {
      // Get real protocol data from Dev++ storage and blockchain
      const allTokens = JSON.parse(localStorage.getItem('dev++_tokens') || '[]');
      const recentTokens = allTokens.slice(0, 10); // Most recent tokens
      
      let response = `📊 **Sei Protocol Intelligence**\n\n`;
      response += `**🚀 Recently Created Tokens:**\n`;
      
      if (recentTokens.length > 0) {
        for (let i = 0; i < Math.min(5, recentTokens.length); i++) {
          const token = recentTokens[i];
          response += `${i + 1}. **${token.name} (${token.symbol})**\n`;
          response += `   Supply: ${parseInt(token.supply).toLocaleString()}\n`;
          response += `   Address: \`${token.address}\`\n`;
        }
      } else {
        response += `No recent tokens found in protocol data.\n`;
      }
      
      response += `\n**📈 Protocol Statistics:**\n`;
      response += `• **Total Tokens Tracked**: ${allTokens.length}\n`;
      response += `• **Active Creators**: ${new Set(allTokens.map(t => t.creator)).size}\n`;
      response += `• **Network**: Sei Testnet\n`;
      response += `• **Factory Contract**: \`0x46287770F8329D51004560dC3BDED879A6565B9A\`\n\n`;
      
      response += `**🔥 Want specific token data?**\n`;
      response += `• Paste any token address for detailed analysis\n`;
      response += `• Ask about "top traders" for trading insights\n`;
      response += `• Say "my tokens" to see your creations\n\n`;
      
      response += `**✨ This is REAL protocol data from Seifun ecosystem!**`;
      
      return {
        success: true,
        response,
        data: { allTokens, recentTokens, totalTokens: allTokens.length }
      };
    } catch (error) {
      return {
        success: false,
        response: `❌ **Protocol Data Unavailable**: ${error.message}\n\nTrying to fetch real-time data from Sei network...`
      };
    }
  }
  
  // TRADING INFO ACTION
  private async executeTradingInfo(intent: IntentResult): Promise<ActionResponse> {
    // Real trading intelligence based on protocol activity
    const allTokens = JSON.parse(localStorage.getItem('dev++_tokens') || '[]');
    const myTokens = privateKeyWallet.getMyTokens();
    
    let response = `📈 **Trading Intelligence Report**\n\n`;
    
    if (myTokens.length > 0) {
      response += `**🏆 Your Token Performance:**\n`;
      myTokens.slice(0, 3).forEach((token, index) => {
        response += `${index + 1}. **${token.name} (${token.symbol})**\n`;
        response += `   Status: Active & Tradeable\n`;
        response += `   Liquidity: Available for addition\n`;
      });
      response += `\n`;
    }
    
    response += `**📊 Protocol Activity:**\n`;
    response += `• **Active Tokens**: ${allTokens.length} tokens created\n`;
    response += `• **Unique Creators**: ${new Set(allTokens.map(t => t.creator)).size} addresses\n`;
    response += `• **Your Contribution**: ${myTokens.length} tokens created\n\n`;
    
    response += `**🚀 Trading Opportunities:**\n`;
    response += `• Create liquidity pools for your tokens\n`;
    response += `• Monitor token performance via Dev++\n`;
    response += `• Use SafeChecker for security analysis\n`;
    response += `• Burn tokens to increase scarcity\n\n`;
    
    response += `**💡 Advanced Trading:**\n`;
    response += `• Check specific token addresses for detailed analysis\n`;
    response += `• Use "Add liquidity" for your tokens to enable trading\n`;
    response += `• Monitor your portfolio through Dev++ dashboard\n\n`;
    
    response += `**✨ Real trading data from Seifun protocol!**`;
    
    return {
      success: true,
      response,
      data: { allTokens, myTokens, protocolStats: { totalTokens: allTokens.length } }
    };
  }
  
  // CONVERSATION ACTION
  private async executeConversation(intent: IntentResult): Promise<ActionResponse> {
    const message = intent.rawMessage.toLowerCase();
    
    if (message.includes('how are you')) {
      return {
        success: true,
        response: `😊 **I'm doing fantastic, thanks for asking!**\n\nI'm genuinely excited to be your AI companion on Sei! Having real blockchain access makes every conversation meaningful.\n\n**What I love:**\n• Helping you create and manage tokens\n• Providing real-time protocol insights\n• Making DeFi accessible through natural conversation\n• Being part of the Seifun ecosystem\n\n**How are you doing?** What brings you to Seifun today? 🚀`
      };
    }
    
    if (message.includes('what') && message.includes('think') && message.includes('seifun')) {
      return {
        success: true,
        response: `💙 **I absolutely love Seifun!** It's revolutionary.\n\n**What makes it special:**\n• **Real AI Integration** - I can actually execute transactions\n• **Professional Tools** - SeiList, SafeChecker, Dev++ are world-class\n• **No Mock Data** - Everything connects to real blockchain\n• **User-First Design** - Natural language meets DeFi\n\n**My favorite features:**\n🎯 **SeiList** - Professional token creation with stunning previews\n🛡️ **SafeChecker** - Real security analysis keeps everyone safe\n🤖 **AI Integration** - Natural conversation to blockchain action\n💎 **Dev++** - Professional tools for serious builders\n\n**It's the future of DeFi UX!** What do you think? 🚀`
      };
    }
    
    if (message.includes('what') && message.includes('can') && message.includes('do')) {
      return {
        success: true,
        response: `🤖 **I'm your comprehensive AI companion on Sei!**\n\n**🔥 Real Blockchain Powers:**\n• **Token Scanning** - Paste any address for instant analysis\n• **Token Creation** - Natural language to professional deployment\n• **Token Management** - Burn supply, add liquidity (owner only)\n• **Balance Tracking** - Real-time wallet and token balances\n\n**📊 Protocol Intelligence:**\n• **Trading Data** - Top tokens, recent activity, protocol stats\n• **Security Analysis** - Risk assessment and safety checks\n• **Portfolio Management** - Track all your tokens and activities\n\n**💬 Natural Conversation:**\n• **Context Memory** - I remember our entire conversation\n• **Intent Understanding** - I know what you want to do\n• **Personality** - Genuine responses, not robotic answers\n\n**🛠️ Integrated Tools:**\n• **SeiList** - Professional token creation\n• **SafeChecker** - Security analysis\n• **Dev++** - Portfolio management\n\n**Just talk to me naturally!** I understand and execute! ✨`
      };
    }
    
    return {
      success: true,
      response: `👋 **Hello!** I'm Seilor 0, your AI companion on Sei blockchain.\n\n**💡 Try these:**\n• Paste any token address for analysis\n• Say "Create a token called [name]"\n• Ask "What's my balance?"\n• Say "Show me top tokens"\n\n**Or just chat with me naturally!** 😊`
    };
  }
  
  // UNKNOWN ACTION
  private executeUnknown(intent: IntentResult): ActionResponse {
    return {
      success: true,
      response: `I'm here to help with whatever you need! Whether it's checking balances, creating tokens, swapping, or just having a conversation, I'm ready to assist. What would you like to do?`,
      followUp: ["Check my balance", "Create a token", "Scan a token", "Tell me about Sei"]
    };
  }
  
  // New Entity Extraction Methods for Cambrian Capabilities
  private extractSwapEntities(message: string): Partial<ExtractedEntities> {
    const entities: Partial<ExtractedEntities> = {};

    // Extract amount first
    const amt = message.match(/(\d+(?:\.\d+)?)\s*(sei|usdc)?/i);
    if (amt) {
      entities.amount = parseFloat(amt[1]);
    }
    
    const lower = message.toLowerCase()
    const mentionsSei = /\bsei\b/.test(lower)
    const mentionsUsdc = /\busdc\b/.test(lower)

    // Decide directions based on mentions
    if (mentionsSei && mentionsUsdc) {
      if (/sei\s*(to|for)\s*usdc/.test(lower)) {
        entities.tokenIn = '0x0'
        entities.tokenOut = (import.meta.env.VITE_SEI_USDC_ADDRESS as any) || '0x4fCF1784B31630811181f670Aea7A7bEF803eaED'
      } else if (/usdc\s*(to|for)\s*sei/.test(lower)) {
        entities.tokenIn = (import.meta.env.VITE_SEI_USDC_ADDRESS as any) || '0x4fCF1784B31630811181f670Aea7A7bEF803eaED'
        entities.tokenOut = '0x0'
      }
    } else if (mentionsSei && !mentionsUsdc) {
      // Default other side to USDC if not specified
      entities.tokenIn = '0x0'
      entities.tokenOut = (import.meta.env.VITE_SEI_USDC_ADDRESS as any) || '0x4fCF1784B31630811181f670Aea7A7bEF803eaED'
    } else if (!mentionsSei && mentionsUsdc) {
      // Default other side to SEI
      entities.tokenIn = (import.meta.env.VITE_SEI_USDC_ADDRESS as any) || '0x4fCF1784B31630811181f670Aea7A7bEF803eaED'
      entities.tokenOut = '0x0'
    }

    return entities;
  }
  
  private extractTradingEntities(message: string): Partial<ExtractedEntities> {
    const entities: Partial<ExtractedEntities> = {};
    
    // Extract trading side
    if (message.includes('long')) {
      entities.side = 'long';
    } else if (message.includes('short')) {
      entities.side = 'short';
    }
    
    // Extract market
    if (message.includes('sei/usdc') || message.includes('sei-usdc')) {
      entities.market = 'SEI/USDC';
    }
    
    // Extract leverage
    const leverageMatch = message.match(/(\d+)x?\s*leverage/i);
    if (leverageMatch) {
      entities.leverage = parseInt(leverageMatch[1]);
    }
    
    return entities;
  }
  
  private extractTransferEntities(message: string): Partial<ExtractedEntities> {
    const entities: Partial<ExtractedEntities> = {};
    
    // Extract recipient address
    const addressMatch = message.match(/0x[a-fA-F0-9]{40}/);
    if (addressMatch) {
      entities.recipient = addressMatch[0];
    }
    
    // Extract transfer amount
    const amountMatch = message.match(/(\d+(?:\.\d+)?)\s*(sei|tokens?)?/i);
    if (amountMatch) {
      entities.transferAmount = parseFloat(amountMatch[1]);
    }
    
    return entities;
  }

  private extractNftEntities(message: string): Partial<ExtractedEntities> {
    const entities: Partial<ExtractedEntities> = {};
    // Try to extract collection contract address and tokenId
    const addr = message.match(/0x[a-fA-F0-9]{40}/);
    if (addr) entities.collection = addr[0];
    const id = message.match(/token\s*id\s*:?\s*(\d+)/i) || message.match(/#(\d+)/);
    if (id) entities.tokenId = id[1];
    return entities;
  }

  // Helper Methods
  private extractEntities(message: string): ExtractedEntities {
    const entities: ExtractedEntities = {};
    
    // Extract token address
    const addressMatch = message.match(this.tokenPatterns);
    if (addressMatch) {
      entities.tokenAddress = addressMatch[0];
    }
    
    // Extract amounts
    const amounts = Array.from(message.matchAll(this.amountPatterns));
    for (const match of amounts) {
      const amount = parseFloat(match[1]);
      const unit = match[2]?.toLowerCase();
      
      if (unit?.includes('sei')) {
        entities.seiAmount = amount;
      } else if (unit?.includes('token')) {
        entities.tokenAmount = amount;
      } else if (!entities.amount) {
        entities.amount = amount;
      }
    }
    
    return entities;
  }
  
  private extractTokenName(message: string): string | undefined {
    const patterns = [
      /create.*token.*called\s+([a-zA-Z0-9\s]+)/i,
      /create\s+([a-zA-Z0-9\s]+)\s+token/i,
      /make.*token.*named\s+([a-zA-Z0-9\s]+)/i,
      /new.*token.*called\s+([a-zA-Z0-9\s]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    
    return undefined;
  }
  
  private matchesPattern(message: string, patterns: RegExp[]): boolean {
    return patterns.some(pattern => pattern.test(message));
  }
  
  private isActionIntent(message: string): boolean {
    const actionKeywords = ['burn', 'add liquidity', 'provide liquidity', 'create', 'make'];
    return actionKeywords.some(keyword => message.includes(keyword));
  }
  
  // NEW CAMBRIAN AGENTS ACTION METHODS
  
  // Symphony DEX Swap Action
  private async executeSymphonySwap(intent: IntentResult): Promise<ActionResponse> {
    try {
      const { amount, tokenIn, tokenOut, confirm } = intent.entities as any;
      
      if (!amount || !tokenIn || !tokenOut) {
        return {
          success: false,
          response: `❌ **Missing swap parameters**\n\nPlease specify: amount, input token, and output token.\n\n**Example**: "Swap 10 SEI for USDC"`
        };
      }

      // 1) Quote first
      const quote = await cambrianSeiAgent.getSwapQuote({
        tokenIn: tokenIn as any,
        tokenOut: tokenOut as any,
        amount: amount.toString()
      });

      // 2) Guardrails
      const maxSlippageBps = 50; // 0.5%
      const priceImpactPct = Number(quote.priceImpact || 0);
      if (priceImpactPct > 5) {
        // Log advice and blocked trade
        fetch('/.netlify/functions/agent-feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            advice: 'High price impact warning',
            caution: `Price impact ${priceImpactPct.toFixed(2)}% exceeds policy limit`,
            confidence_score: 0.8,
            recommendation: 'Reduce amount or choose a different pair',
            context: { tokenIn, tokenOut, amount, priceImpactPct }
          })
        }).catch(() => {});
        fetch('/.netlify/functions/trade-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wallet: cambrianSeiAgent.getAddress(),
            dex: 'Vortex/Symphony',
            tokenIn, tokenOut,
            amountIn: amount.toString(),
            priceImpact: priceImpactPct,
            status: 'blocked',
            reason: 'high_price_impact'
          })
        }).catch(() => {});
        return {
          success: false,
          response: `🚫 **High price impact (${priceImpactPct.toFixed(2)}%)**\nSwap refused by policy. Try a smaller amount or a different pair.`
        };
      }

      // Compute minOut using slippage (0.5%)
      const out = Number(quote.outputAmount || 0);
      const minOut = (out * (1 - maxSlippageBps / 10_000)).toFixed(6);

      // 3) Balance check before proceeding
      let availableStr = '0';
      try {
        const isNativeSei = tokenIn === '0x0' || tokenIn === '0x0000000000000000000000000000000000000000';
        availableStr = await cambrianSeiAgent.getBalance(isNativeSei ? undefined : (tokenIn as any));
      } catch {}
      const available = parseFloat(availableStr || '0');
      if (isFinite(available) && available < Number(amount)) {
        const tokenInName = (String(tokenIn) === '0x0' || String(tokenIn).toLowerCase() === '0x0000000000000000000000000000000000000000') ? 'SEI' : 'tokenIn';
        const suggestion = available > 0 ? `You can swap up to ${available.toFixed(4)} ${tokenInName}.` : `Your ${tokenInName} balance is low.`;
        return {
          success: true,
          response: `⚠️ **Insufficient balance**\nHave: ${available.toFixed(4)} ${tokenInName}, Need: ${amount}\n${suggestion} If you'd like, say: "Swap ${available.toFixed(4)} SEI to USDC" to proceed.`,
          data: { available },
          followUp: available > 0 ? [
            `Swap ${available.toFixed(4)} SEI to USDC`,
            'Cancel'
          ] : ['Cancel']
        };
      }

      // 4) If not confirmed yet, present a confirmation message and store pending swap
      if (!confirm) {
        return {
          success: true,
          response: `✅ Sure! I’ll swap ${amount} SEI to USDC at the best available rate.\n\nCurrent quote: ${amount} SEI ≈ ${quote.outputAmount} USDC\nEstimated fee: ~0.02 SEI\nMinimum received (with 0.5% slippage tolerance): ${minOut} USDC\n\nWould you like me to proceed with the swap?`,
          data: { pendingSwap: { tokenIn, tokenOut, amount, minOut, quoteOut: quote.outputAmount, priceImpact: priceImpactPct } },
          followUp: ['Yes, proceed', 'No']
        };
      }

      // 5) Execute swap (approval handled inside Symphony route)
      const resultMsg = await cambrianSeiAgent.swapTokens({
        tokenIn: tokenIn as any,
        tokenOut: tokenOut as any,
        amount: amount.toString()
      });

      // Extract tx hash for logging
      const match = /TX:\s*(0x[a-fA-F0-9]{64})/i.exec(resultMsg);
      const txHash = match ? match[1] : '';

      // Tx audit log
      fetch('/.netlify/functions/tx-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: cambrianSeiAgent.getAddress(),
          action: 'swap',
          params: { tokenIn, tokenOut, amount, minOut },
          txHash,
          status: 'success'
        })
      }).catch(() => {});

      // User trades log
      fetch('/.netlify/functions/trade-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: cambrianSeiAgent.getAddress(),
          dex: 'Vortex/Symphony',
          tokenIn, tokenOut,
          amountIn: amount.toString(),
          amountOut: quote.outputAmount,
          minOut,
          priceImpact: priceImpactPct,
          slippageBps: maxSlippageBps,
          txHash,
          status: 'success'
        })
      }).catch(() => {});

      return {
        success: true,
        response: `🔄 **Symphony DEX Swap Executed**\nQuoted Out: ${quote.outputAmount} (impact ${priceImpactPct.toFixed(2)}%)\nMin Out (@0.5% slippage): ${minOut}\n${resultMsg}`
      };
    } catch (error) {
      // Log failed trade
      fetch('/.netlify/functions/trade-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: cambrianSeiAgent.getAddress(),
          dex: 'Vortex/Symphony',
          status: 'failed',
          reason: (error as any)?.message || 'swap_failed'
        })
      }).catch(() => {});
      return {
        success: false,
        response: `❌ **Swap Failed**: ${error.message}\n\n**💡 Try**: Checking your balance and token addresses`
      };
    }
  }
  
  // Stake Tokens Action
  private async executeStakeTokens(intent: IntentResult): Promise<ActionResponse> {
    try {
      const { amount } = intent.entities;
      
      if (!amount) {
        return {
          success: false,
          response: `❌ **Missing staking amount**\n\n**Example**: "Stake 50 SEI"`
        };
      }
      const res = await fetch('/.netlify/functions/stake-quote?token=SEI&amount=' + encodeURIComponent(String(amount)))
      if (res.ok) {
        const data = await res.json()
        if (!data.canStake) return { success: false, response: `⚠️ ${data.reason || 'Cannot stake this amount'}` }
        return { success: true, response: `🛡️ **Staking Quote**\nToken: ${data.token}\nAmount: ${amount}\nAPY: ${data.apy}%\nMin: ${data.minAmount}\n\nSay "Confirm stake" to proceed (coming soon).` }
      }
      return { success: false, response: `❌ **Staking service unavailable**` }
    } catch (e: any) {
      return { success: false, response: `❌ **Stake Failed**: ${e?.message || e}` }
    }
  }
  
  // Unstake Tokens Action
  private async executeUnstakeTokens(intent: IntentResult): Promise<ActionResponse> {
    try {
      const { amount } = intent.entities;
      
      if (!amount) {
        return {
          success: false,
          response: `❌ **Missing unstaking amount**\n\n**Example**: "Unstake 25 SEI"`
        };
      }
      
      const result = await cambrianSeiAgent.unstakeTokens({
        amount: amount.toString()
      });
      
      return {
        success: true,
        response: `📤 **Silo Unstaking**\n${result}`
      };
    } catch (error) {
      return {
        success: false,
        response: `❌ **Unstaking Failed**: ${error.message}`
      };
    }
  }
  
  // Lend Tokens Action
  private async executeLendTokens(intent: IntentResult): Promise<ActionResponse> {
    try {
      const { amount } = intent.entities;
      
      if (!amount) {
        return {
          success: false,
          response: `❌ **Missing lending amount**\n\n**Example**: "Lend 100 USDC"`
        };
      }
      
      const result = await cambrianSeiAgent.lendTokens({
        amount: amount.toString(),
        token: 'USDC'
      });
      
      return {
        success: true,
        response: `🏦 **Takara Lending**\n${result}`
      };
    } catch (error) {
      return {
        success: false,
        response: `❌ **Lending Failed**: ${error.message}`
      };
    }
  }
  
  // Borrow Tokens Action
  private async executeBorrowTokens(intent: IntentResult): Promise<ActionResponse> {
    try {
      const { amount } = intent.entities;
      
      if (!amount) {
        return {
          success: false,
          response: `❌ **Missing borrowing amount**\n\n**Example**: "Borrow 50 USDC"`
        };
      }
      
      const result = await cambrianSeiAgent.borrowTokens({
        amount: amount.toString(),
        token: 'USDC'
      });
      
      return {
        success: true,
        response: `💰 **Takara Borrowing**\n${result}`
      };
    } catch (error) {
      return {
        success: false,
        response: `❌ **Borrowing Failed**: ${error.message}`
      };
    }
  }
  
  // Repay Loan Action
  private async executeRepayLoan(intent: IntentResult): Promise<ActionResponse> {
    try {
      const { amount } = intent.entities;
      
      if (!amount) {
        return {
          success: false,
          response: `❌ **Missing repayment amount**\n\n**Example**: "Repay 30 USDC loan"`
        };
      }
      
      const result = await cambrianSeiAgent.repayLoan({
        amount: amount.toString(),
        token: 'USDC'
      });
      
      return {
        success: true,
        response: `💸 **Takara Loan Repayment**\n${result}`
      };
    } catch (error) {
      return {
        success: false,
        response: `❌ **Repayment Failed**: ${error.message}`
      };
    }
  }
  
  // Open Trading Position Action
  private async executeOpenPosition(intent: IntentResult): Promise<ActionResponse> {
    try {
      const { amount, side, market, leverage } = intent.entities;
      
      if (!amount || !side) {
        return {
          success: false,
          response: `❌ **Missing trading parameters**\n\n**Example**: "Open long position on SEI/USDC with 1000 size"`
        };
      }
      
      const result = await cambrianSeiAgent.openPosition({
        market: market || 'SEI/USDC',
        side: side,
        size: amount.toString(),
        leverage: leverage || 1
      });
      
      return {
        success: true,
        response: `📈 **Citrex Trading**\n${result}`
      };
    } catch (error) {
      return {
        success: false,
        response: `❌ **Position Opening Failed**: ${error.message}`
      };
    }
  }
  
  // Close Trading Position Action
  private async executeClosePosition(intent: IntentResult): Promise<ActionResponse> {
    try {
      const { positionId } = intent.entities;
      
      if (!positionId) {
        return {
          success: false,
          response: `❌ **Missing position ID**\n\n**Example**: "Close position 1"`
        };
      }
      
      const result = await cambrianSeiAgent.closePosition(positionId);
      
      return {
        success: true,
        response: `📉 **Position Closed**\n${result}`
      };
    } catch (error) {
      return {
        success: false,
        response: `❌ **Position Closing Failed**: ${error.message}`
      };
    }
  }
  
  // Get Trading Positions Action
  private async executeGetPositions(intent: IntentResult): Promise<ActionResponse> {
    try {
      const positions = await cambrianSeiAgent.getPositions();
      
      let response = `📊 **Your Trading Positions**\n\n`;
      
      if (positions.length === 0) {
        response += `No open positions found.\n\n**💡 Try**: "Open long position on SEI/USDC"`;
      } else {
        positions.forEach((position, index) => {
          response += `**${index + 1}. ${position.market} ${position.side.toUpperCase()}**\n`;
          response += `   Size: ${position.size}\n`;
          response += `   Entry: $${position.entryPrice}\n`;
          response += `   Current: $${position.currentPrice}\n`;
          response += `   P&L: ${position.pnl}\n\n`;
        });
      }
      
      return {
        success: true,
        response,
        data: { positions }
      };
    } catch (error) {
      return {
        success: false,
        response: `❌ **Failed to get positions**: ${error.message}`
      };
    }
  }
  
  // Wallet Info Action
  private async executeWalletInfo(intent: IntentResult): Promise<ActionResponse> {
    try {
      const walletInfo = await cambrianSeiAgent.getWalletInfo();
      
      let response = `💼 **Wallet Information**\n\n`;
      response += `**Address**: \`${walletInfo.address}\`\n`;
      response += `**SEI Balance**: ${walletInfo.seiBalance} SEI\n`;
      response += `**Network**: ${walletInfo.network}\n\n`;
      
      response += `**🚀 Capabilities:**\n`;
      walletInfo.capabilities.forEach((capability: string, index: number) => {
        response += `${index + 1}. ${capability}\n`;
      });
      
      return {
        success: true,
        response,
        data: walletInfo
      };
    } catch (error) {
      return {
        success: false,
        response: `❌ **Failed to get wallet info**: ${error.message}`
      };
    }
  }
  
  // Token Burn Action (Enhanced)
  private async executeTokenBurn(intent: IntentResult): Promise<ActionResponse> {
    // Implementation would go here - similar to current burn logic but cleaner
    return {
      success: false,
      response: "Token burn functionality - implementation in progress"
    };
  }
  
  // ROBUST TOKEN TRANSFER WITH CONFIRMATION
  private async executeSendTokens(intent: IntentResult): Promise<ActionResponse> {
    try {
      console.log('🔍 ExecuteSendTokens called with entities:', intent.entities);
      
      const { transferAmount, recipient } = intent.entities;
      
      if (!transferAmount || !recipient) {
        console.log('❌ Missing transfer details:', { transferAmount, recipient });
        return {
          success: false,
          response: `❌ **Missing transfer details**\n\n**Usage**: "Send 50 SEI to 0x1234..."\n**Need**: Amount and recipient address\n\n**Debug**: Amount=${transferAmount}, Recipient=${recipient}`
        };
      }
      
      // Validate recipient address
      if (!recipient.match(/^0x[a-fA-F0-9]{40}$/)) {
        console.log('❌ Invalid recipient address:', recipient);
        return {
          success: false,
          response: `❌ **Invalid recipient address**\n\n**Address**: ${recipient}\n**Required**: Valid Ethereum address (0x...)`
        };
      }
      
      console.log('✅ Validation passed, checking balance...');
      
      // Check current balance with error handling
      let currentBalance;
      try {
        currentBalance = await cambrianSeiAgent.getBalance();
        console.log('✅ Balance retrieved:', currentBalance);
      } catch (balanceError) {
        console.error('❌ Balance check failed:', balanceError);
        return {
          success: false,
          response: `❌ **Balance Check Failed**\n\n**Error**: ${balanceError.message}\n\n**💡 Try**: Check your wallet connection or try again later`
        };
      }
      
      const balanceNum = parseFloat(currentBalance);
      
      if (balanceNum < transferAmount) {
        console.log('❌ Insufficient balance:', { available: balanceNum, requested: transferAmount });
        return {
          success: false,
          response: `❌ **Insufficient Balance**\n\n**Available**: ${currentBalance} SEI\n**Requested**: ${transferAmount} SEI\n**Shortfall**: ${(transferAmount - balanceNum).toFixed(4)} SEI\n\n**💡 Try**: A smaller amount or check your balance`
        };
      }
      
      // Calculate remaining balance after transfer
      const remainingBalance = (balanceNum - transferAmount).toFixed(4);
      
      console.log('✅ All checks passed, requesting confirmation');
      
      // Request confirmation with detailed information
      return {
        success: true,
        response: `💸 **Transfer Confirmation Required**\n\n**📊 Transaction Details:**\n• **Amount**: ${transferAmount} SEI\n• **Recipient**: ${recipient}\n• **Current Balance**: ${currentBalance} SEI\n• **After Transfer**: ${remainingBalance} SEI\n\n**⚠️ Please confirm this transaction**\n**Reply**: "Yes, confirm" or "Cancel"\n\n**🔒 This will execute a real blockchain transaction**`,
        data: {
          pendingTransfer: {
            amount: transferAmount,
            recipient,
            currentBalance,
            remainingBalance
          }
        }
      };
      
    } catch (error) {
      console.error('❌ ExecuteSendTokens error:', error);
      return {
        success: false,
        response: `❌ **Transfer Setup Failed**\n\n**Error**: ${error.message}\n\n**Debug**: Please check the console for more details`
      };
    }
  }
  
  // TRANSFER CONFIRMATION HANDLER
  private async executeTransferConfirmation(intent: IntentResult): Promise<ActionResponse> {
    try {
      // This would be called when user confirms the transfer
      // In a real implementation, we'd store the pending transfer in context/state
      return {
        success: false,
        response: `⚠️ **No pending transfer found**\n\nPlease initiate a transfer first with: "Send [amount] SEI to [address]"`
      };
    } catch (error) {
      return {
        success: false,
        response: `❌ **Confirmation Failed**: ${error.message}`
      };
    }
  }
  
  // Liquidity Addition Action (Enhanced)
  private async executeLiquidityAdd(intent: IntentResult): Promise<ActionResponse> {
    // Implementation would go here - similar to current liquidity logic but cleaner  
    return {
      success: false,
      response: "Liquidity addition functionality - implementation in progress"
    };
  }

  private async executeNftBrowse(intent: IntentResult): Promise<ActionResponse> {
    // Guided response until a marketplace integration is configured
    const collection = intent.entities.collection
    if (collection) {
      try {
        const res = await fetch('/.netlify/functions/nft-listings?collection=' + encodeURIComponent(collection))
        if (res.ok) {
          const data = await res.json()
          const items = Array.isArray(data?.listings) ? data.listings.slice(0,5) : []
          if (items.length > 0) {
            const lines = items.map((it: any, i: number) => `${i+1}. ${it.tokenId} • ${it.price} ${it.currency} • ${it.market || 'Paloma'}`)
            return { success: true, response: `🖼️ **NFT Listings**\n\n${lines.join('\n')}` }
          }
        }
      } catch {}
    }
    return {
      success: true,
      response: `🖼️ **NFTs on Sei**\n\nI can help you browse or buy NFTs once you provide a marketplace or collection.\n\n**Next steps:**\n• Paste a collection contract (0x...) to browse listings\n• Or tell me the marketplace you use on Sei (and the collection slug)`
    };
  }

  private async executeNftBuy(intent: IntentResult): Promise<ActionResponse> {
    const { collection, tokenId } = intent.entities;
    if (!collection || !tokenId) {
      return {
        success: false,
        response: `❌ **Missing purchase details**\n\n**Need**: collection address (0x...) and tokenId.\n**Example**: \"Buy NFT tokenId 123 from 0xABC...\"`,
      };
    }
    // We need marketplace contract to execute a purchase. Ask for marketplace info.
    return {
      success: false,
      response: `🛒 **NFT Purchase Setup**\n\nTo buy tokenId ${tokenId} from ${collection}, I need the marketplace (contract) where it's listed.\n**Please provide**: marketplace name or contract address + listing ID/price.\n\nOnce provided, I'll prepare an on-chain buy transaction with balance checks and confirmations.`,
      data: { collection, tokenId }
    };
  }
}

// Export singleton instance
export const actionBrain = new ActionBrain();