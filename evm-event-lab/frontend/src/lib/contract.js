import { ethers } from "ethers";

// 与 contracts/EventStore.sol 和 scripts/read-events.js 保持一致。
export const EVENT_STORE_ABI = [
  "event DataWritten(address indexed writer,bytes32 indexed keyHash,string key,string value,uint256 timestamp)",
  "function writeData(string key, string value) external",
];

export const LOCAL_CHAIN_ID = 31337n;

export const DEFAULT_RPC_URL = import.meta.env.VITE_RPC_URL || "http://127.0.0.1:8545";
export const DEFAULT_ADDRESS = import.meta.env.VITE_EVENT_STORE_ADDRESS || "";
export const DEFAULT_FROM_BLOCK = Number(import.meta.env.VITE_FROM_BLOCK || 0);
export const SUBGRAPH_URL = import.meta.env.VITE_SUBGRAPH_URL || "";

export const iface = new ethers.Interface(EVENT_STORE_ABI);

export function readProvider(rpcUrl = DEFAULT_RPC_URL) {
  return new ethers.JsonRpcProvider(rpcUrl);
}

// 把不同来源的事件统一成同一份表格数据，方便三种方式并排比较。
function normalize({ writer, keyHash, key, value, timestamp, blockNumber, transactionHash, logIndex }) {
  return {
    id: `${transactionHash}-${logIndex ?? 0}`,
    writer: ethers.getAddress(writer),
    keyHash,
    key,
    value,
    timestamp: Number(timestamp),
    blockNumber: Number(blockNumber),
    transactionHash,
  };
}

function sortByBlockDesc(rows) {
  return [...rows].sort((a, b) => b.blockNumber - a.blockNumber || b.timestamp - a.timestamp);
}

/**
 * 方式一：JSON-RPC eth_getLogs —— 最底层，手工拼 topics 再自己解码。
 */
export async function readViaRpc({ address, rpcUrl, fromBlock }) {
  const provider = readProvider(rpcUrl);
  const topics = iface.encodeFilterTopics("DataWritten", []);
  const logs = await provider.getLogs({ address, topics, fromBlock, toBlock: "latest" });
  return sortByBlockDesc(
    logs.map((log) => {
      const parsed = iface.parseLog(log);
      return normalize({
        writer: parsed.args.writer,
        keyHash: parsed.args.keyHash,
        key: parsed.args.key,
        value: parsed.args.value,
        timestamp: parsed.args.timestamp,
        blockNumber: log.blockNumber,
        transactionHash: log.transactionHash,
        logIndex: log.index,
      });
    })
  );
}

/**
 * 方式二：ethers contract.queryFilter —— 合约对象封装，自动解码。
 */
export async function readViaEthers({ address, rpcUrl, fromBlock }) {
  const provider = readProvider(rpcUrl);
  const contract = new ethers.Contract(address, EVENT_STORE_ABI, provider);
  const events = await contract.queryFilter(contract.filters.DataWritten(), fromBlock, "latest");
  return sortByBlockDesc(
    events.map((event) =>
      normalize({
        writer: event.args.writer,
        keyHash: event.args.keyHash,
        key: event.args.key,
        value: event.args.value,
        timestamp: event.args.timestamp,
        blockNumber: event.blockNumber,
        transactionHash: event.transactionHash,
        logIndex: event.index,
      })
    )
  );
}

/**
 * 方式三：The Graph —— 事件已被 mapping 索引成实体，直接 GraphQL 查询。
 * 查询体与 subgraph/queries/data-written.graphql 中的 RecentDataWritten 一致。
 */
export async function readViaSubgraph({ subgraphUrl }) {
  if (!subgraphUrl) throw new Error("未配置 VITE_SUBGRAPH_URL，无法使用 Subgraph 读取");
  const query = `query RecentDataWritten {
    dataWrittens(first: 100, orderBy: timestamp, orderDirection: desc) {
      id writer keyHash key value timestamp blockNumber transactionHash
    }
  }`;
  const response = await fetch(subgraphUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!response.ok) throw new Error(`Subgraph 返回 HTTP ${response.status}`);
  const payload = await response.json();
  if (payload.errors?.length) throw new Error(payload.errors[0].message);
  return (payload.data?.dataWrittens || []).map((row) =>
    normalize({ ...row, logIndex: 0 })
  );
}

export const READERS = [
  {
    id: "rpc",
    label: "JSON-RPC",
    hint: "provider.getLogs —— 手工拼 topics，自己解码",
    run: readViaRpc,
  },
  {
    id: "ethers",
    label: "ethers.js",
    hint: "contract.queryFilter —— 合约对象封装事件过滤",
    run: readViaEthers,
  },
  {
    id: "graph",
    label: "The Graph",
    hint: "GraphQL —— mapping 已把事件索引成实体",
    run: readViaSubgraph,
  },
];
