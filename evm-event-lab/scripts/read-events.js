require("dotenv").config();
const { ethers } = require("ethers");
const ABI = ["event DataWritten(address indexed writer,bytes32 indexed keyHash,string key,string value,uint256 timestamp)"];

async function main() {
  const rpcUrl = process.env.RPC_URL || process.env.SEPOLIA_RPC_URL || "http://127.0.0.1:8545";
  if (!process.env.EVENT_STORE_ADDRESS) throw new Error("需要配置 EVENT_STORE_ADDRESS");
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const contract = new ethers.Contract(process.env.EVENT_STORE_ADDRESS, ABI, provider);
  const fromBlock = process.env.FROM_BLOCK ? Number(process.env.FROM_BLOCK) : 0;
  const contractFilter = contract.filters.DataWritten();
  const topics = contract.interface.encodeFilterTopics("DataWritten", []);
  const logs = await provider.getLogs({
    address: process.env.EVENT_STORE_ADDRESS,
    topics,
    fromBlock,
    toBlock: "latest",
  });
  console.log("provider.getLogs", logs.map((log) => contract.interface.parseLog(log)));
  console.log("queryFilter", await contract.queryFilter(contractFilter, fromBlock, "latest"));
  if (logs[0]) {
    console.log("transaction receipt", await provider.getTransactionReceipt(logs[0].transactionHash));
  }
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
