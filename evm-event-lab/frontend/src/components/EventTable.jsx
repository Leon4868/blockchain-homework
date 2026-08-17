function shorten(text, head = 8, tail = 6) {
  if (!text || text.length <= head + tail + 1) return text;
  return `${text.slice(0, head)}…${text.slice(-tail)}`;
}

function formatTime(seconds) {
  if (!seconds) return "-";
  return new Date(seconds * 1000).toLocaleString("zh-CN", { hour12: false });
}

export function EventTable({ rows, loading, error, emptyHint }) {
  if (loading) return <p className="hint">读取中…</p>;
  if (error) return <p className="status status-error">{error}</p>;
  if (!rows.length) return <p className="hint">{emptyHint}</p>;

  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>区块</th>
            <th>key</th>
            <th>value</th>
            <th>writer</th>
            <th>时间</th>
            <th>txHash</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="num">{row.blockNumber}</td>
              <td>
                <code>{row.key}</code>
              </td>
              <td>{row.value}</td>
              <td>
                <code title={row.writer}>{shorten(row.writer, 6, 4)}</code>
              </td>
              <td className="dim">{formatTime(row.timestamp)}</td>
              <td>
                <code title={row.transactionHash}>{shorten(row.transactionHash)}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
