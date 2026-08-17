import { useState } from "react";
import { ethers } from "ethers";
import { EVENT_STORE_ABI } from "../lib/contract";

export function WriteForm({ address, wallet, onWritten }) {
  const [key, setKey] = useState("course");
  const [value, setValue] = useState("hello");
  const [status, setStatus] = useState(null);
  const [pending, setPending] = useState(false);

  const disabled = pending || !address || !wallet.account;

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus(null);
    setPending(true);
    try {
      const signer = await wallet.getSigner();
      const contract = new ethers.Contract(address, EVENT_STORE_ABI, signer);
      const tx = await contract.writeData(key, value);
      setStatus({ kind: "pending", hash: tx.hash });
      const receipt = await tx.wait();
      setStatus({
        kind: "ok",
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
      });
      onWritten?.();
    } catch (err) {
      // 合约的 require 失败会走到这里，例如空 key / 空 value。
      setStatus({ kind: "error", message: err.shortMessage || err.reason || err.message });
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="card">
      <div className="card-head">
        <h2>写入事件</h2>
        <p>
          调用 <code>writeData(key, value)</code>，合约不写 storage，只发出{" "}
          <code>DataWritten</code> 日志
        </p>
      </div>

      <form className="write-form" onSubmit={handleSubmit}>
        <label>
          <span>key</span>
          <input value={key} onChange={(e) => setKey(e.target.value)} placeholder="course" />
        </label>
        <label>
          <span>value</span>
          <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="hello" />
        </label>
        <button type="submit" className="btn" disabled={disabled}>
          {pending ? "提交中…" : "写入"}
        </button>
      </form>

      {!wallet.account && <p className="hint">先连接钱包才能发起交易。</p>}
      {!address && <p className="hint">先填写合约地址。</p>}

      {status?.kind === "pending" && (
        <p className="status status-pending">
          交易已广播，等待打包… <code>{status.hash}</code>
        </p>
      )}
      {status?.kind === "ok" && (
        <p className="status status-ok">
          已上链 · 区块 {status.blockNumber} · gasUsed {status.gasUsed}
          <br />
          <code>{status.hash}</code>
        </p>
      )}
      {status?.kind === "error" && <p className="status status-error">{status.message}</p>}
    </section>
  );
}
