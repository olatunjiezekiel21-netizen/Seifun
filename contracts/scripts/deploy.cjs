const { ethers } = require("hardhat");
require('dotenv').config();

async function main() {
  console.log("🚀 Deploying SeifuGuard contracts to Sei blockchain...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy TokenCheckerFactory first
  console.log("\n📦 Deploying TokenCheckerFactory...");
  const TokenCheckerFactory = await ethers.getContractFactory("TokenCheckerFactory");
  const factory = await TokenCheckerFactory.deploy();
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("✅ TokenCheckerFactory deployed to:", factoryAddress);

  // Deploy a sample TokenSafeChecker for demonstration
  console.log("\n🔍 Deploying sample TokenSafeChecker...");
  
  // You can replace this with an actual token address on Sei
  const sampleTokenAddress = "0x0000000000000000000000000000000000000000"; // Replace with actual token
  
  try {
    const checker = await factory.deployChecker(sampleTokenAddress);
    await checker.wait();
    
    const checkerAddress = await factory.getCheckerAddress(sampleTokenAddress);
    console.log("✅ Sample TokenSafeChecker deployed to:", checkerAddress);
  } catch (error) {
    console.log("⚠️  Could not deploy sample checker (this is normal if token address is invalid):", error.message);
  }

  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  const checkerCount = await factory.getCheckerCount();
  console.log("📊 Total checkers deployed:", checkerCount.toString());

  // Save deployment info
  const deploymentInfo = {
    network: "sei",
    factoryAddress: factoryAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      TokenCheckerFactory: factoryAddress,
      sampleTokenAddress: sampleTokenAddress
    }
  };

  console.log("\n📋 Deployment Summary:");
  console.log("Network:", deploymentInfo.network);
  console.log("Factory Address:", deploymentInfo.factoryAddress);
  console.log("Deployer:", deploymentInfo.deployer);
  console.log("Timestamp:", deploymentInfo.timestamp);

  // Save to file
  const fs = require("fs");
  const path = require("path");
  
  const deploymentPath = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentPath)) {
    fs.mkdirSync(deploymentPath, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(deploymentPath, `deployment-sei-${Date.now()}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📝 Next steps:");
  console.log("1. Update your backend configuration with the factory address");
  console.log("2. Update your frontend API endpoints");
  console.log("3. Test the token scanning functionality");
  console.log("4. Deploy to mainnet when ready");

  return deploymentInfo;
}

// Handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
