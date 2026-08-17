require("dotenv").config();

/**
 * 这个项目同时面向本地 Hardhat 链和 Sepolia 测试网，两边的合约地址、
 * 起始区块和 RPC 都不一样。用一个 EVENT_STORE_ADDRESS 服务两条流程会互相覆盖，
 * 因此按网络拆分变量，并在此集中解析。
 *
 * 纯 node 脚本通过 NETWORK 环境变量选择网络（默认 local）；
 * Hardhat 脚本传入 hre.network.name 即可。
 */

const NETWORKS = {
  local: {
    rpcEnv: "LOCAL_RPC_URL",
    addressEnv: "LOCAL_EVENT_STORE_ADDRESS",
    fromBlockEnv: "LOCAL_FROM_BLOCK",
    defaultRpc: "http://127.0.0.1:8545",
  },
  sepolia: {
    rpcEnv: "SEPOLIA_RPC_URL",
    addressEnv: "SEPOLIA_EVENT_STORE_ADDRESS",
    fromBlockEnv: "SEPOLIA_FROM_BLOCK",
    defaultRpc: "",
  },
};

/** Hardhat 的网络名与这里的键不完全一致，统一映射一次。 */
function normalize(name) {
  const key = String(name || process.env.NETWORK || "local").toLowerCase();
  if (key === "localhost" || key === "hardhat") return "local";
  return key;
}

function resolveNetwork(name) {
  const key = normalize(name);
  const config = NETWORKS[key];
  if (!config) {
    throw new Error(`未知网络 "${key}"，可选：${Object.keys(NETWORKS).join(" / ")}`);
  }

  // RPC_URL 作为一次性覆盖，方便临时指向别的节点。
  const rpcUrl = process.env.RPC_URL || process.env[config.rpcEnv] || config.defaultRpc;
  // 旧配置只有 EVENT_STORE_ADDRESS / FROM_BLOCK，保留回退避免升级后直接失效。
  const address = process.env[config.addressEnv] || process.env.EVENT_STORE_ADDRESS || "";
  const fromBlock = Number(
    process.env[config.fromBlockEnv] || process.env.FROM_BLOCK || 0
  );

  return { network: key, rpcUrl, address, fromBlock };
}

/** 读取类脚本要求地址和 RPC 都存在，缺失时给出明确的变量名而不是让 ethers 报底层错。 */
function requireTarget(name) {
  const resolved = resolveNetwork(name);
  const config = NETWORKS[normalize(name)];
  if (!resolved.rpcUrl) {
    throw new Error(`网络 ${resolved.network} 缺少 RPC 地址，请配置 ${config.rpcEnv}`);
  }
  if (!resolved.address) {
    throw new Error(`网络 ${resolved.network} 缺少合约地址，请配置 ${config.addressEnv}`);
  }
  return resolved;
}

module.exports = { resolveNetwork, requireTarget, NETWORKS };
