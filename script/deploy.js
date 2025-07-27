const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const TokenA = await hre.ethers.getContractFactory("TokenA");
  const tokenA = await TokenA.deploy();
  await tokenA.waitForDeployment();

  const TokenB = await hre.ethers.getContractFactory("TokenB");
  const tokenB = await TokenB.deploy();
  await tokenB.waitForDeployment();

  const TokenSwap = await hre.ethers.getContractFactory("TokenSwap");
  const tokenSwap = await TokenSwap.deploy(await tokenA.getAddress(), await tokenB.getAddress(), deployer.address);
  await tokenSwap.waitForDeployment();

  console.log("TokenA deployed to:", await tokenA.getAddress());
  console.log("TokenB deployed to:", await tokenB.getAddress());
  console.log("TokenSwap deployed to:", await tokenSwap.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
