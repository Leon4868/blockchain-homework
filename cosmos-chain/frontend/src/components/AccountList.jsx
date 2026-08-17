import { useEffect, useState } from "react";
import { api, formatCoins } from "../lib/api";

function Address({ value }) {
  return (
    <code className="addr" title={value}>
      {value.slice(0, 10)}…{value.slice(-6)}
    </code>
  );
}

/** 展开某个账户时才去拉委托和奖励，避免为每个账户都发两次请求。 */
function StakingDetail({ address }) {
  const [state, setState] = useState({ loading: true, error: "", delegations: [], rewards: [] });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [delegationResult, rewardResult] = await Promise.all([
          api.delegations(address),
          api.rewards(address),
        ]);
        if (!alive) return;
        setState({
          loading: false,
          error: "",
          delegations: delegationResult.delegation_responses || [],
          rewards: rewardResult.total || [],
        });
      } catch (err) {
        if (alive) setState({ loading: false, error: err.message, delegations: [], rewards: [] });
      }
    })();
    return () => {
      alive = false;
    };
  }, [address]);

  if (state.loading) return <p className="hint">读取委托与奖励…</p>;
  if (state.error) return <p className="status status-error">{state.error}</p>;

  return (
    <div className="detail">
      <div className="detail-row">
        <span className="detail-label">待领取奖励</span>
        <span>{state.rewards.length ? formatCoins(state.rewards) : "无"}</span>
      </div>
      <div className="detail-row">
        <span className="detail-label">委托</span>
        <span>
          {state.delegations.length ? (
            <ul className="plain-list">
              {state.delegations.map((item) => (
                <li key={item.delegation.validator_address}>
                  <Address value={item.delegation.validator_address} /> ·{" "}
                  {formatCoins([item.balance])}
                </li>
              ))}
            </ul>
          ) : (
            "无"
          )}
        </span>
      </div>
    </div>
  );
}

export function AccountList({ accounts, labels, error, loading }) {
  const [expanded, setExpanded] = useState("");

  return (
    <section className="card">
      <div className="card-head">
        <h2>账户</h2>
        <p>Genesis 分发的钱包账户；点开可查看委托与待领取奖励</p>
      </div>

      {error && <p className="status status-error">{error}</p>}
      {loading && !accounts.length && <p className="hint">读取中…</p>}
      {!loading && !accounts.length && !error && <p className="hint">没有找到普通账户。</p>}

      <div className="account-rows">
        {accounts.map((account) => {
          const open = expanded === account.address;
          return (
            <div key={account.address} className={`account-row ${open ? "open" : ""}`}>
              <button
                type="button"
                className="account-head"
                onClick={() => setExpanded(open ? "" : account.address)}
              >
                <span className="account-name">
                  {labels[account.address] || "账户"}
                  <Address value={account.address} />
                </span>
                <span className="account-balance">{formatCoins(account.balances)}</span>
                <span className="chevron">{open ? "−" : "+"}</span>
              </button>
              {open && <StakingDetail address={account.address} />}
            </div>
          );
        })}
      </div>
    </section>
  );
}
