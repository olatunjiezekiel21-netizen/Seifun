const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying SimpleTokenFactory to Sei Testnet");
  console.log("=" .repeat(50));

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deploying from account:", deployer.address);

  // Check balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "SEI");

  if (parseFloat(ethers.formatEther(balance)) < 5) {
    console.log("⚠️  Low balance - you might need more testnet SEI");
    console.log("💡 Get testnet SEI from: https://faucet.sei.io/");
  }

  // Deploy the factory contract
  console.log("\n📝 Deploying SimpleTokenFactory...");
  
  const SimpleTokenFactory = await ethers.getContractFactory("SimpleTokenFactory");
  
  // Deploy with no constructor arguments (fee recipient is set to deployer)
  const factory = await SimpleTokenFactory.deploy();
  
  console.log("⏳ Waiting for deployment transaction...");
  await factory.waitForDeployment();
  
  const factoryAddress = await factory.getAddress();
  console.log("✅ SimpleTokenFactory deployed to:", factoryAddress);

  // Verify deployment by calling some functions
  console.log("\n🔍 Verifying deployment...");
  
  try {
    const creationFee = await factory.creationFee();
    const feeRecipient = await factory.feeRecipient();
    const totalTokens = await factory.getTotalTokensCreated();
    
    console.log("- Creation Fee:", ethers.formatEther(creationFee), "SEI");
    console.log("- Fee Recipient:", feeRecipient);
    console.log("- Total Tokens Created:", totalTokens.toString());
    
    // Verify fee recipient is the deployer
    if (feeRecipient.toLowerCase() === deployer.address.toLowerCase()) {
      console.log("✅ Fee recipient correctly set to deployer");
    } else {
      console.log("❌ Fee recipient mismatch!");
    }
    
  } catch (error) {
    console.log("❌ Verification failed:", error.message);
  }

  // Show next steps
  console.log("\n🎯 DEPLOYMENT COMPLETE!");
  console.log("=" .repeat(30));
  console.log("📍 Factory Address:", factoryAddress);
  console.log("🌐 Network: Sei Testnet (Chain ID: 1328)");
  console.log("🔗 Explorer: https://seitrace.com/address/" + factoryAddress + "?chain=sei-testnet");
  
  console.log("\n📋 NEXT STEPS:");
  console.log("1. Update .env.production with new factory address:");
  console.log(`   VITE_FACTORY_CONTRACT_ADDRESS=${factoryAddress}`);
  console.log("2. Add your private key to environment:");
  console.log("   VITE_DEV_WALLET_PRIVATE_KEY=your_private_key_here");
  console.log("3. Test token creation on the launchpad");
  
  // Return deployment info
  return {
    factoryAddress,
    deployer: deployer.address,
    network: "seiTestnet",
    chainId: 1328
  };
}

// Execute deployment
main()
  .then((result) => {
    console.log("\n🎉 Deployment successful!");
    console.log("Factory Address:", result.factoryAddress);
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });