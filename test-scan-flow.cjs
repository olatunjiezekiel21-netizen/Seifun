const { ethers } = require("ethers");
require('dotenv').config();

// Test configuration
const RPC_URL = process.env.SEI_RPC_URL || "https://sei-testnet-rpc.publicnode.com";
const FACTORY_ADDRESS = process.env.FACTORY_CONTRACT_ADDRESS || "0x50C0b92b3BC34D7FeD7Da0C48a2F16a636D95C9F";

console.log("🔍 Testing Full Token Scanning Flow");
console.log("RPC URL:", RPC_URL);
console.log("Factory Address:", FACTORY_ADDRESS);

async function testScanFlow() {
    try {
        console.log("\n1. Testing RPC Connection...");
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const blockNumber = await provider.getBlockNumber();
        console.log("✅ Connected to Sei network. Block:", blockNumber);

        console.log("\n2. Testing Factory Contract...");
        const factoryCode = await provider.getCode(FACTORY_ADDRESS);
        if (factoryCode === "0x") {
            console.log("❌ Factory contract not deployed at:", FACTORY_ADDRESS);
        } else {
            console.log("✅ Factory contract found. Code length:", factoryCode.length);
        }

        console.log("\n3. Testing Token Scanning API...");
        
        // Test with different addresses
        const testAddresses = [
            FACTORY_ADDRESS, // Our factory contract
            "0x0000000000000000000000000000000000000000", // Zero address
            "0x1111111111111111111111111111111111111111", // Random address
        ];

        for (const address of testAddresses) {
            console.log(`\nTesting address: ${address}`);
            
            try {
                const response = await fetch('http://localhost:3001/api/scan', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ tokenAddress: address })
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    console.log(`✅ Scan successful for ${address}`);
                    console.log("Risk Score:", result.data?.riskScore || "N/A");
                    console.log("Is Safe:", result.data?.isSafe || "N/A");
                    console.log("Risk Factors:", result.data?.riskFactors?.length || 0, "factors");
                } else {
                    console.log(`⚠️  Scan failed for ${address}:`, result.error);
                }
            } catch (error) {
                console.log(`❌ API request failed for ${address}:`, error.message);
            }
        }

        console.log("\n4. Testing Other API Endpoints...");
        
        // Test stats endpoint
        try {
            const statsResponse = await fetch('http://localhost:3001/api/stats');
            const statsData = await statsResponse.json();
            console.log("Stats endpoint:", statsResponse.ok ? "✅ Working" : "⚠️  Error");
            if (statsResponse.ok) {
                console.log("Total tokens:", statsData.data?.totalTokens || 0);
            }
        } catch (error) {
            console.log("❌ Stats endpoint failed:", error.message);
        }

        // Test recent scans endpoint
        try {
            const recentResponse = await fetch('http://localhost:3001/api/recent-scans');
            const recentData = await recentResponse.json();
            console.log("Recent scans endpoint:", recentResponse.ok ? "✅ Working" : "⚠️  Error");
            if (recentResponse.ok) {
                console.log("Recent scans count:", recentData.data?.length || 0);
            }
        } catch (error) {
            console.log("❌ Recent scans endpoint failed:", error.message);
        }

    } catch (error) {
        console.error("❌ Test failed:", error.message);
    }
}

// Run the test
testScanFlow().then(() => {
    console.log("\n🎉 Scan flow testing completed!");
}).catch(console.error);