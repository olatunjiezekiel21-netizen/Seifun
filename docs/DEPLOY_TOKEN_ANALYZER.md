# Deploy: CosmWasm Token Analyzer (Sei Native)

Prerequisites:
- seid CLI configured with a funded key (KEY)
- jq, curl installed
- Rust toolchain

Build:
```bash
cd contracts/native/token-analyzer
make build
```

WASM is produced at:
`target/wasm32-unknown-unknown/release/token-analyzer.wasm`

Deploy env (defaults shown):
```bash
export CHAIN_ID=pacific-1
export NODE=https://sei-rpc.polkachu.com
export REST=https://sei-api.polkachu.com
export KEY=deployer
export FEES=20000usei
export GAS=auto
export GAS_ADJUSTMENT=1.4
```

Deploy:
```bash
./deploy.sh
```

Frontend env configuration (copy to .env or Netlify env):
```
VITE_SEI_NATIVE_CHAIN_ID=pacific-1
VITE_SEI_NATIVE_RPC=https://sei-rpc.polkachu.com
VITE_SEI_NATIVE_REST=https://sei-api.polkachu.com
VITE_TOKEN_ANALYZER_CONTRACT=sei1...your_contract
```

Verify a query:
```bash
curl "/cosmwasm/wasm/v1/contract//smart/e1wiZ2V0X3Rva2VuX2FuYWx5c2lzXCI6e1wiZGVub21cIjpcInVzZWlcIn19" | jq '.'
```

If no stored analysis yet, the frontend falls back to direct-chain analysis automatically.

