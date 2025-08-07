const { ethers } = require("hardhat");
require('dotenv').config();

async function main() {
  console.log("🚀 Deploying SimpleTokenFactory to Sei Testnet...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "SEI");
  
  if (balance < ethers.parseEther("5")) {
    console.log("⚠️  Warning: Low balance. You need at least 5 SEI for deployment and testing");
  }

  // Deploy SimpleTokenFactory
  console.log("\n📦 Deploying SimpleTokenFactory...");
  const SimpleTokenFactory = await ethers.getContractFactory("SimpleTokenFactory");
  
  // Deploy with proper gas settings for Sei
  const factory = await SimpleTokenFactory.deploy({
    gasLimit: 3000000,
    gasPrice: ethers.parseUnits("20", "gwei")
  });
  
  console.log("⏳ Waiting for deployment transaction...");
  await factory.waitForDeployment();
  
  const factoryAddress = await factory.getAddress();
  console.log("✅ SimpleTokenFactory deployed to:", factoryAddress);

  // Verify deployment by checking creation fee
  console.log("\n🔍 Verifying deployment...");
  try {
    const creationFee = await factory.creationFee();
    console.log("💰 Creation fee:", ethers.formatEther(creationFee), "SEI");
    
    const feeRecipient = await factory.feeRecipient();
    console.log("👤 Fee recipient:", feeRecipient);
    
    // Verify it matches deployer
    if (feeRecipient.toLowerCase() === deployer.address.toLowerCase()) {
      console.log("✅ Fee recipient correctly set to deployer");
    } else {
      console.log("⚠️  Fee recipient mismatch!");
    }
    
  } catch (error) {
    console.error("❌ Verification failed:", error.message);
    return;
  }

  // Test token creation (optional - costs 2 SEI)
  console.log("\n🧪 Testing token creation...");
  try {
    const testTx = await factory.createToken(
      "Test Token",
      "TEST",
      18,
      1000000, // 1M tokens
      { value: await factory.creationFee() }
    );
    
    console.log("⏳ Waiting for test transaction...");
    const receipt = await testTx.wait();
    
    // Get token address from event
    const tokenCreatedEvent = receipt.logs.find(log => {
      try {
        const decoded = factory.interface.parseLog(log);
        return decoded.name === 'TokenCreated';
      } catch {
        return false;
      }
    });
    
    if (tokenCreatedEvent) {
      const decoded = factory.interface.parseLog(tokenCreatedEvent);
      console.log("✅ Test token created at:", decoded.args.tokenAddress);
    }
    
  } catch (error) {
    console.log("⚠️  Test token creation skipped (insufficient balance or error):", error.message);
  }

  // Save deployment info
  const deploymentInfo = {
    network: "seiTestnet",
    factoryAddress: factoryAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    transactionHash: factory.deploymentTransaction()?.hash,
    contracts: {
      SimpleTokenFactory: factoryAddress
    },
    config: {
      creationFee: "2.0 SEI",
      gasLimit: 3000000,
      gasPrice: "20 gwei"
    }
  };

  console.log("\n📋 Deployment Summary:");
  console.log("=".repeat(50));
  console.log("Network:", deploymentInfo.network);
  console.log("Factory Address:", deploymentInfo.factoryAddress);
  console.log("Deployer:", deploymentInfo.deployer);
  console.log("Transaction Hash:", deploymentInfo.transactionHash);
  console.log("Timestamp:", deploymentInfo.timestamp);
  console.log("=".repeat(50));

  // Save to file
  const fs = require("fs");
  const path = require("path");
  
  const deploymentPath = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentPath)) {
    fs.mkdirSync(deploymentPath, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(deploymentPath, `token-factory-deployment-${Date.now()}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📝 Next steps:");
  console.log("1. Update your .env file with the factory address:");
  console.log(`   VITE_FACTORY_ADDRESS_TESTNET=${factoryAddress}`);
  console.log("2. Test token creation in your frontend");
  console.log("3. Verify the contract on SeiTrace explorer");
  console.log("4. Deploy to mainnet when ready");
  
  console.log("\n🔗 Explorer Link:");
  console.log(`https://seitrace.com/address/${factoryAddress}?chain=sei-testnet`);

  return deploymentInfo;
}

// Handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });