# 需求说明

## 1. 目标

通过两个相互独立的实验，理解应用链和 EVM 链上数据读取的基本流程。面向初学者，要求每个环节都能说明“谁发起、数据写在哪里、如何读取、如何验证”。

## 2. Cosmos 线

技术基线：Cosmos SDK 0.53.6、CometBFT。

功能要求：

1. 链名为 `edu`，节点二进制为 `edud`，Bech32 地址前缀为 `edu`，原生/质押 denom 为 `uedu`。
2. 使用 `alice`、`bob`、`validator` 三个本地教学账户；具体地址以实际初始化结果为准。
3. 在 Genesis 中为学习账户分发初始代币。
4. 使用 Bank 模块完成账户间转账，并能查询余额和交易结果。
5. 配置 validator，理解节点出块和验证交易的过程。
6. 支持 delegation，并能查询委托状态。
7. 支持 reward 查询，说明验证者奖励与委托人收益的关系。
8. 明确采用 PoS，不实现或声称实现 PoW 挖矿。

## 3. EVM 线

技术基线：Hardhat 2、ethers v6、Sepolia、Infura、Alchemy、EventStore、The Graph。

功能要求：

1. 通过普通 EVM JSON-RPC 查询链 ID、区块、账户余额和交易。
2. 使用 ethers v6 分别连接 Infura 和 Alchemy；连接信息只从本地环境变量读取。
3. 编写 EventStore 合约，通过事件日志写入 `writer`、`key`、`value` 和时间戳。
4. 设计本地开发链到 Sepolia 测试链的部署流程，但不在本文档中宣称已经部署。
5. 使用 ethers v6 从交易 Receipt、日志过滤器或 `queryFilter` 读取事件。
6. 使用 The Graph 将事件映射为实体，并通过 GraphQL 查询返回数据。

## 4. 安全与范围

不得提交或记录私钥、助记词、API Key、token、密码或完整 RPC 密钥 URL。本地验证结果可以记录，测试网部署只有在合约地址、交易哈希和查询结果可复核后才能标记完成。
