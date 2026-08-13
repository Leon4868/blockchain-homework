const hre = require("hardhat");

async function main() {
  const Store = await hre.ethers.getContractFactory("EventStore");
  const store = await Store.deploy();
  await store.waitForDeployment();
  console.log(`EventStore deployed to: ${await store.getAddress()}`);
  console.log(`Network: ${hre.network.name}`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
