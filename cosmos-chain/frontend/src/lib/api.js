// REST 基址。默认走 vite 代理的同源 /api，避免节点未开 CORS 时被浏览器拦截。
export const REST_BASE = import.meta.env.VITE_REST_BASE || "/api";

export const DENOM = import.meta.env.VITE_DENOM || "uedu";
export const DISPLAY_DENOM = import.meta.env.VITE_DISPLAY_DENOM || "EDU";
export const DECIMALS = Number(import.meta.env.VITE_DECIMALS || 6);

async function get(path) {
  const response = await fetch(`${REST_BASE}${path}`);
  if (!response.ok) {
    let detail = "";
    try {
      detail = (await response.json()).message || "";
    } catch {
      /* 节点异常时可能不是 JSON，忽略解析失败 */
    }
    throw new Error(detail || `HTTP ${response.status} · ${path}`);
  }
  return response.json();
}

/** uedu -> 1.234567 EDU，保留原始精度不做四舍五入。 */
export function formatAmount(amount, denom = DENOM) {
  if (denom !== DENOM) return `${amount} ${denom}`;
  const base = 10n ** BigInt(DECIMALS);
  const raw = BigInt(amount);
  const whole = raw / base;
  const frac = (raw % base).toString().padStart(DECIMALS, "0").replace(/0+$/, "");
  const wholeText = whole.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${wholeText}${frac ? `.${frac}` : ""} ${DISPLAY_DENOM}`;
}

export function formatCoins(coins) {
  if (!coins?.length) return "0";
  return coins.map((coin) => formatAmount(coin.amount.split(".")[0], coin.denom)).join(" + ");
}

export const api = {
  nodeInfo: () => get("/cosmos/base/tendermint/v1beta1/node_info"),
  latestBlock: () => get("/cosmos/base/tendermint/v1beta1/blocks/latest"),
  blockAt: (height) => get(`/cosmos/base/tendermint/v1beta1/blocks/${height}`),
  stakingPool: () => get("/cosmos/staking/v1beta1/pool"),

  accounts: () => get("/cosmos/auth/v1beta1/accounts?pagination.limit=200"),
  balances: (address) => get(`/cosmos/bank/v1beta1/balances/${address}`),

  validators: () => get("/cosmos/staking/v1beta1/validators?pagination.limit=100"),
  delegations: (address) => get(`/cosmos/staking/v1beta1/delegations/${address}`),
  rewards: (address) => get(`/cosmos/distribution/v1beta1/delegators/${address}/rewards`),

  // tx.height>0 匹配所有已上链交易；order_by 让最新的排在前面。
  recentTxs: (limit = 20) =>
    get(`/cosmos/tx/v1beta1/txs?query=${encodeURIComponent("tx.height>0")}&order_by=ORDER_BY_DESC&limit=${limit}`),
};

/** 只保留普通钱包账户，模块账户（bonded_tokens_pool 等）不属于作业演示范围。 */
export function isUserAccount(account) {
  return account["@type"] === "/cosmos.auth.v1beta1.BaseAccount";
}

export function accountAddress(account) {
  return account.address || account.base_account?.address || "";
}

/** 从 VITE_ACCOUNT_LABELS 解析 "alice:edu1...,bob:edu1..." 形式的地址备注。 */
export function parseLabels(raw = import.meta.env.VITE_ACCOUNT_LABELS || "") {
  const labels = {};
  for (const pair of raw.split(",")) {
    const [name, address] = pair.split(":").map((part) => part?.trim());
    if (name && address) labels[address] = name;
  }
  return labels;
}

/** 摘出交易里的核心信息，用于列表展示。 */
export function summarizeTx(txResponse) {
  const messages = txResponse.tx?.body?.messages || [];
  const first = messages[0] || {};
  const type = (first["@type"] || "").split(".").pop() || "Unknown";
  return {
    hash: txResponse.txhash,
    height: Number(txResponse.height),
    code: txResponse.code,
    gasUsed: txResponse.gas_used,
    gasWanted: txResponse.gas_wanted,
    type,
    messageCount: messages.length,
    from: first.from_address || first.delegator_address || "",
    to: first.to_address || first.validator_address || "",
    amount: first.amount
      ? formatCoins(Array.isArray(first.amount) ? first.amount : [first.amount])
      : "",
    memo: txResponse.tx?.body?.memo || "",
  };
}
