import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChainStatus } from "./components/ChainStatus";
import { AccountList } from "./components/AccountList";
import { ValidatorList } from "./components/ValidatorList";
import { TxList } from "./components/TxList";
import { usePolling } from "./lib/usePolling";
import { api, accountAddress, isUserAccount, parseLabels, summarizeTx } from "./lib/api";

const LABELS = parseLabels();

export default function App() {
  const block = usePolling(useCallback(() => api.latestBlock(), []), 3000);
  const nodeInfo = usePolling(useCallback(() => api.nodeInfo(), []), 30000);
  const pool = usePolling(useCallback(() => api.stakingPool(), []), 10000);
  const validators = usePolling(useCallback(() => api.validators(), []), 10000);
  const txs = usePolling(useCallback(() => api.recentTxs(20), []), 6000);

  // 账户余额要按地址逐个查，单独组织一次拉取，跟着区块高度走。
  const [accounts, setAccounts] = useState([]);
  const [accountError, setAccountError] = useState("");
  const [accountLoading, setAccountLoading] = useState(true);

  const height = Number(block.data?.block?.header?.height || 0);

  useEffect(() => {
    if (!height) return undefined;
    let alive = true;
    (async () => {
      try {
        const result = await api.accounts();
        const addresses = (result.accounts || []).filter(isUserAccount).map(accountAddress);
        const withBalances = await Promise.all(
          addresses.map(async (address) => ({
            address,
            balances: (await api.balances(address)).balances || [],
          }))
        );
        if (!alive) return;
        setAccounts(withBalances);
        setAccountError("");
      } catch (err) {
        if (alive) setAccountError(err.message);
      } finally {
        if (alive) setAccountLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
    // 只在高度变化时重新拉余额；转账后余额才会变。
  }, [height]);

  // 用相邻两次高度变化的时间差估算出块间隔。
  const lastBlock = useRef(null);
  const [blockTime, setBlockTime] = useState(0);
  useEffect(() => {
    const header = block.data?.block?.header;
    if (!header) return;
    const current = { height: Number(header.height), time: new Date(header.time).getTime() };
    const previous = lastBlock.current;
    if (previous && current.height > previous.height) {
      const delta = (current.time - previous.time) / 1000 / (current.height - previous.height);
      if (delta > 0) setBlockTime(delta);
    }
    lastBlock.current = current;
  }, [block.data]);

  const validatorList = useMemo(() => validators.data?.validators || [], [validators.data]);
  const txList = useMemo(
    () => (txs.data?.tx_responses || []).map(summarizeTx),
    [txs.data]
  );

  const online = Boolean(block.data) && !block.error;

  return (
    <div className="app">
      <header className="top-bar">
        <div className="brand">
          <span className="brand-mark">⚛</span>
          <div>
            <h1>edu 链浏览器</h1>
            <p>只读视图 —— 转账与委托请用 scripts/demo.sh</p>
          </div>
        </div>
        <span className={`pill ${online ? "pill-ok" : "pill-warn"}`}>
          {online ? `已连接 · 高度 ${height.toLocaleString()}` : "节点未连接"}
        </span>
      </header>

      <main className="layout">
        <ChainStatus
          block={block.data}
          nodeInfo={nodeInfo.data}
          pool={pool.data}
          blockTime={blockTime}
          error={block.error}
        />
        <AccountList
          accounts={accounts}
          labels={LABELS}
          error={accountError}
          loading={accountLoading}
        />
        <ValidatorList validators={validatorList} error={validators.error} loading={validators.loading} />
        <TxList txs={txList} error={txs.error} loading={txs.loading} />
      </main>
    </div>
  );
}
