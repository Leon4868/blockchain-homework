# 变更记录：2026-08-12

## 项目框架初始化

- 创建统一项目 README。
- 创建需求说明、总体架构和验收标准。
- 明确 Cosmos SDK 0.53.6/CometBFT 与 EVM Hardhat 2/ethers v6 两条独立技术线。
- 明确 Cosmos 采用 PoS，包含 Genesis 分发、Bank 转账、validator、delegation、reward。
- 明确 EVM 线包含 Sepolia、Infura、Alchemy、EventStore 和 The Graph 学习目标。
- 明确不写入密钥，不宣称尚未发生的测试网部署。
- 生成 Cosmos SDK 0.53.6 应用、`edud` 命令入口和本地演示脚本。
- 创建 Hardhat 2 合约测试、ethers v6 RPC/日志脚本与 The Graph Subgraph。
- 增加统一 Makefile 和安全忽略规则。

## 已验证

- Cosmos `edud` 二进制构建成功，命令入口可运行，`go test ./...` 全部通过。
- `EventStore.sol` 编译成功，Hardhat 测试 `2 passing`。
- 本地 Hardhat 节点完成部署、事件写入和 RPC 区块读取。
- 同一条 `DataWritten` 已通过 `provider.getLogs`、`queryFilter` 和 Receipt 读回。
- Subgraph `graph codegen` 与 `graph build` 成功。
- 根目录统一入口 `make check` 已通过，覆盖 Cosmos vet/test/build、Solidity 编译与测试、Subgraph codegen/build。
- 根项目和 Subgraph 的 npm 审计均无 critical 级别问题；仍存在仅用于开发工具链的非 critical 告警，未使用强制升级破坏当前 Hardhat 2 兼容性。

## 尚未完成

- Cosmos 节点启动、实际 Bank 转账、委托和奖励查询的运行验收。
- Sepolia 部署、Infura/Alchemy 实际读取和 The Graph Studio 发布。
