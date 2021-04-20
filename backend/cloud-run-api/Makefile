.DEFAULT_GOAL := help

.PHONY: up
up: ## Up api in docker compose
	docker-compose up --remove-orphans --build

.PHONY: deploy
deploy: ## Deploy to Cloud Run 
	gcloud builds submit

.PHONY: set_demo_tasks
set_demo_tasks: ## Set the task data for the demo to Firestore
	. bin/exec.sh python app/functions/demo.py

.PHONY: set_user_role
set_user_role: ## Set the user's role to Firestore
	. bin/exec.sh python app/functions/user.py set_user_role $(email) $(role)

.PHONY: format
format: ## Formatting with black 
	black -l 100 -t py38 .

.PHONY: help
help: ## Display this help screen
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
