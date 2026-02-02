##@ Help

# The help target prints out all targets with their descriptions organized
# beneath their categories. The categories are represented by '##@' and the
# target descriptions by '##'. The awk commands is responsible for reading the
# entire set of makefiles included in this invocation, looking for lines of the
# file as xyz: ## something, and then pretty-format the target and help. Then,
# if there's a line with ##@ something, that gets pretty-printed as a category.
# More info on the usage of ANSI control characters for terminal formatting:
# https://en.wikipedia.org/wiki/ANSI_escape_code#SGR_parameters
# More info on the awk command:
# http://linuxcommand.org/lc3_adv_awk.php
.PHONY: help
help: ## Shows the help
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^[\/%.a-zA-Z_0-9-]+:.*?##/ { printf "  \033[36m%-30s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

ALL_TESTS := $(shell find ./src -name '*.test.ts')

##@ Development

.PHONY: migration
migration: db ## Create a new migration with 'make migration <name>'
	npx dotenv -e .env.dev -- npx prisma migrate dev --name $(filter-out $@,$(MAKECMDGOALS))

.PHONY: migrate-prod
migrate-prod: ## Migrate production database
	npx dotenv -e .env -- npx prisma migrate deploy

.PHONY: db-migrate-dev
db-migrate-dev: db ## Apply existing migrations to the database
	@echo "Waiting for the database to be ready..."
	@until docker exec pinewood-derby-db pg_isready -U testuser; do sleep 1; done
	npx dotenv -e .env.dev -- npx prisma migrate dev

.PHONY: run
run: node_modules db db-migrate-dev ## Run the app locally
	npx dotenv -e .env.dev -- npm run dev

.PHONY: race-interface
race-interface: ## Connect to the arduino via Node.js script. Edit consts in scripts\race-interface.js to control where times are saved. I ran this from PowerShell (not Linux / Mac env)
	node ./scripts/race-interface.js

.PHONY: exhaust-db-connections
exhaust-db-connections: ## Run script to test exhaustion of DB connections
	npx dotenv -e .env.dev -- npx tsx ./scripts/exhaust-db-connections.js

node_modules: package-lock.json ## Install node modules
	npm ci

.PHONY: lint
lint: ## Check ESLint for any errors
	npm run lint

.PHONY: build
build: ## Run production build
	npm run build

##@ Testing

.PHONY: test
test: node_modules db db-migrate-test ## Run tests
	npx dotenv -e .env.test -- npm test

.PRECIOUS: %.test.ts
%.test.ts: ## Run an individual test with 'make <path to .test.ts>'
$(ALL_TESTS): node_modules db db-migrate-test
	@echo "Testing $@..."
	npx dotenv -e .env.test -- npm test -- $@

.PHONY: db-migrate-test
db-migrate-test: db ## Apply existing migrations to the database
	@echo "Waiting for the database to be ready..."
	@until docker exec pinewood-derby-db pg_isready -U testuser; do sleep 1; done
	npx dotenv -e .env.test -- npx prisma migrate dev

##@ Local Database

.PHONY: db
db: ## Start local database
	docker compose up -d

.PHONY: db-down
db-down: ## Stop the database
	docker compose down

.PHONY: db-down-clean
db-down-clean: ## Stop the database and remove all volumes
	docker compose down -v