# edu Cosmos 链

这是一个基于 Ignite CLI v29、Cosmos SDK 0.53.6 和 CometBFT 的本地 PoS 教学链。链名为
`edu`，节点命令为 `edud`，Bech32 地址前缀为 `edu`，原生/手续费/质押 denom 统一为 `uedu`。

## 项目结构

- `app/`：Cosmos SDK 应用和标准模块装配。
- `cmd/edud/`：节点二进制与 CLI 入口。
- `config.yml`：Genesis 账户、faucet、链 ID 和验证者配置。
- `scripts/demo.sh`：默认只读、需要显式开关才发送交易的本地演示脚本。
- `frontend/`：只读链浏览器，把区块、余额、验证者、委托和交易可视化。

教学账户为 `alice`、`bob` 和 `validator`。Genesis 给三者分配 `uedu`，并从
`validator` 的余额中绑定一部分作为初始验证者质押。

## 快速开始

```bash
ignite chain serve
```

该命令会构建 `edud`、初始化本地 Genesis 并启动节点。停止使用 `Ctrl-C`。如果本机已经有
开发链数据，先确认是否应该复用；本项目的演示脚本不会主动删除或重置数据。

链启动后，在另一个终端查询：

```bash
edud status
edud keys list --keyring-backend test
edud query block
```

如果还未安装 `edud`，可以先执行 `make install`，也可以把查询命令中的 `edud` 替换为
`go run ./cmd/edud`。

## 钱包分发与余额

`config.yml` 中的账户会在本地开发链初始化时创建并获得 Genesis 代币。先取得公开地址，再查余额：

```bash
ALICE_ADDRESS=$(edud keys show alice -a --keyring-backend test)
BOB_ADDRESS=$(edud keys show bob -a --keyring-backend test)

edud query bank balances "$ALICE_ADDRESS"
edud query bank balances "$BOB_ADDRESS"
```

这里只展示公开地址。不要打印、复制或提交助记词与私钥。

## Bank 转账

```bash
edud tx bank send alice "$BOB_ADDRESS" 100000uedu \
  --from alice \
  --keyring-backend test \
  --chain-id edu \
  --yes
```

交易进入区块后，再查询 alice 和 bob 的余额，验证发送方减少、接收方增加。

## 验证者、委托和奖励

质押交易需要 `eduvaloper...` 格式的验证者 operator 地址：

```bash
VALIDATOR_OPERATOR=$(edud keys show validator -a --bech val --keyring-backend test)

edud query staking validator "$VALIDATOR_OPERATOR"
edud tx staking delegate "$VALIDATOR_OPERATOR" 100000uedu \
  --from alice \
  --keyring-backend test \
  --chain-id edu \
  --yes
edud query staking delegations "$ALICE_ADDRESS"
edud query distribution rewards "$ALICE_ADDRESS"
```

奖励需要经过出块后才会累积。本作业所说的“挖矿”实际是 PoS 验证者参与共识和出块，以及
验证者/委托人获得奖励；它不是比特币式 PoW 算力挖矿。

## 安全演示脚本

先让链保持运行，然后执行只读演示：

```bash
./scripts/demo.sh
```

只有显式设置开关时脚本才会发交易：

```bash
DEMO_SEND=1 ./scripts/demo.sh
VALIDATOR_ADDRESS=<eduvaloper地址> DEMO_DELEGATE=1 ./scripts/demo.sh
```

脚本使用本地 `test` keyring，不包含助记词、私钥，也不会重置链数据。

## 链浏览器

`frontend/` 提供一个只读网页，把上面这些查询结果可视化：实时高度与出块间隔、三个账户
余额、验证者绑定状态与佣金、委托与待领取奖励、以及最近交易列表。

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

打开 http://localhost:5174/ 。

页面不发起任何交易 —— 转账和委托仍走 `demo.sh`，页面会在下一次轮询时自动反映变化，
不需要手动刷新。数据来自节点 REST API，因此 `app.toml` 里必须有 `[api] enable = true`
（`ignite chain serve` 默认已开启）。详见 [frontend/README.md](frontend/README.md)。

## Faucet

开发 faucet 由 `config.yml` 配置，使用 `bob` 账户和 `uedu`。启动 `ignite chain serve` 后，
以终端打印出的 faucet 地址为准；该服务只用于本地测试币分发。

## 验收清单

- 节点持续产生区块，并能查询区块高度。
- `alice`、`bob`、`validator` 地址和 Genesis 余额可查。
- alice 到 bob 的 Bank 转账成功且余额变化正确。
- validator 状态、alice 的委托和奖励可查。
- 报告明确说明这是 PoS 出块/质押奖励，不是 PoW。
- 链浏览器能同步显示上述高度、余额、验证者与交易变化。

