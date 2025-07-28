require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); // ✅ Load .env variables

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: process.env.ALCHEMY_API_URL || "https://rpc.sepolia.org", // ✅ Use Alchemy if provided
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [], // ✅ Load deployer's wallet
    },
  },
};
