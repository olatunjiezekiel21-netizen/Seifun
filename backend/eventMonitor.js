const { ethers } = require("ethers");
require('dotenv').config();
const Token = require("./models/Token");
const checkerAbi = require("./abis/TokenSafeChecker.json");

// Ethers setup for Sei blockchain
const provider = new ethers.JsonRpcProvider(process.env.SEI_RPC_URL || "https://sei-evm-rpc.publicnode.com");

// Helper to start monitoring all checkers in DB
async function monitorAllCheckers() {
  const tokens = await Token.find({});
  tokens.forEach((token) => {
    monitorChecker(token.checkerAddress, token.address);
  });
}

// Listen for SuspiciousMintDetected events
function monitorChecker(checkerAddress, tokenAddress) {
  const checker = new ethers.Contract(checkerAddress, checkerAbi, provider);
  checker.on(
    "SuspiciousMintDetected",
    async (tokenAddr, minter, amount, newSupply) => {
      console.log(
        `Suspicious mint detected for token ${tokenAddr}: +${amount.toString()}`
      );
      // Update DB
      await Token.findOneAndUpdate(
        { address: tokenAddress },
        {
          suspicious: true,
          lastCheckedSupply: newSupply.toString(),
          lastChecked: new Date(),
        }
      );
    }
  );
  console.log(
    `Monitoring checker at ${checkerAddress} for token ${tokenAddress}`
  );
}

// Start monitoring on launch
monitorAllCheckers();
