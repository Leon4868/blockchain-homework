# 总体架构

## 1. 双线结构

```text
区块链学习项目
├── Cosmos 线：Cosmos SDK 0.53.6 + CometBFT
│   ├── Genesis 初始账户与代币分发
│   ├── Bank 转账
│   └── PoS：validator → delegation → reward
└── EVM 线：Hardhat 2 + ethers v6
    ├── 本地 EVM RPC / Sepolia RPC
    ├── Infura / Alchemy
    ├── EventStore.sol → Event Log
    └── The Graph → GraphQL
```

两条线不是同一条链，也不共享地址格式或交易格式。Cosmos 使用 Cosmos 账户与 ABCI/RPC 生态；EVM 使用 `0x` 地址、JSON-RPC、Solidity 和日志 topics。

## 2. Cosmos 数据流

```text
Genesis 分发账户
        ↓
alice / bob / validator（统一使用 uedu）
        ↓
Bank MsgSend 转账
        ↓
CometBFT 打包并确认区块
        ↓
validator 出块与验证
        ↓
delegation → reward 查询
```

“挖矿”只作为初学者易懂的类比；实现和报告中使用“PoS 出块、质押、委托、奖励”。

## 3. EVM 数据流

```text
ethers v6 Provider
   ├── Infura
   ├── Alchemy
   └── Hardhat 本地 RPC
          ↓
EventStore.writeData()
          ↓
Ethereum Transaction Receipt / Event Log
          ├── ethers queryFilter / getLogs
          └── The Graph mapping
                    ↓
                 GraphQL Entity
```

The Graph 读取的是合约事件日志，经 Subgraph mapping 转成可查询实体，不等同于直接读取合约存储变量。

## 4. 配置边界

链 ID、RPC 地址、部署账户等运行配置应由本地环境变量或未提交配置提供。文档只保留变量名称和流程，不保留任何秘密值。
