# Makefile for common development tasks
# Usage: make <command>

.PHONY: help db-up db-down db-reset db-logs migrate migrate-down test lint dev-backend dev-frontend dev

help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

# Database Commands
db-up: ## Start local PostgreSQL database
	docker-compose up -d postgres
	@echo "⏳ Waiting for database to be ready..."
	@sleep 3
	@echo "✅ Database is ready!"
	@echo "   Host: localhost:5432"
	@echo "   User: tarot"
	@echo "   Password: tarot123"
	@echo "   Database: tarot_dev"

db-up-gui: ## Start database with PGAdmin GUI
	docker-compose --profile gui up -d
	@echo "✅ Database + PGAdmin started!"
	@echo "   PGAdmin: http://localhost:5050"
	@echo "   Email: admin@tarot.local"
	@echo "   Password: admin123"

db-down: ## Stop local database
	docker-compose down

db-reset: ## Stop and remove all database data (WARNING: deletes everything!)
	@echo "⚠️  WARNING: This will delete all local database data!"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose down -v; \
		docker volume rm tarot_postgres_data 2>/dev/null || true; \
		echo "✅ Database reset complete"; \
	else \
		echo "❌ Cancelled"; \
	fi

db-logs: ## View database logs
	docker-compose logs -f postgres

db-shell: ## Open PostgreSQL shell
	docker exec -it tarot-db-local psql -U tarot -d tarot_dev

db-seed: ## Seed database with initial data
	cd backend && python scripts/seed_data.py

# Migration Commands
migrate: ## Run database migrations
	cd backend && alembic upgrade head

migrate-down: ## Rollback last migration
	cd backend && alembic downgrade -1

migrate-create: ## Create new migration (interactive)
	@read -p "Migration name: " name; \
	cd backend && alembic revision --autogenerate -m "$$name"

migrate-history: ## View migration history
	cd backend && alembic history --verbose

# Development Commands
dev-backend: ## Start backend development server
	cd backend && uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

dev-frontend: ## Start frontend development server
	cd frontend && npm run dev

dev: ## Start both backend and frontend (requires tmux or separate terminals)
	@echo "Starting backend and frontend..."
	@make db-up
	@make migrate
	@tmux new-session -d -s tarot-dev 'make dev-backend' \; \
		split-window -h 'make dev-frontend' \; \
		attach

test-backend: ## Run backend tests
	cd backend && PYTHONPATH=. pytest tests/ -v

test-frontend: ## Run frontend tests
	cd frontend && npm test

test: ## Run all tests
	make test-backend
	make test-frontend

lint-backend: ## Lint backend code
	cd backend && ruff check src/

lint-frontend: ## Lint frontend code
	cd frontend && npm run lint

lint: ## Run all linters
	make lint-backend
	make lint-frontend

# Setup Commands
setup: ## Initial project setup
	@echo "🚀 Setting up project..."
	@echo "1. Installing backend dependencies..."
	cd backend && pip install -r requirements.txt
	@echo "2. Installing frontend dependencies..."
	cd frontend && npm install
	@echo "3. Starting database..."
	make db-up
	@echo "4. Running migrations..."
	make migrate
	@echo "5. Seeding database..."
	make db-seed
	@echo "✅ Setup complete! Run 'make dev-backend' and 'make dev-frontend' to start developing."
