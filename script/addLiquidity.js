const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  // ✅ Deployed contract addresses (ensure these match your deployed output)
  const tokenAAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const tokenBAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const tokenSwapAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

  // 🔄 Get deployed contract instances
  const tokenA = await ethers.getContractAt("TokenA", tokenAAddress);
  const tokenB = await ethers.getContractAt("TokenB", tokenBAddress);
  const tokenSwap = await ethers.getContractAt("TokenSwap", tokenSwapAddress);

  console.log(`🧪 Using deployer: ${deployer.address}`);
  console.log("Adding liquidity to TokenSwap contract...");

  const amountA = ethers.parseUnits("1000", 18);
  const amountB = ethers.parseUnits("1000", 18);

  // ✅ Approve tokens for the swap contract
  console.log("🔓 Approving TokenA...");
  const txA = await tokenA.approve(tokenSwapAddress, amountA);
  await txA.wait();

  console.log("🔓 Approving TokenB...");
  const txB = await tokenB.approve(tokenSwapAddress, amountB);
  await txB.wait();

  // ✅ Add liquidity
  console.log("💧 Adding liquidity...");
  const liquidityTx = await tokenSwap.depositLiquidity(amountA, amountB);
  await liquidityTx.wait();

  console.log("✅ Liquidity added successfully!");
  console.log(`Added: ${ethers.formatUnits(amountA, 18)} TokenA`);
  console.log(`Added: ${ethers.formatUnits(amountB, 18)} TokenB`);

  // 📊 Check final balances
  const balanceA = await tokenA.balanceOf(tokenSwapAddress);
  const balanceB = await tokenB.balanceOf(tokenSwapAddress);

  console.log(`📊 TokenSwap TokenA balance: ${ethers.formatUnits(balanceA, 18)}`);
  console.log(`📊 TokenSwap TokenB balance: ${ethers.formatUnits(balanceB, 18)}`);
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exitCode = 1;
});
