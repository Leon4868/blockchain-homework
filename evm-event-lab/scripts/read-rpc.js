const { ethers } = require("ethers");
const { resolveNetwork } = require("./lib/network");

async function main() {
  const { network, rpcUrl } = resolveNetwork();
  if (!rpcUrl) throw new Error(`网络 ${network} 缺少 RPC 地址`);

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const blockNumber = await provider.getBlockNumber();
  const block = await provider.getBlock(blockNumber);
  console.log({
    network,
    chainId: (await provider.getNetwork()).chainId.toString(),
    blockNumber,
    blockHash: block.hash,
    transactionCount: block.transactions.length,
  });
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
