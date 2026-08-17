import { formatAmount } from "../lib/api";

function Stat({ label, value, hint }) {
  return (
    <div className="stat">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
      {hint && <span className="stat-hint">{hint}</span>}
    </div>
  );
}

export function ChainStatus({ block, nodeInfo, pool, blockTime, error }) {
  const header = block?.block?.header;

  return (
    <section className="card">
      <div className="card-head">
        <h2>链状态</h2>
        <p>每 3 秒轮询一次最新区块</p>
      </div>

      {error && <p className="status status-error">{error}</p>}

      <div className="stat-grid">
        <Stat label="chain-id" value={header?.chain_id || "-"} />
        <Stat
          label="最新高度"
          value={header?.height ? Number(header.height).toLocaleString() : "-"}
          hint={blockTime ? `出块间隔约 ${blockTime.toFixed(2)}s` : undefined}
        />
        <Stat
          label="节点"
          value={nodeInfo?.default_node_info?.moniker || "-"}
          hint={nodeInfo?.application_version?.version ? `edud ${nodeInfo.application_version.version}` : undefined}
        />
        <Stat
          label="已质押"
          value={pool?.pool ? formatAmount(pool.pool.bonded_tokens) : "-"}
          hint={pool?.pool ? `未质押 ${formatAmount(pool.pool.not_bonded_tokens)}` : undefined}
        />
      </div>

      {header?.time && (
        <p className="hint">
          区块时间 {new Date(header.time).toLocaleString("zh-CN", { hour12: false })}
        </p>
      )}
    </section>
  );
}
