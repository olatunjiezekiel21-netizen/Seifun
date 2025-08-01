const { ethers } = require('ethers');

// Test addresses to check
const testAddresses = [
  // Known working
  '0xbd82f3bfe1df0c84faec88a22ebc34c9a86595dc', // CHIPS
  '0x95597eb8d227a7c4b4f5e807a815c5178ee6dbe1', // SEIYAN
  
  // SEI native
  'sei',
  'SEI',
  '0x0000000000000000000000000000000000000000',
  
  // Test wallet addresses
  '0x50C0b92b3BC34D7FeD7Da0C48a2F16a636D95C9F', // Dev wallet
  '0xfDF1F5dA44B49a3FEf61B160A91B1241f761cf0C', // Factory contract
  
  // Random Sei addresses to test
  '0x1234567890123456789012345678901234567890', // Should be wallet or invalid
];

async function testTokenDetection() {
  console.log('🔍 Testing Token Detection on Sei Mainnet...\n');
  
  // Setup provider
  const provider = new ethers.JsonRpcProvider('https://evm-rpc.sei-apis.com');
  
  for (const address of testAddresses) {
    console.log(`\n📍 Testing: ${address}`);
    
    try {
      // Test 1: Check if it's a valid address
      let normalizedAddress;
      try {
        if (address.toLowerCase() === 'sei') {
          normalizedAddress = '0x0000000000000000000000000000000000000000';
          console.log('   ✅ Special case: SEI native token');
        } else {
          normalizedAddress = ethers.getAddress(address);
          console.log(`   ✅ Valid address: ${normalizedAddress}`);
        }
      } catch (error) {
        console.log(`   ❌ Invalid address format: ${error.message}`);
        continue;
      }
      
      // Test 2: Check if it has code (contract vs wallet)
      const code = await provider.getCode(normalizedAddress);
      if (code === '0x') {
        console.log('   📱 Type: Wallet (EOA) - no contract code');
        
        // Get balance for wallets
        try {
          const balance = await provider.getBalance(normalizedAddress);
          console.log(`   💰 Balance: ${ethers.formatEther(balance)} SEI`);
        } catch (error) {
          console.log(`   ❌ Error getting balance: ${error.message}`);
        }
      } else {
        console.log('   📜 Type: Contract - has code');
        console.log(`   📝 Code length: ${code.length} characters`);
        
        // Test 3: Try ERC20 functions
        const erc20Contract = new ethers.Contract(normalizedAddress, [
          'function name() view returns (string)',
          'function symbol() view returns (string)',
          'function decimals() view returns (uint8)',
          'function totalSupply() view returns (uint256)',
          'function balanceOf(address) view returns (uint256)'
        ], provider);
        
        // Test balanceOf first (most reliable)
        try {
          await erc20Contract.balanceOf('0x0000000000000000000000000000000000000000');
          console.log('   ✅ Has ERC20 balanceOf function');
          
          // Try to get token details
          try {
            const name = await erc20Contract.name();
            const symbol = await erc20Contract.symbol();
            const decimals = await erc20Contract.decimals();
            const totalSupply = await erc20Contract.totalSupply();
            
            console.log(`   🏷️  Name: ${name}`);
            console.log(`   🔤 Symbol: ${symbol}`);
            console.log(`   🔢 Decimals: ${decimals}`);
            console.log(`   📊 Total Supply: ${ethers.formatUnits(totalSupply, decimals)}`);
          } catch (error) {
            console.log(`   ⚠️  Error getting token details: ${error.message}`);
          }
        } catch (error) {
          console.log(`   ❌ Not an ERC20 token: ${error.message}`);
        }
      }
      
    } catch (error) {
      console.log(`   💥 General error: ${error.message}`);
    }
  }
  
  console.log('\n✨ Token detection test completed!');
}

// Run the test
testTokenDetection().catch(console.error);