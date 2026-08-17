import { useCallback, useEffect, useRef, useState } from "react";

/**
 * 按固定间隔拉取数据。只读浏览器没有 websocket 订阅，用轮询即可。
 * fetcher 必须是稳定引用（useCallback 包一层），否则每次渲染都会重建定时器。
 */
export function usePolling(fetcher, intervalMs = 4000, enabled = true) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  // 组件卸载后到达的响应不应再 setState，用 ref 标记生命周期。
  const alive = useRef(true);

  const run = useCallback(async () => {
    try {
      const result = await fetcher();
      if (!alive.current) return;
      setData(result);
      setError("");
    } catch (err) {
      if (!alive.current) return;
      setError(err.message);
    } finally {
      if (alive.current) setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    alive.current = true;
    if (!enabled) {
      setLoading(false);
      return () => {
        alive.current = false;
      };
    }
    run();
    const timer = setInterval(run, intervalMs);
    return () => {
      alive.current = false;
      clearInterval(timer);
    };
  }, [run, intervalMs, enabled]);

  return { data, error, loading, refresh: run };
}
