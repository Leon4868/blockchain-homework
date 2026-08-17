import { formatAmount } from "../lib/api";

const STATUS_TEXT = {
  BOND_STATUS_BONDED: { text: "已绑定", tone: "ok" },
  BOND_STATUS_UNBONDING: { text: "解绑中", tone: "warn" },
  BOND_STATUS_UNBONDED: { text: "未绑定", tone: "warn" },
};

export function ValidatorList({ validators, error, loading }) {
  return (
    <section className="card">
      <div className="card-head">
        <h2>验证者</h2>
        <p>PoS 出块者：绑定状态、质押量与佣金率</p>
      </div>

      {error && <p className="status status-error">{error}</p>}
      {loading && !validators.length && <p className="hint">读取中…</p>}

      {validators.length > 0 && (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>moniker</th>
                <th>状态</th>
                <th>质押量</th>
                <th>佣金</th>
                <th>operator</th>
              </tr>
            </thead>
            <tbody>
              {validators.map((validator) => {
                const status = STATUS_TEXT[validator.status] || { text: validator.status, tone: "warn" };
                const rate = Number(validator.commission?.commission_rates?.rate || 0);
                return (
                  <tr key={validator.operator_address}>
                    <td>
                      {validator.description?.moniker || "-"}
                      {validator.jailed && <span className="pill pill-warn tiny">已监禁</span>}
                    </td>
                    <td>
                      <span className={`pill pill-${status.tone} tiny`}>{status.text}</span>
                    </td>
                    <td className="num">{formatAmount(validator.tokens)}</td>
                    <td className="num">{(rate * 100).toFixed(2)}%</td>
                    <td>
                      <code title={validator.operator_address}>
                        {validator.operator_address.slice(0, 12)}…{validator.operator_address.slice(-6)}
                      </code>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
