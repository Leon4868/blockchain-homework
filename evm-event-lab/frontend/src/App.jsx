import { useCallback, useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { WalletBar } from "./components/WalletBar";
import { WriteForm } from "./components/WriteForm";
import { EventTable } from "./components/EventTable";
import { useWallet } from "./lib/useWallet";
import {
  DEFAULT_ADDRESS,
  DEFAULT_FROM_BLOCK,
  DEFAULT_RPC_URL,
  EVENT_STORE_ABI,
  READERS,
  SUBGRAPH_URL,
  readProvider,
} from "./lib/contract";

const STORAGE_KEY = "event-store-console-config";

function loadConfig() {
  const fallback = {
    rpcUrl: DEFAULT_RPC_URL,
    address: DEFAULT_ADDRESS,
    fromBlock: String(DEFAULT_FROM_BLOCK),
    subgraphUrl: SUBGRAPH_URL,
  };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!saved) return fallback;
    // 只让非空的已保存值覆盖默认值。否则一旦某项被存成空串，
    // 之后再改 .env 也会被旧的空值一直盖住，看起来像配置没生效。
    const merged = { ...fallback };
    for (const [key, value] of Object.entries(saved)) {
      if (value !== "" && value != null) merged[key] = value;
    }
    return merged;
  } catch {
    return fallback;
  }
}

export default function App() {
  const wallet = useWallet();
  const [config, setConfig] = useState(loadConfig);
  const [readerId, setReaderId] = useState("ethers");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [liveCount, setLiveCount] = useState(0);

  const reader = useMemo(() => READERS.find((item) => item.id === readerId), [readerId]);
  const addressValid = ethers.isAddress(config.address);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  const update = (patch) => setConfig((prev) => ({ ...prev, ...patch }));

  const refresh = useCallback(async () => {
    if (readerId !== "graph" && !addressValid) {
      setRows([]);
      setError(config.address ? "合约地址格式不正确" : "");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await reader.run({
        address: config.address,
        rpcUrl: config.rpcUrl,
        fromBlock: Number(config.fromBlock) || 0,
        subgraphUrl: config.subgraphUrl,
      });
      setRows(result);
    } catch (err) {
      setRows([]);
      setError(err.shortMessage || err.message);
    } finally {
      setLoading(false);
    }
  }, [reader, readerId, addressValid, config]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // 订阅新日志：合约每发一条 DataWritten 就重新拉取当前读取方式的结果。
  useEffect(() => {
    if (!addressValid || readerId === "graph") return undefined;
    const provider = readProvider(config.rpcUrl);
    const contract = new ethers.Contract(config.address, EVENT_STORE_ABI, provider);
    let cancelled = false;
    let listener = null;

    (async () => {
      // 轮询式 provider 建立订阅时会把当前区块的历史日志一并推过来，
      // 记下订阅时的高度，只有更高区块的日志才算「实时新增」。
      const startBlock = await provider.getBlockNumber();
      if (cancelled) return;
      listener = (...args) => {
        const log = args[args.length - 1]?.log;
        if (!log || log.blockNumber <= startBlock) return;
        setLiveCount((count) => count + 1);
        refresh();
      };
      contract.on("DataWritten", listener);
    })();

    return () => {
      cancelled = true;
      if (listener) contract.off("DataWritten", listener);
      provider.destroy();
    };
  }, [addressValid, config.address, config.rpcUrl, readerId, refresh]);

  return (
    <div className="app">
      <WalletBar wallet={wallet} />

      <main className="layout">
        <section className="card">
          <div className="card-head">
            <h2>连接配置</h2>
            <p>读取走这里的 RPC，写入走 MetaMask；配置保存在浏览器本地</p>
          </div>
          <div className="config-grid">
            <label>
              <span>RPC URL</span>
              <input value={config.rpcUrl} onChange={(e) => update({ rpcUrl: e.target.value })} />
            </label>
            <label>
              <span>EventStore 地址</span>
              <input
                className={config.address && !addressValid ? "invalid" : ""}
                value={config.address}
                onChange={(e) => update({ address: e.target.value.trim() })}
                placeholder="0x…"
              />
            </label>
            <label>
              <span>起始区块</span>
              <input value={config.fromBlock} onChange={(e) => update({ fromBlock: e.target.value })} />
            </label>
            <label>
              <span>Subgraph URL（可选）</span>
              <input
                value={config.subgraphUrl}
                onChange={(e) => update({ subgraphUrl: e.target.value.trim() })}
                placeholder="https://api.studio.thegraph.com/query/…"
              />
            </label>
          </div>
        </section>

        <WriteForm address={addressValid ? config.address : ""} wallet={wallet} onWritten={refresh} />

        <section className="card">
          <div className="card-head">
            <h2>读取事件</h2>
            <p>同一批 DataWritten 日志，三层读法结果应当一致</p>
          </div>

          <div className="tabs">
            {READERS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`tab ${item.id === readerId ? "tab-active" : ""}`}
                onClick={() => setReaderId(item.id)}
              >
                {item.label}
              </button>
            ))}
            <button type="button" className="btn btn-ghost refresh" onClick={refresh}>
              刷新
            </button>
          </div>

          <p className="reader-hint">{reader.hint}</p>

          <div className="result-meta">
            <span>{rows.length} 条</span>
            {liveCount > 0 && <span className="dim"> · 已实时捕获 {liveCount} 条新事件</span>}
          </div>

          <EventTable
            rows={rows}
            loading={loading}
            error={error}
            emptyHint={
              readerId === "graph"
                ? "没有数据。Subgraph 需要先部署并配置查询端点。"
                : "还没有事件，先在上面写入一条。"
            }
          />
        </section>
      </main>
    </div>
  );
}
