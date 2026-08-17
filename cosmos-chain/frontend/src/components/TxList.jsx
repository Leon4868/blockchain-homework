export function TxList({ txs, error, loading }) {
  return (
    <section className="card">
      <div className="card-head">
        <h2>最近交易</h2>
        <p>
          通过 <code>tx.height&gt;0</code> 检索全部已上链交易，最新的排在前面
        </p>
      </div>

      {error && <p className="status status-error">{error}</p>}
      {loading && !txs.length && <p className="hint">读取中…</p>}
      {!loading && !txs.length && !error && (
        <p className="hint">还没有交易。用 scripts/demo.sh 发一笔转账试试。</p>
      )}

      {txs.length > 0 && (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>高度</th>
                <th>类型</th>
                <th>发起 → 接收</th>
                <th>金额</th>
                <th>结果</th>
                <th>gas</th>
                <th>txhash</th>
              </tr>
            </thead>
            <tbody>
              {txs.map((tx) => (
                <tr key={tx.hash}>
                  <td className="num">{tx.height}</td>
                  <td>
                    <code>{tx.type}</code>
                    {tx.messageCount > 1 && <span className="dim"> ×{tx.messageCount}</span>}
                  </td>
                  <td className="cell-flow">
                    {tx.from ? (
                      <>
                        <code title={tx.from}>{tx.from.slice(0, 10)}…</code>
                        <span className="dim"> → </span>
                        <code title={tx.to}>{tx.to ? `${tx.to.slice(0, 10)}…` : "-"}</code>
                      </>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>{tx.amount || "-"}</td>
                  <td>
                    <span className={`pill pill-${tx.code === 0 ? "ok" : "error"} tiny`}>
                      {tx.code === 0 ? "成功" : `失败 ${tx.code}`}
                    </span>
                  </td>
                  <td className="num dim">{tx.gasUsed}</td>
                  <td>
                    <code title={tx.hash}>
                      {tx.hash.slice(0, 10)}…{tx.hash.slice(-6)}
                    </code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
