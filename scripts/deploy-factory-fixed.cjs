const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying SimpleTokenFactory to SEI testnet...");

  // Dev wallet address from environment variables
  const DEV_WALLET = process.env.DEV_WALLET || "0x966CBf1baa5C08e4458f08A4CF1ECbb6Ae50894e";
  
  console.log(`📋 Dev fee recipient: ${DEV_WALLET}`);
  console.log(`💰 Creation fee: 2 SEI`);

  // Get the ContractFactory and Signers
  const [deployer] = await ethers.getSigners();
  console.log(`🔑 Deploying with account: ${deployer.address}`);
  console.log(`💳 Account balance: ${ethers.formatEther(await deployer.provider.getBalance(deployer.address))} SEI`);

  // Deploy SimpleTokenFactory
  const SimpleTokenFactory = await ethers.getContractFactory("SimpleTokenFactory");
  const factory = await SimpleTokenFactory.deploy(DEV_WALLET);

  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();

  console.log("✅ SimpleTokenFactory deployed to:", factoryAddress);
  console.log(`🔗 View on Seitrace: https://seitrace.com/address/${factoryAddress}`);

  // Verify the deployment
  console.log("\n📋 Verifying deployment...");
  const creationFee = await factory.creationFee();
  const feeRecipient = await factory.feeRecipient();
  
  console.log(`✅ Creation fee: ${ethers.formatEther(creationFee)} SEI`);
  console.log(`✅ Fee recipient: ${feeRecipient}`);
  console.log(`✅ Matches dev wallet: ${feeRecipient.toLowerCase() === DEV_WALLET.toLowerCase()}`);

  console.log("\n🎉 Deployment complete!");
  console.log(`📋 Factory Address: ${factoryAddress}`);
  console.log(`💰 Creation Fee: 2 SEI`);
  console.log(`👤 Dev Wallet: ${DEV_WALLET}`);
  console.log("\n📝 UPDATE .env with:");
  console.log(`FACTORY_CONTRACT_ADDRESS=${factoryAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
