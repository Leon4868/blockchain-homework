const hre = require("hardhat");
const { requireTarget } = require("./lib/network");
const ABI = ["function writeData(string key,string value)"];

async function main() {
  // 按 Hardhat 当前网络取对应的合约地址，避免本地流程误用测试网地址。
  const { address } = requireTarget(hre.network.name);

  const [signer] = await hre.ethers.getSigners();
  const contract = new hre.ethers.Contract(address, ABI, signer);
  const key = process.env.DATA_KEY || "course";
  const value = process.env.DATA_VALUE || "hello";
  const tx = await contract.writeData(key, value);
  const receipt = await tx.wait();

  console.log(`network: ${hre.network.name}`);
  console.log(`contract: ${address}`);
  console.log(`writer: ${signer.address}`);
  console.log(`transaction: ${tx.hash}`);
  console.log(`block: ${receipt.blockNumber}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
