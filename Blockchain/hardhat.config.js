const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    amoy: {
      url: process.env.ALCHEMY_AMOY_URL, // 👈 must match your .env
      accounts: [process.env.PRIVATE_KEY],
      chainId: 80002, // Polygon Amoy chain ID
    },
    hardhat: {},
  },
};
