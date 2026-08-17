# Sepolia 部署记录

本文件只记录可在区块浏览器复核的公开信息。不含私钥、助记词、API Key 或完整 RPC URL。

## 合约

| 项 | 值 |
| --- | --- |
| 合约 | `EventStore` |
| 网络 | Sepolia（chainId `11155111`） |
| 地址 | [`0x275Bb3520c05eaed91c552c8FDceE09aA43a5775`](https://sepolia.etherscan.io/address/0x275Bb3520c05eaed91c552c8FDceE09aA43a5775) |
| 部署交易 | [`0xf3aed6558e6b1e3c4b5b7b032ad98f2b9b0c832e73bd46fbde0d620c8676ec9f`](https://sepolia.etherscan.io/tx/0xf3aed6558e6b1e3c4b5b7b032ad98f2b9b0c832e73bd46fbde0d620c8676ec9f) |
| 部署区块 | `11507193` |
| 部署时间 | 2026-08-17T09:14:00Z |
| gasUsed | `200297` |
| 部署者 | [`0x934124d582dd6618309b0905b4DE2631A2892EEe`](https://sepolia.etherscan.io/address/0x934124d582dd6618309b0905b4DE2631A2892EEe) |

部署区块通过对 `eth_getCode` 二分查找确定，可独立复现，不依赖浏览器 API。

## 事件写入

调用 `writeData("course", "sepolia-hello")`：

| 项 | 值 |
| --- | --- |
| 交易 | [`0xfa127e3e24808a9110cfba2567ab8ae6be7cc4e863dd0e83e0e4ff7867e9aa22`](https://sepolia.etherscan.io/tx/0xfa127e3e24808a9110cfba2567ab8ae6be7cc4e863dd0e83e0e4ff7867e9aa22) |
| 区块 | `11507198` |
| logIndex | `163` |
| 事件签名 | `DataWritten(address,bytes32,string,string,uint256)` |
| topic0 | `0xa7c24810bdea06e6b3047db504446dbf951014365bd00427154fe9fca5d6d82d` |

解码结果：

| 字段 | 值 |
| --- | --- |
| `writer` | `0x934124d582dd6618309b0905b4DE2631A2892EEe` |
| `keyHash` | `0xfd62e8c89af67daa90c1735c758d0db0a43a9f9ea8a6362483379d781f6267a9` |
| `key` | `course` |
| `value` | `sepolia-hello` |
| `timestamp` | `1786958112` |

`keyHash` 为 `keccak256("course")`，与本地链上同一 key 的哈希一致 —— 证明 indexed 参数的哈希与网络无关。

## Infura / Alchemy 对比

两个 provider 读取同一合约、同一区间，结果一致：

| Provider | chainId | 读到事件 | 耗时 |
| --- | --- | --- | --- |
| Infura | 11155111 | 1 条（block 11507198，`course=sepolia-hello`） | ~1920ms |
| Alchemy | 11155111 | 1 条（同上） | ~1571ms |

同一时刻两者返回的最新区块号均为 `11507200`。

结论：Provider 只是 JSON-RPC 的接入点，不影响链上数据本身；差异体现在可用性、限流策略和响应延迟上，而不在数据内容上。

## Subgraph

[subgraph/subgraph.yaml](../evm-event-lab/subgraph/subgraph.yaml) 已指向真实合约：

```yaml
network: sepolia
source:
  address: "0x275Bb3520c05eaed91c552c8FDceE09aA43a5775"
  startBlock: 11507193
```

`graph codegen` 与 `graph build` 均通过。

### 已发布到 The Graph Studio

| 项 | 值 |
| --- | --- |
| slug | `mychain` |
| 版本 | `v0.0.1` |
| Deployment ID | `QmXrhBYrz8Rz43PxNHAuQmEsSRvKjL6WmYDitMvP3p3wRp` |
| Studio 页面 | https://thegraph.com/studio/subgraph/mychain |
| 查询端点 | `https://api.studio.thegraph.com/query/1757875/mychain/v0.0.1` |

索引状态（`_meta` 查询）：已同步至区块 `11507268`，`hasIndexingErrors: false`。

`RecentDataWritten` 实际返回：

```json
{
  "id": "0xfa127e3e…7e9aa22a3000000",
  "writer": "0x934124d582dd6618309b0905b4de2631a2892eee",
  "keyHash": "0xfd62e8c89af67daa90c1735c758d0db0a43a9f9ea8a6362483379d781f6267a9",
  "key": "course",
  "value": "sepolia-hello",
  "timestamp": "1786958112",
  "blockNumber": "11507198",
  "transactionHash": "0xfa127e3e24808a9110cfba2567ab8ae6be7cc4e863dd0e83e0e4ff7867e9aa22"
}
```

按 `writer` 过滤的查询同样返回该条记录。

### 三种读取方式的一致性

| 方式 | 来源 | 结果 |
| --- | --- | --- |
| `provider.getLogs` | Infura JSON-RPC | 1 条，`course=sepolia-hello` |
| `contract.queryFilter` | Infura / Alchemy | 1 条，同上 |
| GraphQL `dataWrittens` | The Graph Studio | 1 条，同上 |

三者指向同一条日志（tx `0xfa127e3e…`，block 11507198），字段值完全一致。

差异在于**获取方式**：前两者每次查询都要让 RPC 节点现场扫描区块范围，范围大时慢且可能被限流；The Graph 在事件发生时就由 mapping 写成实体并建好索引，查询是直接读已索引的数据库，支持排序、过滤和分页，代价是需要额外部署与等待同步。

## 复核方式

```bash
cd evm-event-lab
npm run read:events:sepolia        # 需要 SEPOLIA_RPC_URL + SEPOLIA_EVENT_STORE_ADDRESS
npm run compare:providers          # 需要 INFURA_ / ALCHEMY_ 两个 URL
```

本地流程用不带后缀的 `npm run read:events`，两者读各自网络的变量，互不干扰。

`.env` 已被 `.gitignore` 排除，仓库中不含任何凭证。
