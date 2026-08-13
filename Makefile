.PHONY: help cosmos-tidy cosmos-test cosmos-build evm-install evm-compile evm-test graph-codegen graph-build check

help:
	@echo "Available targets:"
	@echo "  cosmos-tidy   Download and normalize Cosmos Go modules"
	@echo "  cosmos-test   Run Cosmos unit tests"
	@echo "  cosmos-build  Build the edud node binary"
	@echo "  evm-install   Install EVM and Subgraph dependencies"
	@echo "  evm-compile   Compile EventStore.sol"
	@echo "  evm-test      Run Hardhat tests"
	@echo "  graph-codegen Generate Subgraph types"
	@echo "  graph-build   Build the Subgraph"
	@echo "  check         Run local compile/test/build checks"

cosmos-tidy:
	$(MAKE) -C cosmos-chain tidy

cosmos-test:
	$(MAKE) -C cosmos-chain test

cosmos-build:
	$(MAKE) -C cosmos-chain build

evm-install:
	cd evm-event-lab && npm install
	cd evm-event-lab && npm run graph:install

evm-compile:
	cd evm-event-lab && npm run compile

evm-test:
	cd evm-event-lab && npm test

graph-codegen:
	cd evm-event-lab && npm run graph:codegen

graph-build:
	cd evm-event-lab && npm run graph:build

check: cosmos-test cosmos-build evm-compile evm-test graph-codegen graph-build
