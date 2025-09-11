#!/usr/bin/env bash
set -euo pipefail

# Simple deploy script for CosmWasm token-analyzer on Sei
# Requirements: wasmcli (seid), jq, curl, a funded key

CHAIN_ID=${CHAIN_ID:-pacific-1}
NODE=${NODE:-https://sei-rpc.polkachu.com}
REST=${REST:-https://sei-api.polkachu.com}
KEY=${KEY:-deployer}
FEES=${FEES:-20000usei}
GAS=${GAS:-auto}
GAS_ADJUSTMENT=${GAS_ADJUSTMENT:-1.4}

WASM=target/wasm32-unknown-unknown/release/token-analyzer.wasm

if [ ! -f "$WASM" ]; then
  echo "WASM not found at $WASM. Run: make build" >&2
  exit 1
fi

echo "Uploading contract..."
CODE_ID=$(seid tx wasm store "$WASM" \
  --from "$KEY" --chain-id "$CHAIN_ID" --node "$NODE" \
  --gas "$GAS" --gas-adjustment "$GAS_ADJUSTMENT" --fees "$FEES" \
  -y -b sync | jq -r '.txhash')

echo "Waiting for store tx... $CODE_ID"
sleep 8

STORE_RES=$(curl -s "$REST/cosmos/tx/v1beta1/txs/$CODE_ID")
CODE_NUMBER=$(echo "$STORE_RES" | jq -r '.tx_response.logs[0].events[] | select(.type=="store_code").attributes[] | select(.key=="code_id").value')
if [ -z "$CODE_NUMBER" ] || [ "$CODE_NUMBER" == "null" ]; then
  echo "Failed to get code id" >&2
  echo "$STORE_RES" | jq '.' >&2
  exit 1
fi

echo "Instantiating code id $CODE_NUMBER ..."
INIT_MSG='{"admin":null}'
TXH=$(seid tx wasm instantiate "$CODE_NUMBER" "$INIT_MSG" \
  --from "$KEY" --label token-analyzer-$(date +%s) --no-admin \
  --chain-id "$CHAIN_ID" --node "$NODE" --gas "$GAS" --gas-adjustment "$GAS_ADJUSTMENT" --fees "$FEES" \
  -y -b sync | jq -r '.txhash')

echo "Waiting for instantiate tx... $TXH"
sleep 8
INST_RES=$(curl -s "$REST/cosmos/tx/v1beta1/txs/$TXH")
CONTRACT_ADDR=$(echo "$INST_RES" | jq -r '.tx_response.logs[0].events[] | select(.type=="instantiate").attributes[] | select(.key=="_contract_address").value' | tail -n1)

if [ -z "$CONTRACT_ADDR" ] || [ "$CONTRACT_ADDR" == "null" ]; then
  echo "Failed to get contract address" >&2
  echo "$INST_RES" | jq '.' >&2
  exit 1
fi

echo "Contract deployed: $CONTRACT_ADDR"
echo "Set these in your .env or Netlify env vars:"
echo "VITE_SEI_NATIVE_CHAIN_ID=$CHAIN_ID"
echo "VITE_SEI_NATIVE_RPC=$NODE"
echo "VITE_SEI_NATIVE_REST=$REST"
echo "VITE_TOKEN_ANALYZER_CONTRACT=$CONTRACT_ADDR"
