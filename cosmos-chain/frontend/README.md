# edu 链浏览器

作业 1 的可视化界面：只读展示 `edu` 链的区块、账户余额、验证者、委托、奖励和交易。

技术栈：React 18 + Vite 8，无额外 UI 库。数据全部来自节点的 Cosmos REST API（默认 `localhost:1317`）。

## 只读设计

页面**不发起任何交易**，也不接触私钥或助记词。转账、委托仍然走命令行：

```bash
./scripts/demo.sh            # 只读查询
DEMO_SEND=1 ./scripts/demo.sh  # 执行转账
```

页面负责把结果可视化 —— 发完交易不用刷新，余额和交易列表会自动更新。

> 浏览器里发交易需要接 Keplr 钱包，而本地链不在 Keplr 的链注册表中，需要额外的 `experimentalSuggestChain` 配置。这不在当前范围内。

## 前置条件

节点必须开启 REST API。`app.toml` 里：

```toml
[api]
enable = true
swagger = true
address = "tcp://localhost:1317"
```

改完重启 `edud start`。用 `ignite chain serve` 启动时这项默认已开启。

## 启动

```bash
cd frontend
npm install
cp .env.example .env   # 按需填写地址备注
npm run dev
```

打开 http://localhost:5174/ 。

> Vite 8 默认只监听 `localhost`，用 `127.0.0.1:5174` 访问会连不上。

## 关于 CORS

节点默认 `enabled-unsafe-cors = false`，浏览器直连 `localhost:1317` 会被拦截。

因此 dev / preview server 代理了 `/api` → 节点 REST 地址（见 [vite.config.js](vite.config.js)），前端只请求同源路径，**不需要改动节点配置**。

如果要把 `dist/` 部署到其他静态服务器，需要自行配置反向代理，或者在节点上开启 CORS。

## 环境变量

| 变量 | 作用 | 默认值 |
| --- | --- | --- |
| `VITE_REST_TARGET` | 代理目标，即节点 REST 地址 | `http://localhost:1317` |
| `VITE_REST_BASE` | 前端请求基址 | `/api`（同源代理） |
| `VITE_DENOM` | 链上最小单位 | `uedu` |
| `VITE_DISPLAY_DENOM` | 展示单位 | `EDU` |
| `VITE_DECIMALS` | 精度 | `6` |
| `VITE_ACCOUNT_LABELS` | 地址备注，`name:address` 逗号分隔 | 空 |

地址备注用于把 `edu17p5ny…` 显示成 `alice`。取地址：

```bash
../build/edud keys show alice -a --keyring-backend test
```

地址是公开信息。**不要把私钥或助记词写进任何环境变量。**

## 页面内容

| 区块 | 数据来源 | 刷新间隔 |
| --- | --- | --- |
| 链状态 | `blocks/latest`、`node_info`、`staking/pool` | 3s / 30s / 10s |
| 账户 | `auth/accounts` + 逐个 `bank/balances` | 跟随区块高度变化 |
| 委托与奖励 | `staking/delegations`、`distribution/rewards` | 展开账户时按需拉取 |
| 验证者 | `staking/validators` | 10s |
| 最近交易 | `tx/v1beta1/txs?query=tx.height>0` | 6s |

账户列表只显示 `BaseAccount`（普通钱包），过滤掉 `bonded_tokens_pool` 这类模块账户。

出块间隔由相邻两次轮询的高度差和时间差估算，不是链上参数。
