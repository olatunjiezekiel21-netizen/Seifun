const { ethers } = require('ethers');

async function testScanner() {
    console.log('🧪 Testing Enhanced Token Scanner...\n');
    
    try {
        // Test RPC connection
        console.log('1. Testing Sei RPC connection...');
        const provider = new ethers.JsonRpcProvider('https://evm-rpc-testnet.sei-apis.com');
        const blockNumber = await provider.getBlockNumber();
        console.log(`✅ Connected to Sei testnet. Current block: ${blockNumber}\n`);
        
        // Test your token address
        const testAddress = '0x5f0e07dfee5832faa00c63f2d33a0d79150e8598';
        console.log(`2. Testing token analysis for: ${testAddress}`);
        
        // Check if contract exists
        const code = await provider.getCode(testAddress);
        if (code === '0x') {
            console.log('⚠️  No contract code found at this address');
            console.log('   This might be an EOA (Externally Owned Account) or the contract might not exist on Sei testnet');
        } else {
            console.log(`✅ Contract found! Code length: ${code.length} characters`);
            
            // Try to get basic ERC20 info
            const erc20ABI = [
                'function name() view returns (string)',
                'function symbol() view returns (string)',
                'function decimals() view returns (uint8)',
                'function totalSupply() view returns (uint256)'
            ];
            
            try {
                const contract = new ethers.Contract(testAddress, erc20ABI, provider);
                const [name, symbol, decimals, totalSupply] = await Promise.all([
                    contract.name().catch(() => 'Unknown'),
                    contract.symbol().catch(() => 'UNKNOWN'),
                    contract.decimals().catch(() => 18),
                    contract.totalSupply().catch(() => ethers.parseUnits('0', 18))
                ]);
                
                console.log(`   Name: ${name}`);
                console.log(`   Symbol: ${symbol}`);
                console.log(`   Decimals: ${decimals}`);
                console.log(`   Total Supply: ${ethers.formatUnits(totalSupply, decimals)}`);
            } catch (error) {
                console.log('⚠️  Could not read ERC20 functions - might not be a standard token');
            }
        }
        
        console.log('\n3. Scanner is ready for testing!');
        console.log('🌐 Open your browser and go to: http://localhost:8080');
        console.log(`🔍 Try scanning: ${testAddress}`);
        console.log('\n✨ Features to test:');
        console.log('   - Token logo fetching');
        console.log('   - Real blockchain analysis');
        console.log('   - Safety checks');
        console.log('   - Risk scoring');
        console.log('   - Progress indicators');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testScanner();