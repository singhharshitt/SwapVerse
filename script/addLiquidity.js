const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  // Contract addresses from deployment
  const tokenAAddress = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";
  const tokenBAddress = "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6";
  const tokenSwapAddress = "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318";

  // Get contract instances
  const tokenA = await hre.ethers.getContractAt("TokenA", tokenAAddress);
  const tokenB = await hre.ethers.getContractAt("TokenB", tokenBAddress);
  const tokenSwap = await hre.ethers.getContractAt("TokenSwap", tokenSwapAddress);

  console.log("Adding liquidity to TokenSwap contract...");

  // Amount to add (1000 tokens each)
  const amountA = hre.ethers.parseUnits("1000", 18);
  const amountB = hre.ethers.parseUnits("1000", 18);

  // Approve tokens for the swap contract
  console.log("Approving TokenA...");
  const approveA = await tokenA.approve(tokenSwapAddress, amountA);
  await approveA.wait();

  console.log("Approving TokenB...");
  const approveB = await tokenB.approve(tokenSwapAddress, amountB);
  await approveB.wait();

  // Add liquidity
  console.log("Adding liquidity...");
  const addLiquidity = await tokenSwap.depositLiquidity(amountA, amountB);
  await addLiquidity.wait();

  console.log("Liquidity added successfully!");
  console.log(`Added ${hre.ethers.formatUnits(amountA, 18)} TokenA`);
  console.log(`Added ${hre.ethers.formatUnits(amountB, 18)} TokenB`);

  // Check balances
  const balanceA = await tokenA.balanceOf(tokenSwapAddress);
  const balanceB = await tokenB.balanceOf(tokenSwapAddress);
  
  console.log(`TokenSwap contract TokenA balance: ${hre.ethers.formatUnits(balanceA, 18)}`);
  console.log(`TokenSwap contract TokenB balance: ${hre.ethers.formatUnits(balanceB, 18)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 