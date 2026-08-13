require("dotenv").config();
const hre = require("hardhat");
const ABI = ["function writeData(string key,string value)"];

async function main() {
  if (!process.env.EVENT_STORE_ADDRESS) {
    throw new Error("需要配置 EVENT_STORE_ADDRESS");
  }

  const [signer] = await hre.ethers.getSigners();
  const contract = new hre.ethers.Contract(process.env.EVENT_STORE_ADDRESS, ABI, signer);
  const key = process.env.DATA_KEY || "course";
  const value = process.env.DATA_VALUE || "hello";
  const tx = await contract.writeData(key, value);
  const receipt = await tx.wait();

  console.log(`network: ${hre.network.name}`);
  console.log(`writer: ${signer.address}`);
  console.log(`transaction: ${tx.hash}`);
  console.log(`block: ${receipt.blockNumber}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
