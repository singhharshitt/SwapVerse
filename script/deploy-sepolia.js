const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("🚀 Deploying contracts to Sepolia testnet...");
  console.log("📝 Deploying with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");

  // Check if we have enough balance
  const balance = await deployer.provider.getBalance(deployer.address);
  if (balance < ethers.parseEther("0.01")) {
    console.error("❌ Insufficient balance. Please add some Sepolia ETH to your account.");
    console.log("💡 You can get Sepolia ETH from: https://sepoliafaucet.com/");
    process.exit(1);
  }

  try {
    // Deploy TokenA
    console.log("\n📦 Deploying TokenA...");
    const TokenA = await hre.ethers.getContractFactory("TokenA");
    const tokenA = await TokenA.deploy();
    await tokenA.waitForDeployment();
    const tokenAAddress = await tokenA.getAddress();
    console.log("✅ TokenA deployed to:", tokenAAddress);

    // Deploy TokenB
    console.log("\n📦 Deploying TokenB...");
    const TokenB = await hre.ethers.getContractFactory("TokenB");
    const tokenB = await TokenB.deploy();
    await tokenB.waitForDeployment();
    const tokenBAddress = await tokenB.getAddress();
    console.log("✅ TokenB deployed to:", tokenBAddress);

    // Deploy TokenSwap with tokenA, tokenB and deployer as parameters
    console.log("\n📦 Deploying TokenSwap...");
    const TokenSwap = await hre.ethers.getContractFactory("TokenSwap");
    const tokenSwap = await TokenSwap.deploy(tokenAAddress, tokenBAddress, deployer.address);
    await tokenSwap.waitForDeployment();
    const tokenSwapAddress = await tokenSwap.getAddress();
    console.log("✅ TokenSwap deployed to:", tokenSwapAddress);

    // Log deployment addresses
    console.log("\n🎉 Deployment Summary:");
    console.log("=".repeat(50));
    console.log("TokenA:", tokenAAddress);
    console.log("TokenB:", tokenBAddress);
    console.log("TokenSwap:", tokenSwapAddress);
    console.log("=".repeat(50));

    // Verify contracts on Etherscan (optional)
    console.log("\n🔍 Verifying contracts on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: tokenAAddress,
        constructorArguments: [],
      });
      console.log("✅ TokenA verified on Etherscan");
    } catch (error) {
      console.log("⚠️  TokenA verification failed (might already be verified):", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: tokenBAddress,
        constructorArguments: [],
      });
      console.log("✅ TokenB verified on Etherscan");
    } catch (error) {
      console.log("⚠️  TokenB verification failed (might already be verified):", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: tokenSwapAddress,
        constructorArguments: [tokenAAddress, tokenBAddress, deployer.address],
      });
      console.log("✅ TokenSwap verified on Etherscan");
    } catch (error) {
      console.log("⚠️  TokenSwap verification failed (might already be verified):", error.message);
    }

    // Update frontend config (optional)
    console.log("\n📝 Update your frontend/src/config/contracts.js with these addresses:");
    console.log("export const CONTRACT_ADDRESSES = {");
    console.log(`  TOKEN_A: "${tokenAAddress}",`);
    console.log(`  TOKEN_B: "${tokenBAddress}",`);
    console.log(`  TOKEN_SWAP: "${tokenSwapAddress}"`);
    console.log("};");

    console.log("\n🎯 Deployment completed successfully!");
    console.log("🌐 View your contracts on Sepolia Etherscan:");
    console.log(`TokenA: https://sepolia.etherscan.io/address/${tokenAAddress}`);
    console.log(`TokenB: https://sepolia.etherscan.io/address/${tokenBAddress}`);
    console.log(`TokenSwap: https://sepolia.etherscan.io/address/${tokenSwapAddress}`);

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("❌ Script execution failed:", error);
  process.exitCode = 1;
}); 