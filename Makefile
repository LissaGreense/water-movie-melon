build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f 

restart:
	docker compose down
	docker compose build
	docker compose up -d

lint:
	cd frontend && npm run prettier:format
	cd frontend && npm run eslint:fix

test:
	cd backend && venv/bin/python manage.py test

# Cron Service Management
cron-logs:
	docker compose logs -f cron

cron-restart:
	docker compose restart cron

cron-shell:
	docker compose exec cron bash

# Manual cron job execution (for testing)
run-cron-once:
	docker compose exec cron python manage.py select_movie_for_nights