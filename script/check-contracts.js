const hre = require("hardhat");

async function main() {
  console.log("🔍 Checking contract deployment status on Sepolia testnet...");
  
  // Contract addresses from frontend config
  const CONTRACT_ADDRESSES = {
    TOKEN_A: "0x18bCdC0AB71FbE0682ea5803e1C4586878A3339c",
    TOKEN_B: "0x889cc282Cb3553CE7744b732542f22e1fAb32DA4",
    TOKEN_SWAP: "0xbD5E43894a6992bc68B812D25C0DCce5b06A9637"
  };

  const provider = hre.ethers.provider;

  console.log("\n📋 Contract Status Check:");
  console.log("=".repeat(60));

  for (const [name, address] of Object.entries(CONTRACT_ADDRESSES)) {
    try {
      console.log(`\n🔍 Checking ${name}...`);
      console.log(`📍 Address: ${address}`);
      
      const code = await provider.getCode(address);
      const isDeployed = code !== '0x';
      
      if (isDeployed) {
        console.log(`✅ ${name} is deployed`);
        console.log(`📊 Code size: ${code.length} bytes`);
        
        // Try to get some basic contract info
        try {
          const contract = new hre.ethers.Contract(address, [
            "function name() view returns (string)",
            "function symbol() view returns (string)",
            "function decimals() view returns (uint8)",
            "function totalSupply() view returns (uint256)"
          ], provider);
          
          const name = await contract.name();
          const symbol = await contract.symbol();
          const decimals = await contract.decimals();
          const totalSupply = await contract.totalSupply();
          
          console.log(`📝 Name: ${name}`);
          console.log(`💎 Symbol: ${symbol}`);
          console.log(`🔢 Decimals: ${decimals}`);
          console.log(`💰 Total Supply: ${hre.ethers.formatUnits(totalSupply, decimals)}`);
          
        } catch (error) {
          console.log(`⚠️  Could not read contract details: ${error.message}`);
        }
      } else {
        console.log(`❌ ${name} is NOT deployed`);
        console.log(`💡 Contract address ${address} has no code`);
      }
      
    } catch (error) {
      console.log(`❌ Error checking ${name}: ${error.message}`);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("🎯 Summary:");
  
  let deployedCount = 0;
  let totalCount = Object.keys(CONTRACT_ADDRESSES).length;
  
  for (const [name, address] of Object.entries(CONTRACT_ADDRESSES)) {
    try {
      const code = await provider.getCode(address);
      if (code !== '0x') {
        deployedCount++;
        console.log(`✅ ${name}: Deployed`);
      } else {
        console.log(`❌ ${name}: Not deployed`);
      }
    } catch (error) {
      console.log(`❌ ${name}: Error checking`);
    }
  }
  
  console.log(`\n📊 ${deployedCount}/${totalCount} contracts are deployed`);
  
  if (deployedCount === 0) {
    console.log("\n🚀 To deploy contracts, run:");
    console.log("npx hardhat run script/deploy-sepolia.js --network sepolia");
  } else if (deployedCount < totalCount) {
    console.log("\n⚠️  Some contracts are missing. You may need to redeploy.");
  } else {
    console.log("\n🎉 All contracts are deployed and ready to use!");
  }
}

main().catch((error) => {
  console.error("❌ Script execution failed:", error);
  process.exitCode = 1;
}); 