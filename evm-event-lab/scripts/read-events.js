const { ethers } = require("ethers");
const { requireTarget } = require("./lib/network");

const ABI = ["event DataWritten(address indexed writer,bytes32 indexed keyHash,string key,string value,uint256 timestamp)"];

async function main() {
  const { network, rpcUrl, address, fromBlock } = requireTarget();
  console.log(`network: ${network} | contract: ${address} | fromBlock: ${fromBlock}`);

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const contract = new ethers.Contract(address, ABI, provider);
  const contractFilter = contract.filters.DataWritten();
  const topics = contract.interface.encodeFilterTopics("DataWritten", []);
  const logs = await provider.getLogs({ address, topics, fromBlock, toBlock: "latest" });

  console.log("provider.getLogs", logs.map((log) => contract.interface.parseLog(log)));
  console.log("queryFilter", await contract.queryFilter(contractFilter, fromBlock, "latest"));
  if (logs[0]) {
    console.log("transaction receipt", await provider.getTransactionReceipt(logs[0].transactionHash));
  }
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
