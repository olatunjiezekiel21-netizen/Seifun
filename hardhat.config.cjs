require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      viaIR: true
    }
  },
  networks: {
    sei: {
      url: process.env.SEI_RPC_URL || "https://sei-testnet-rpc.publicnode.com",
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
