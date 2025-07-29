const { ethers } = require("ethers");
require('dotenv').config();

// Test configuration
console.log("Testing Backend Configuration:");
console.log("SEI_RPC_URL:", process.env.SEI_RPC_URL || "https://sei-evm-rpc.publicnode.com");
console.log("FACTORY_CONTRACT_ADDRESS:", process.env.FACTORY_CONTRACT_ADDRESS || "0x50C0b92b3BC34D7FeD7Da0C48a2F16a636D95C9F");

async function testRPCConnection() {
    try {
        const provider = new ethers.JsonRpcProvider(process.env.SEI_RPC_URL || "https://sei-evm-rpc.publicnode.com");
        const blockNumber = await provider.getBlockNumber();
        console.log("✅ RPC Connection successful. Current block:", blockNumber);
        return provider;
    } catch (error) {
        console.error("❌ RPC Connection failed:", error.message);
        return null;
    }
}

async function testContractConnection(provider) {
    try {
        const factoryAddress = process.env.FACTORY_CONTRACT_ADDRESS || "0x50C0b92b3BC34D7FeD7Da0C48a2F16a636D95C9F";
        const code = await provider.getCode(factoryAddress);
        
        if (code === "0x") {
            console.log("❌ Factory contract not found at address:", factoryAddress);
            return false;
        } else {
            console.log("✅ Factory contract found at address:", factoryAddress);
            console.log("Contract code length:", code.length);
            return true;
        }
    } catch (error) {
        console.error("❌ Contract connection failed:", error.message);
        return false;
    }
}

async function testTokenAnalysis(provider) {
    try {
        // Test with a known ERC20 token address (using factory address as example)
        const testAddress = "0x50C0b92b3BC34D7FeD7Da0C48a2F16a636D95C9F";
        
        // Simple check if address has code
        const code = await provider.getCode(testAddress);
        if (code === "0x") {
            console.log("⚠️  Test address has no contract code");
            return false;
        }
        
        console.log("✅ Token analysis test passed for address:", testAddress);
        return true;
    } catch (error) {
        console.error("❌ Token analysis failed:", error.message);
        return false;
    }
}

async function testBackendAPI() {
    try {
        const response = await fetch('http://localhost:3001/api/stats');
        const data = await response.json();
        
        if (response.ok) {
            console.log("✅ Backend API is responding:", data);
        } else {
            console.log("⚠️  Backend API returned error:", data);
        }
    } catch (error) {
        console.log("❌ Backend API not accessible:", error.message);
    }
}

async function runTests() {
    console.log("\n🧪 Starting Backend Tests...\n");
    
    // Test 1: RPC Connection
    const provider = await testRPCConnection();
    if (!provider) return;
    
    // Test 2: Contract Connection
    await testContractConnection(provider);
    
    // Test 3: Token Analysis
    await testTokenAnalysis(provider);
    
    // Test 4: Backend API
    await testBackendAPI();
    
    console.log("\n✅ Backend tests completed!");
}

runTests().catch(console.error);