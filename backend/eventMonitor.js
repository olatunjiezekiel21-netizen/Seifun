const { ethers } = require("ethers");
const Token = require("./models/Token");
const checkerAbi = require("./abis/TokenSafeChecker.json");

// Set up provider
const provider = new ethers.JsonRpcProvider("YOUR_SEI_RPC_URL");

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
