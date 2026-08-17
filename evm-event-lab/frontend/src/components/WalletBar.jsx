function shorten(address) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function WalletBar({ wallet }) {
  const { hasWallet, account, chainId, isLocalChain, connect, switchToLocal, error } = wallet;

  return (
    <header className="wallet-bar">
      <div className="brand">
        <span className="brand-mark">⛓</span>
        <div>
          <h1>EventStore 控制台</h1>
          <p>写入事件日志，并用三种方式把它读回来</p>
        </div>
      </div>

      <div className="wallet-state">
        {!hasWallet && <span className="pill pill-warn">未检测到 MetaMask</span>}

        {hasWallet && chainId !== null && (
          <span className={`pill ${isLocalChain ? "pill-ok" : "pill-warn"}`}>
            chainId {String(chainId)}
            {isLocalChain ? " · Hardhat" : " · 非本地网络"}
          </span>
        )}

        {hasWallet && !isLocalChain && chainId !== null && (
          <button type="button" className="btn btn-ghost" onClick={switchToLocal}>
            切到本地链
          </button>
        )}

        {hasWallet &&
          (account ? (
            <span className="pill pill-account" title={account}>
              {shorten(account)}
            </span>
          ) : (
            <button type="button" className="btn" onClick={connect}>
              连接钱包
            </button>
          ))}
      </div>

      {error && <p className="bar-error">{error}</p>}
    </header>
  );
}
