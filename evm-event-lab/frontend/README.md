# EventStore 前端控制台

作业 2 的可视化界面：连接 MetaMask 写入 `DataWritten` 事件，再用 **JSON-RPC / ethers.js / The Graph** 三种方式把同一批日志读回来，并排比较。

技术栈：React 18 + Vite 8 + ethers v6，无额外 UI 库。

## 前置条件

先把本地链和合约跑起来（在 `evm-event-lab/` 目录）：

```bash
npm run node          # 终端 A：本地链 127.0.0.1:8545
npm run deploy:local  # 终端 B：部署 EventStore，记下地址
```

## 启动

```bash
cd frontend
npm install
cp .env.example .env   # 把部署地址填进 VITE_EVENT_STORE_ADDRESS
npm run dev
```

打开 http://localhost:5173/ 。

> Vite 8 默认只监听 `localhost`，用 `127.0.0.1:5173` 访问会连不上。需要局域网访问时加 `--host`。

## 环境变量

| 变量 | 作用 | 默认值 |
| --- | --- | --- |
| `VITE_RPC_URL` | 只读 RPC，读取事件时使用 | `http://127.0.0.1:8545` |
| `VITE_EVENT_STORE_ADDRESS` | 已部署的合约地址 | 空（可在页面上填） |
| `VITE_FROM_BLOCK` | 事件扫描起始区块 | `0` |
| `VITE_SUBGRAPH_URL` | The Graph 查询端点 | 空（该读法不可用） |

页面上的四项配置会存进 `localStorage`，改完刷新不丢。环境变量只作为首次打开时的默认值。

## MetaMask 配置

写入交易走 MetaMask，需要先添加本地网络：

- 网络名称：Hardhat Local
- RPC URL：`http://127.0.0.1:8545`
- 链 ID：`31337`
- 货币符号：ETH

页面顶栏检测到当前不在 31337 时会给出「切到本地链」按钮，自动调用 `wallet_switchEthereumChain`（钱包里没有这条网络时回退到 `wallet_addEthereumChain`）。

导入 Hardhat 节点启动时打印的任意一个测试私钥即可获得测试 ETH。**这些私钥是公开的，只能用于本地链。**

## 三种读取方式

| Tab | 实现 | 对应代码 |
| --- | --- | --- |
| JSON-RPC | `provider.getLogs` + 手工 `encodeFilterTopics` / `parseLog` | [readViaRpc](src/lib/contract.js) |
| ethers.js | `contract.queryFilter(contract.filters.DataWritten())` | [readViaEthers](src/lib/contract.js) |
| The Graph | GraphQL `dataWrittens` 查询 | [readViaSubgraph](src/lib/contract.js) |

前两种直连 RPC，结果应当完全一致；第三种需要 Subgraph 已部署并在配置里填入查询端点，否则会提示未配置。

三种来源的字段会归一化成同一份表格结构，所以切 tab 时表格列不变，方便对比。

## 实时更新

页面通过 `contract.on("DataWritten", …)` 订阅新日志，链上一有新事件就自动刷新表格。

订阅建立时会先记录当前区块高度，只有更高区块的日志才计入「已实时捕获」计数 —— 轮询式 provider 在建立订阅的瞬间会把当前区块的历史日志一并推过来，不做这层过滤会把旧事件误报成新事件。

## 安全边界

`.env` 已被 `.gitignore` 排除。这个前端不接触私钥：写入交易一律由 MetaMask 签名，页面只拿到 signer 接口。不要把测试网私钥填进任何环境变量。
