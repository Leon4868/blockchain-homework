require("dotenv").config();
const { ethers } = require("ethers");

async function main() {
  const url = process.env.RPC_URL || process.env.SEPOLIA_RPC_URL || "http://127.0.0.1:8545";
  const provider = new ethers.JsonRpcProvider(url);
  const blockNumber = await provider.getBlockNumber();
  const block = await provider.getBlock(blockNumber);
  console.log({
    chainId: (await provider.getNetwork()).chainId.toString(),
    blockNumber,
    blockHash: block.hash,
    transactionCount: block.transactions.length,
  });
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
