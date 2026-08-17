import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// 节点默认 enabled-unsafe-cors = false，浏览器直连 1317 会被 CORS 拦下。
// 这里由 dev / preview server 代理 /api，前端只请求同源地址，不必改动链上配置。
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const target = env.VITE_REST_TARGET || "http://localhost:1317";
  const proxy = {
    "/api": { target, changeOrigin: true, rewrite: (path) => path.replace(/^\/api/, "") },
  };

  return {
    plugins: [react()],
    server: { port: 5174, proxy },
    preview: { port: 4174, proxy },
  };
});
