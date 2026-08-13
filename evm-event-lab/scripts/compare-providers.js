require("dotenv").config();
const { ethers } = require("ethers");

async function inspect(name, url) {
  if (!url) return console.log(`${name}: missing URL`);
  const provider = new ethers.JsonRpcProvider(url);
  console.log(`${name}: chainId=${(await provider.getNetwork()).chainId} block=${await provider.getBlockNumber()}`);
}
Promise.all([inspect("Infura", process.env.INFURA_SEPOLIA_RPC_URL), inspect("Alchemy", process.env.ALCHEMY_SEPOLIA_RPC_URL)])
  .catch((error) => { console.error(error.message); process.exitCode = 1; });
