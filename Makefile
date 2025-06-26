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