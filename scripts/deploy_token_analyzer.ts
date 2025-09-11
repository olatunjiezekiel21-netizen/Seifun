// CosmJS-based deploy script using PRIVATE_KEY
// Env required:
// SEI_NATIVE_RPC, SEI_NATIVE_REST, SEI_NATIVE_CHAIN_ID, PRIVATE_KEY

import { DirectSecp256k1HdWallet, DirectSecp256k1Wallet } from "@cosmjs/proto-signing";
import { SigningCosmWasmClient, UploadResult } from "@cosmjs/cosmwasm-stargate";
import { GasPrice } from "@cosmjs/stargate";
import fs from "fs";
import path from "path";

async function main() {
  const rpc = process.env.SEI_NATIVE_RPC || process.env.VITE_SEI_NATIVE_RPC || "https://sei-rpc.polkachu.com";
  const rest = process.env.SEI_NATIVE_REST || process.env.VITE_SEI_NATIVE_REST || "https://sei-api.polkachu.com";
  const chainId = process.env.SEI_NATIVE_CHAIN_ID || process.env.VITE_SEI_NATIVE_CHAIN_ID || "pacific-1";
  const priv = process.env.PRIVATE_KEY;
  if (!priv) throw new Error("Missing PRIVATE_KEY env var");

  const gasPrice = GasPrice.fromString("0.1usei");

  // Create wallet from raw secp256k1 private key (hex)
  const wallet = await DirectSecp256k1Wallet.fromKey(Buffer.from(priv.replace(/^0x/, ""), "hex"), "sei");
  const [account] = await wallet.getAccounts();
  console.log("Deployer:", account.address);

  const client = await SigningCosmWasmClient.connectWithSigner(rpc, wallet, { gasPrice });

  // Load wasm file
  const wasmPath = path.resolve(__dirname, "../contracts/native/token-analyzer/target/wasm32-unknown-unknown/release/token-analyzer.wasm");
  if (!fs.existsSync(wasmPath)) throw new Error("WASM not found, build first (make build)");
  const wasm = fs.readFileSync(wasmPath);

  console.log("Uploading contract...");
  const uploadRes: UploadResult = await client.upload(account.address, wasm, "auto");
  console.log("Code ID:", uploadRes.codeId);

  console.log("Instantiating...");
  const initMsg = { admin: null } as any;
  const { contractAddress } = await client.instantiate(account.address, uploadRes.codeId, initMsg, `token-analyzer-${Date.now()}`, "auto", { admin: undefined });
  console.log("Contract Address:", contractAddress);

  // Print env hints
  console.log("\nSet these env vars:");
  console.log("VITE_SEI_NATIVE_CHAIN_ID=", chainId);
  console.log("VITE_SEI_NATIVE_RPC=", rpc);
  console.log("VITE_SEI_NATIVE_REST=", rest);
  console.log("VITE_TOKEN_ANALYZER_CONTRACT=", contractAddress);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

