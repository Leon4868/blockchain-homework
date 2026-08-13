# EVM Event Lab + The Graph

这是作业 2 的独立实验：用 Hardhat 2 建立本地 EVM 节点，用 ethers.js v6 读取 JSON-RPC
和事件日志，再由 The Graph 把 `DataWritten` 日志索引成 GraphQL 数据。当前项目没有宣称已经
部署到 Sepolia，也没有宣称 Subgraph 已发布。

## 项目结构

```text
evm-event-lab/
├── contracts/EventStore.sol       # 只通过 Event Log 写数据的合约
├── test/EventStore.test.js        # 事件与输入边界测试
├── scripts/                       # 部署、RPC、写入、日志读取脚本
└── subgraph/                      # manifest、ABI、schema、mapping、查询
```

## 1. 安装与编译

```bash
npm install
npm run graph:install
cp .env.example .env
npm run compile
npm test
```

`.env.example` 只有占位符。真实 RPC URL 和测试钱包私钥只能保存在被 Git 忽略的 `.env`。

## 2. 本地节点与部署

终端 A 保持节点运行：

```bash
npm run node
```

终端 B 部署到这个持久的 localhost 节点：

```bash
npm run deploy:local
```

记录输出的合约地址，将它写入 `.env` 的 `EVENT_STORE_ADDRESS`。不要改用一次性的
`--network hardhat` 后再从另一个进程读取，因为该临时链会随部署进程结束而消失。

## 3. ethers.js 读取普通 RPC

```bash
npm run read:rpc
```

默认读取 `http://127.0.0.1:8545`，返回 chain ID、最新区块、区块哈希和交易数量。设置
`RPC_URL` 后也可以读取任意兼容 EVM JSON-RPC。

把 Infura 和 Alchemy 的 Sepolia URL 分别填入本地 `.env` 后执行：

```bash
npm run compare:providers
```

脚本会分别读取两个服务的 chain ID 和最新区块高度，便于验证它们读取的是同一条链。

## 4. 事件写入与三种读取方式

`EventStore.writeData(key, value)` 不保存合约 storage，而是发出：

```solidity
DataWritten(
    address indexed writer,
    bytes32 indexed keyHash,
    string key,
    string value,
    uint256 timestamp
)
```

在 `.env` 配置 `EVENT_STORE_ADDRESS`、`DATA_KEY`、`DATA_VALUE` 后执行：

```bash
npm run write:local
npm run read:events
```

读取脚本展示三种方式：

1. `provider.getLogs`：底层 JSON-RPC 日志过滤；
2. `contract.queryFilter`：ethers.js 合约事件封装；
3. `getTransactionReceipt`：从事件所属交易的 Receipt 查看日志。

建议把 `FROM_BLOCK` 设置成合约部署区块，避免从创世块扫描。

## 5. Sepolia

只使用专门的测试钱包和测试 ETH。本地 `.env` 配置 `SEPOLIA_RPC_URL` 与
`DEPLOYER_PRIVATE_KEY` 后执行：

```bash
npm run deploy:sepolia
npm run write:sepolia
RPC_URL=<SEPOLIA_RPC_URL> npm run read:events
```

成功后再记录合约地址、部署交易哈希、部署区块和 Etherscan 链接。没有这些证据前，作业报告
不能写成“已部署”。

## 6. The Graph

`subgraph/subgraph.yaml` 指向 Sepolia，初始零地址和 `startBlock: 0` 只是本地 codegen/build
占位符。真实索引前必须换成实际合约地址和部署区块，然后执行：

```bash
npm run graph:codegen
npm run graph:build
```

- `subgraph.yaml`：声明网络、地址、ABI、起始块和事件处理器；
- `schema.graphql`：定义可查询的 `DataWritten` 实体；
- `src/mapping.ts`：把合约事件转换为实体；
- `queries/data-written.graphql`：提供最近写入和按 writer 查询示例。

发布到 The Graph Studio 时按其当前流程配置认证；部署凭证不得进入仓库。

## 工具链安全边界

当前依赖审计没有 critical 级别问题。Hardhat 2 和 The Graph CLI 的开发依赖仍可能报告
非 critical 告警，因此这些命令只应用于可信源码和可信 RPC；不要为了清空告警执行会破坏
Hardhat 2 兼容性的强制大版本升级。测试网钱包也应与真实资产钱包完全隔离。

## 验收顺序

编译 → 合约测试 → 本地持久节点部署 → ethers 写入 → 三种方式读日志 → Sepolia 部署 →
Infura/Alchemy 对比 → Subgraph codegen/build → GraphQL 查询。
