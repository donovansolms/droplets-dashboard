#
# A Makefile to build, run and test Go code
#

.PHONY: default build fmt lint run run_race test clean vet docker_build docker_run docker_clean .start_redis

GIT_COMMIT := $(shell git rev-list -1 HEAD)
BRANCH_NAME := $(shell git rev-parse --abbrev-ref HEAD)
# This makes the APP_NAME be the name of the current directory
# Ex. in path /home/dev/app/my-app the APP_NAME will be set to my-app
APP_NAME := $(notdir $(CURDIR))
SERVICE_NAME := "droplets-indexer"

default: build ## Default: Build the binary for the service

dependencies: ## Install dependencies for the service
	go mod tidy

build: ## Build the binary for the service
	CGO_ENABLED=0 go build -o ./bin/${APP_NAME} ./src/*.go

run: build ## Build and run the service binary
	LOG_LEVEL=debug \
	LOG_FORMAT=text \
	SERVICE_NAME=${SERVICE_NAME} \
	CELATONE_QUERY="https://celatone-api-prod.alleslabs.dev/v1/neutron/neutron-1/accounts/neutron19tth7r78awh6m8f9zs93d4u5su0azhc0755zmzyrzpzxqjnfuyzs7k8tt7/txs?limit=1&offset=0&is_wasm=true&is_move=false&is_initia=false&is_send=false&is_ibc=false&is_instantiate=false&is_store_code=false&is_execute=false&is_migrate=false&is_update_admin=false&is_clear_admin=false&is_move_publish=false&is_move_upgrade=false&is_move_execute=false&is_move_script=false&is_opinit=false" \
	DROP_ATOM_QUERY="https://neutron-rest.cosmos-apis.com/cosmwasm/wasm/v1/contract/neutron16m3hjh7l04kap086jgwthduma0r5l0wh8kc6kaqk92ge9n5aqvys9q6lxr/smart/eyJ0b3RhbF9ib25kZWQiOnt9fQ%3D%3D" \
	DATABASE_DSN="host=localhost user=admin password=admin1 dbname=roidrunner port=5432 sslmode=disable TimeZone=UTC" \
	RPC_ENDPOINT="https://rpc-lb.neutron.org:443/" \
	DROPLETS_CONTRACT_ADDRESS="neutron19tth7r78awh6m8f9zs93d4u5su0azhc0755zmzyrzpzxqjnfuyzs7k8tt7" \
	TEMP_HISTORY_HEIGHT=13278959 \
	TEMP_HISTORY_DATE="2024-08-09T21:00:10" \
	./bin/${APP_NAME}

run_race: ## Run the service with race condition checking enabled
	# Add your environment variable here
	LOG_LEVEL=debug \
	LOG_FORMAT=text \
	SERVICE_NAME=${SERVICE_NAME} \
	go run -race ./src/*.go

fmt: ## Format the code using `go fmt`
	go fmt ./...

test: ## Run the tests
	go test ./... -v

test_cover: ## Run tests with a coverage report
	go test ./... -v -cover -covermode=count -coverprofile=./coverage.out

test_cover_view: test_cover ## Run tests with coverage report and open HTML view
	go tool cover -html=coverage.out

clean: ## Remove compiled binaries from bin/
	rm ./bin/*

help: ## Display this help screen
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'