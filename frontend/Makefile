.DEFAULT_GOAL := help

.PHONY: init
init: ## Install packages
	rm -rf app/node_modules
	. bin/exec.sh "yarn install"

.PHONY: up
up: ## Up app in docker compose
	docker-compose up --build

.PHONY: deploy
deploy: ## Deploy to Firebase Hosting 
	. bin/exec.sh "yarn deploy"

.PHONY: export_index
export_index: ## Export Firestore Index to Local
	. bin/exec.sh "firebase firestore:indexes > firestore.indexes.json"

.PHONY: help
help: ## Display this help screen
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
