# 验收标准

## Cosmos 线

- [ ] 能说明 Cosmos SDK 0.53.6 与 CometBFT 各自的职责。
- [ ] 能启动学习链并查询当前区块高度。
- [ ] Genesis 中存在初始账户和初始代币分配。
- [ ] 能解释 `edu`（链名）、`edud`（二进制）、`edu`（地址前缀）、`uedu`（denom）的区别。
- [ ] `alice`、`bob`、`validator` 的实际地址已在本地记录（不记录私钥）。
- [ ] 至少完成一笔 Bank 转账，并核对发送方和接收方余额变化。
- [ ] 能说明 validator、delegation、reward 的关系。
- [ ] 能完成或演示 validator/delegation/reward 查询。
- [ ] 报告明确写出：共识是 PoS，不是 PoW。

## EVM 线

- [ ] Hardhat 2 本地节点可作为 JSON-RPC 数据源。
- [ ] ethers v6 能读取 chain ID、区块、余额和交易信息。
- [ ] Infura 与 Alchemy 的 Sepolia Provider 配置只使用本地秘密配置。
- [ ] EventStore 合约包含写数据函数和事件日志。
- [ ] 能从 Receipt 或事件过滤器读回 `writer`、`key`、`value`、`timestamp`。
- [ ] 已准备 Sepolia 部署和区块浏览器核验步骤；没有证据时不得写成“已部署”。
- [ ] Subgraph schema、mapping 和 GraphQL 查询能够对应 EventStore 事件字段。
- [ ] 能解释 RPC 直接查询与 The Graph 索引查询的差异。

## 文档与安全

- [ ] 两条线目录和依赖保持独立。
- [ ] 不包含私钥、助记词、密码、token 或 API Key。
- [ ] 所有真实交易、部署和线上结果均有可复核证据后再补充。
