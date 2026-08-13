#!/usr/bin/env bash
set -euo pipefail

# Safe, read-mostly local demo. It never resets, deletes, exports, or prints keys.
# Set EDUD_BIN to an installed binary or a compatible command before running.
EDUD_BIN="${EDUD_BIN:-edud}"
KEYRING_BACKEND="${KEYRING_BACKEND:-test}"
CHAIN_ID="${CHAIN_ID:-edu}"
NODE="${NODE:-http://127.0.0.1:26657}"
ALICE_KEY="${ALICE_KEY:-alice}"
BOB_KEY="${BOB_KEY:-bob}"
VALIDATOR_ADDRESS="${VALIDATOR_ADDRESS:-}"
DELEGATE_AMOUNT="${DELEGATE_AMOUNT:-100000uedu}"
TRANSFER_AMOUNT="${TRANSFER_AMOUNT:-100000uedu}"

if [[ "$EDUD_BIN" == "edud" ]] && ! command -v edud >/dev/null 2>&1; then
  echo "edud not found; set EDUD_BIN='go run ./cmd/edud' or install the local binary." >&2
  exit 1
fi

run_edud() {
  # shellcheck disable=SC2086
  $EDUD_BIN "$@"
}

echo "== edu local demo (chain-id: $CHAIN_ID, node: $NODE) =="
echo "This script does not reset data and does not contain or print secrets."

echo "-- keys --"
run_edud keys list --keyring-backend "$KEYRING_BACKEND"

echo "-- latest block --"
run_edud status --node "$NODE"

echo "-- balances --"
ALICE_ADDRESS="$(run_edud keys show "$ALICE_KEY" -a --keyring-backend "$KEYRING_BACKEND")"
BOB_ADDRESS="$(run_edud keys show "$BOB_KEY" -a --keyring-backend "$KEYRING_BACKEND")"
run_edud query bank balances "$ALICE_ADDRESS" --node "$NODE"
run_edud query bank balances "$BOB_ADDRESS" --node "$NODE"

echo "-- optional transfer --"
if [[ "${DEMO_SEND:-0}" == "1" ]]; then
  run_edud tx bank send "$ALICE_ADDRESS" "$BOB_ADDRESS" "$TRANSFER_AMOUNT" \
    --from "$ALICE_KEY" --keyring-backend "$KEYRING_BACKEND" \
    --chain-id "$CHAIN_ID" --node "$NODE" --yes
else
  echo "Skipped. Set DEMO_SEND=1 to submit the configured transfer."
fi

if [[ -n "$VALIDATOR_ADDRESS" && "${DEMO_DELEGATE:-0}" == "1" ]]; then
  echo "-- optional delegation --"
  run_edud tx staking delegate "$VALIDATOR_ADDRESS" "$DELEGATE_AMOUNT" \
    --from "$ALICE_KEY" --keyring-backend "$KEYRING_BACKEND" \
    --chain-id "$CHAIN_ID" --node "$NODE" --yes
else
  echo "Delegation skipped. Set VALIDATOR_ADDRESS and DEMO_DELEGATE=1 to submit it."
fi

echo "Demo complete. Query rewards with:"
echo "$EDUD_BIN query distribution rewards $ALICE_ADDRESS --node $NODE"
