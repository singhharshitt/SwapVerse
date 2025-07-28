const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("💰 Adding initial liquidity to TokenSwap contract...");
  console.log("📝 Using account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");

  // Contract addresses
  const CONTRACT_ADDRESSES = {
    TOKEN_A: "0x18bCdC0AB71FbE0682ea5803e1C4586878A3339c",
    TOKEN_B: "0x889cc282Cb3553CE7744b732542f22e1fAb32DA4",
    TOKEN_SWAP: "0xbD5E43894a6992bc68B812D25C0DCce5b06A9637"
  };

  try {
    // Get contract instances
    const tokenA = new hre.ethers.Contract(CONTRACT_ADDRESSES.TOKEN_A, [
      "function balanceOf(address) view returns (uint256)",
      "function approve(address,uint256) returns (bool)",
      "function transfer(address,uint256) returns (bool)"
    ], deployer);

    const tokenB = new hre.ethers.Contract(CONTRACT_ADDRESSES.TOKEN_B, [
      "function balanceOf(address) view returns (uint256)",
      "function approve(address,uint256) returns (bool)",
      "function transfer(address,uint256) returns (bool)"
    ], deployer);

    const tokenSwap = new hre.ethers.Contract(CONTRACT_ADDRESSES.TOKEN_SWAP, [
      "function depositLiquidity(uint256,uint256) returns (bool)"
    ], deployer);

    // Check current balances
    const tokenABalance = await tokenA.balanceOf(deployer.address);
    const tokenBBalance = await tokenB.balanceOf(deployer.address);

    console.log("\n📊 Current Token Balances:");
    console.log(`TokenA (TKA7): ${ethers.formatEther(tokenABalance)}`);
    console.log(`TokenB (TKB7): ${ethers.formatEther(tokenBBalance)}`);

    // Amount to add as liquidity (1000 tokens each)
    const liquidityAmount = ethers.parseEther("1000");

    if (tokenABalance < liquidityAmount || tokenBBalance < liquidityAmount) {
      console.log("\n❌ Insufficient token balance for liquidity provision.");
      console.log("💡 You need at least 1000 TKA7 and 1000 TKB7 tokens.");
      console.log("🔧 The deployer account should have received tokens during deployment.");
      return;
    }

    console.log("\n🔧 Adding liquidity...");
    console.log(`Amount: ${ethers.formatEther(liquidityAmount)} tokens each`);

    // Approve tokens for the swap contract
    console.log("\n📝 Approving TokenA...");
    const approveATx = await tokenA.approve(CONTRACT_ADDRESSES.TOKEN_SWAP, liquidityAmount);
    await approveATx.wait();
    console.log("✅ TokenA approved");

    console.log("📝 Approving TokenB...");
    const approveBTx = await tokenB.approve(CONTRACT_ADDRESSES.TOKEN_SWAP, liquidityAmount);
    await approveBTx.wait();
    console.log("✅ TokenB approved");

    // Add liquidity
    console.log("\n💧 Adding liquidity to swap contract...");
    const addLiquidityTx = await tokenSwap.depositLiquidity(liquidityAmount, liquidityAmount);
    await addLiquidityTx.wait();
    console.log("✅ Liquidity added successfully!");

    // Check final balances
    const finalTokenABalance = await tokenA.balanceOf(deployer.address);
    const finalTokenBBalance = await tokenB.balanceOf(deployer.address);

    console.log("\n📊 Final Token Balances:");
    console.log(`TokenA (TKA7): ${ethers.formatEther(finalTokenABalance)}`);
    console.log(`TokenB (TKB7): ${ethers.formatEther(finalTokenBBalance)}`);

    console.log("\n🎉 Liquidity provision completed!");
    console.log("🌐 View transaction on Sepolia Etherscan:");
    console.log(`https://sepolia.etherscan.io/tx/${addLiquidityTx.hash}`);

  } catch (error) {
    console.error("❌ Error adding liquidity:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("❌ Script execution failed:", error);
  process.exitCode = 1;
}); 