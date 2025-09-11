WASM_TARGET := wasm32-unknown-unknown
CONTRACT_NAME := token-analyzer
OPTIMIZER := cargo

.PHONY: build optimize schema clean

build:
	cargo build --release --target $(WASM_TARGET)

optimize:
	cargo build --release --target $(WASM_TARGET)
	@echo "WASM built at target/wasm32-unknown-unknown/release/$(CONTRACT_NAME).wasm"

schema:
	cargo schema

clean:
	cargo clean
