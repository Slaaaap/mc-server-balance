# Makefile for SCPI Simulator Alderan
# This Makefile provides convenient commands for development, testing, and deployment

.PHONY: help dev prod build test clean setup install lint format check-deps security docs deploy backup

# Default target
.DEFAULT_GOAL := help

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

# Project variables
PROJECT_NAME := alderan-scpi-simulator
DOCKER_COMPOSE := docker compose
DOCKER_COMPOSE_DEV := docker compose -f docker-compose.dev.yml
BACKEND_DIR := backend
FRONTEND_DIR := frontend

## Help
help: ## Show this help message
	@echo "$(BLUE)SCPI Simulator Alderan - Makefile Commands$(NC)"
	@echo ""
	@echo "$(GREEN)Available commands:$(NC)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

## Development
setup: ## Setup development environment
	@echo "$(BLUE)Setting up development environment...$(NC)"
	@cp $(BACKEND_DIR)/env.example $(BACKEND_DIR)/.env || echo "Backend .env already exists"
	@cp $(FRONTEND_DIR)/env.example $(FRONTEND_DIR)/.env || echo "Frontend .env already exists"
	@echo "$(GREEN)✓ Environment files created$(NC)"
	@echo "$(YELLOW)Please edit .env files with your configuration$(NC)"

install: ## Install dependencies for development
	@echo "$(BLUE)Installing dependencies...$(NC)"
	@echo "$(YELLOW)Installing Python dependencies...$(NC)"
	@cd $(BACKEND_DIR) && pip install -r requirements.txt
	@echo "$(YELLOW)Installing Node.js dependencies...$(NC)"
	@cd $(FRONTEND_DIR) && npm install
	@echo "$(GREEN)✓ Dependencies installed$(NC)"

dev: ## Start development environment with hot reload
	@echo "$(BLUE)Starting development environment...$(NC)"
	$(DOCKER_COMPOSE_DEV) up --build -d
	@echo "$(GREEN)✓ Development environment started$(NC)"
	@echo "$(YELLOW)Services available at:$(NC)"
	@echo "  - Frontend: http://localhost:5173"
	@echo "  - Backend: http://localhost:8000"
	@echo "  - Backend Docs: http://localhost:8000/docs"
	@echo "  - Database Admin: http://localhost:8080"
	@echo "  - Redis Admin: http://localhost:8081"
	@echo "  - MailHog: http://localhost:8025"

dev-logs: ## Follow development logs
	$(DOCKER_COMPOSE_DEV) logs -f

dev-stop: ## Stop development environment
	@echo "$(BLUE)Stopping development environment...$(NC)"
	$(DOCKER_COMPOSE_DEV) down
	@echo "$(GREEN)✓ Development environment stopped$(NC)"

dev-restart: ## Restart development environment
	@echo "$(BLUE)Restarting development environment...$(NC)"
	$(DOCKER_COMPOSE_DEV) restart
	@echo "$(GREEN)✓ Development environment restarted$(NC)"

dev-clean: ## Clean development environment and volumes
	@echo "$(BLUE)Cleaning development environment...$(NC)"
	$(DOCKER_COMPOSE_DEV) down -v --remove-orphans
	docker system prune -f
	@echo "$(GREEN)✓ Development environment cleaned$(NC)"

## Production
build: ## Build production images
	@echo "$(BLUE)Building production images...$(NC)"
	$(DOCKER_COMPOSE) build --no-cache
	@echo "$(GREEN)✓ Production images built$(NC)"

prod: ## Start production environment
	@echo "$(BLUE)Starting production environment...$(NC)"
	$(DOCKER_COMPOSE) up -d
	@echo "$(GREEN)✓ Production environment started$(NC)"
	@echo "$(YELLOW)Services available at:$(NC)"
	@echo "  - Application: http://localhost:3000"
	@echo "  - API: http://localhost:8000"

prod-logs: ## Follow production logs
	$(DOCKER_COMPOSE) logs -f

prod-stop: ## Stop production environment
	@echo "$(BLUE)Stopping production environment...$(NC)"
	$(DOCKER_COMPOSE) down
	@echo "$(GREEN)✓ Production environment stopped$(NC)"

prod-restart: ## Restart production environment
	@echo "$(BLUE)Restarting production environment...$(NC)"
	$(DOCKER_COMPOSE) restart
	@echo "$(GREEN)✓ Production environment restarted$(NC)"

## Testing
test: ## Run all tests
	@echo "$(BLUE)Running all tests...$(NC)"
	@make test-backend
	@make test-frontend
	@echo "$(GREEN)✓ All tests completed$(NC)"

test-backend: ## Run backend tests
	@echo "$(BLUE)Running backend tests...$(NC)"
	@cd $(BACKEND_DIR) && python -m pytest tests/ -v --cov=app --cov-report=term-missing
	@echo "$(GREEN)✓ Backend tests completed$(NC)"

test-frontend: ## Run frontend tests
	@echo "$(BLUE)Running frontend tests...$(NC)"
	@cd $(FRONTEND_DIR) && npm run test:coverage
	@echo "$(GREEN)✓ Frontend tests completed$(NC)"

test-e2e: ## Run end-to-end tests
	@echo "$(BLUE)Running E2E tests...$(NC)"
	@echo "$(YELLOW)E2E tests not implemented yet$(NC)"

test-docker: ## Run tests in Docker containers
	@echo "$(BLUE)Running tests in Docker...$(NC)"
	$(DOCKER_COMPOSE_DEV) up -d test-db
	$(DOCKER_COMPOSE_DEV) exec backend-dev python -m pytest tests/ -v
	$(DOCKER_COMPOSE_DEV) exec frontend-dev npm run test
	@echo "$(GREEN)✓ Docker tests completed$(NC)"

## Code Quality
lint: ## Run linting for all code
	@echo "$(BLUE)Running linting...$(NC)"
	@make lint-backend
	@make lint-frontend
	@echo "$(GREEN)✓ Linting completed$(NC)"

lint-backend: ## Run backend linting
	@echo "$(BLUE)Running backend linting...$(NC)"
	@cd $(BACKEND_DIR) && ruff check .
	@cd $(BACKEND_DIR) && mypy .
	@echo "$(GREEN)✓ Backend linting completed$(NC)"

lint-frontend: ## Run frontend linting
	@echo "$(BLUE)Running frontend linting...$(NC)"
	@cd $(FRONTEND_DIR) && npm run lint
	@cd $(FRONTEND_DIR) && npm run typecheck
	@echo "$(GREEN)✓ Frontend linting completed$(NC)"

format: ## Format all code
	@echo "$(BLUE)Formatting code...$(NC)"
	@make format-backend
	@make format-frontend
	@echo "$(GREEN)✓ Code formatting completed$(NC)"

format-backend: ## Format backend code
	@echo "$(BLUE)Formatting backend code...$(NC)"
	@cd $(BACKEND_DIR) && black .
	@cd $(BACKEND_DIR) && isort .
	@cd $(BACKEND_DIR) && ruff check --fix .
	@echo "$(GREEN)✓ Backend code formatted$(NC)"

format-frontend: ## Format frontend code
	@echo "$(BLUE)Formatting frontend code...$(NC)"
	@cd $(FRONTEND_DIR) && npm run format
	@cd $(FRONTEND_DIR) && npm run lint:fix
	@echo "$(GREEN)✓ Frontend code formatted$(NC)"

## Database
db-migrate: ## Run database migrations
	@echo "$(BLUE)Running database migrations...$(NC)"
	$(DOCKER_COMPOSE_DEV) exec backend-dev alembic upgrade head
	@echo "$(GREEN)✓ Database migrations completed$(NC)"

db-migration: ## Create new database migration
	@echo "$(BLUE)Creating new migration...$(NC)"
	@read -p "Migration name: " name; \
	$(DOCKER_COMPOSE_DEV) exec backend-dev alembic revision --autogenerate -m "$$name"
	@echo "$(GREEN)✓ Migration created$(NC)"

db-reset: ## Reset database
	@echo "$(BLUE)Resetting database...$(NC)"
	$(DOCKER_COMPOSE_DEV) exec db psql -U scpi_user -d scpi_simulator -c "DROP SCHEMA IF EXISTS scpi CASCADE; DROP SCHEMA IF EXISTS analytics CASCADE;"
	$(DOCKER_COMPOSE_DEV) restart db
	@echo "$(GREEN)✓ Database reset$(NC)"

db-seed: ## Seed database with test data
	@echo "$(BLUE)Seeding database...$(NC)"
	$(DOCKER_COMPOSE_DEV) exec backend-dev python -c "from app.db.init_db import init_db; init_db()"
	@echo "$(GREEN)✓ Database seeded$(NC)"

## Utilities
check-deps: ## Check for dependency updates
	@echo "$(BLUE)Checking dependencies...$(NC)"
	@cd $(BACKEND_DIR) && pip list --outdated
	@cd $(FRONTEND_DIR) && npm outdated
	@echo "$(GREEN)✓ Dependency check completed$(NC)"

security: ## Run security checks
	@echo "$(BLUE)Running security checks...$(NC)"
	@cd $(BACKEND_DIR) && bandit -r app/
	@cd $(FRONTEND_DIR) && npm audit
	@echo "$(GREEN)✓ Security checks completed$(NC)"

docs: ## Generate documentation
	@echo "$(BLUE)Generating documentation...$(NC)"
	@echo "$(YELLOW)API docs available at http://localhost:8000/docs$(NC)"
	@echo "$(YELLOW)ReDoc available at http://localhost:8000/redoc$(NC)"
	@echo "$(GREEN)✓ Documentation ready$(NC)"

backup: ## Backup database
	@echo "$(BLUE)Creating database backup...$(NC)"
	@mkdir -p backups
	$(DOCKER_COMPOSE) exec -T db pg_dump -U scpi_user -d scpi_simulator > backups/backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)✓ Database backup created$(NC)"

restore: ## Restore database from backup
	@echo "$(BLUE)Restoring database...$(NC)"
	@echo "$(YELLOW)Available backups:$(NC)"
	@ls -la backups/
	@read -p "Backup file name: " file; \
	$(DOCKER_COMPOSE) exec -T db psql -U scpi_user -d scpi_simulator < backups/$$file
	@echo "$(GREEN)✓ Database restored$(NC)"

## Monitoring
status: ## Show service status
	@echo "$(BLUE)Service Status:$(NC)"
	$(DOCKER_COMPOSE_DEV) ps

logs: ## Show logs for all services
	$(DOCKER_COMPOSE_DEV) logs

logs-backend: ## Show backend logs
	$(DOCKER_COMPOSE_DEV) logs -f backend-dev

logs-frontend: ## Show frontend logs
	$(DOCKER_COMPOSE_DEV) logs -f frontend-dev

logs-db: ## Show database logs
	$(DOCKER_COMPOSE_DEV) logs -f db

## Cleanup
clean: ## Clean up Docker resources
	@echo "$(BLUE)Cleaning up Docker resources...$(NC)"
	docker system prune -f
	docker volume prune -f
	@echo "$(GREEN)✓ Docker cleanup completed$(NC)"

clean-all: ## Clean up everything (WARNING: destroys all data)
	@echo "$(RED)WARNING: This will destroy all data!$(NC)"
	@read -p "Are you sure? (y/N): " confirm; \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
		$(DOCKER_COMPOSE) down -v --remove-orphans; \
		$(DOCKER_COMPOSE_DEV) down -v --remove-orphans; \
		docker system prune -af; \
		docker volume prune -f; \
		echo "$(GREEN)✓ Complete cleanup finished$(NC)"; \
	else \
		echo "$(YELLOW)Cleanup cancelled$(NC)"; \
	fi

## Quick commands
up: dev ## Alias for dev
down: dev-stop ## Alias for dev-stop
restart: dev-restart ## Alias for dev-restart
shell-backend: ## Shell into backend container
	$(DOCKER_COMPOSE_DEV) exec backend-dev bash

shell-frontend: ## Shell into frontend container
	$(DOCKER_COMPOSE_DEV) exec frontend-dev sh

shell-db: ## Shell into database container
	$(DOCKER_COMPOSE_DEV) exec db psql -U scpi_user -d scpi_simulator

## Performance
perf-test: ## Run performance tests
	@echo "$(BLUE)Running performance tests...$(NC)"
	@echo "$(YELLOW)Performance tests not implemented yet$(NC)"

load-test: ## Run load tests
	@echo "$(BLUE)Running load tests...$(NC)"
	@echo "$(YELLOW)Load tests not implemented yet$(NC)"
