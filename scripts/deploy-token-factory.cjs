const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying SimpleTokenFactory to SEI testnet...");

  // Dev wallet address - replace with your actual wallet address
  const DEV_WALLET = "0x742d35Cc6635C0532925a3b8D41c4e9E4532D3eE"; // Replace with your wallet address
  
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

  // Create a test token to verify everything works
  console.log("\n🧪 Testing token creation...");
  try {
    const testTx = await factory.createToken(
      "Test Token",
      "TEST",
      18,
      1000000,
      { value: creationFee }
    );
    
    const receipt = await testTx.wait();
    console.log("✅ Test token creation successful!");
    console.log(`📝 Transaction hash: ${receipt.hash}`);
    
    // Get the created token address from events
    const tokenCreatedEvent = receipt.logs.find(log => {
      try {
        const parsedLog = factory.interface.parseLog(log);
        return parsedLog.name === 'TokenCreated';
      } catch {
        return false;
      }
    });
    
    if (tokenCreatedEvent) {
      const parsedEvent = factory.interface.parseLog(tokenCreatedEvent);
      const tokenAddress = parsedEvent.args.tokenAddress;
      console.log(`🪙 Test token address: ${tokenAddress}`);
      console.log(`🔗 View token: https://seitrace.com/address/${tokenAddress}`);
    }
    
  } catch (error) {
    console.log("❌ Test token creation failed:", error.message);
  }

  console.log("\n🎉 Deployment complete!");
  console.log(`📋 Factory Address: ${factoryAddress}`);
  console.log(`💰 Creation Fee: 2 SEI`);
  console.log(`👤 Dev Wallet: ${DEV_WALLET}`);
  console.log("\n📝 Next steps:");
  console.log("1. Update FACTORY_ADDRESS in LaunchpadForm.tsx");
  console.log("2. Test token creation on the frontend");
  console.log("3. Verify contract on block explorer if needed");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });