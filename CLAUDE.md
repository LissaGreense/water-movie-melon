# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Full stack (Docker)
```bash
make up          # build & start all containers detached
make down        # stop all containers
make restart     # rebuild and restart everything
make logs        # tail all container logs
```

### Backend (local)
```bash
cd backend
source venv/bin/activate
python manage.py migrate
python manage.py runserver        # http://localhost:8000
python manage.py test             # run all tests (uses in-memory SQLite)
python manage.py test movies.tests.test_night  # run a single test module
```

### Frontend (local)
```bash
cd frontend
npm install
npm run dev                       # http://localhost:5173
npm run build                     # tsc + vite build
npm run eslint:fix                # auto-fix lint
npm run prettier:format           # auto-format src/
```

### Cron service
```bash
make cron-logs                    # tail cron container logs
make run-cron-once                # manually trigger movie selection
docker compose exec cron bash     # shell into cron container
```

## Architecture

**Three-container stack** (`compose.yaml`): `frontend` (Vite/React preview), `backend` (Django + gunicorn), `cron` (same Django image, different Dockerfile, runs `select_movie_for_nights` management command every minute). All share `wmm-network`. `db` is PostgreSQL.

### Backend (`backend/`)
- **Single Django app**: `movies/` — all models, views, serializers, URLs, and tests live here.
- **Auth**: Session-based via `django.contrib.auth` + `SessionAuthentication`. Knox is installed but sessions are the active auth class. CSRF is enforced; views use `ensure_csrf_cookie`. Session TTL is 15 min (`SESSION_COOKIE_AGE = 900`).
- **Custom `User` model** (`movies.User` extends `AbstractUser`) — set as `AUTH_USER_MODEL`. Adds `avatar` (ImageField) and `tickets` (PositiveIntegerField).
- **All API routes** are under `/movies/` (see `movies/urls.py`). Key endpoints: `movies/`, `rate/`, `newNight/`, `attendees/`, `selectedMovie/`, `upcomingNights/`, `userStatistics/<username>/`, `average_ratings/`.
- **Timezone logic** (`watermoviemelon/utils/timezone.py`): all datetimes stored as UTC; business day boundaries computed in `BUSINESS_TIMEZONE` (default `Europe/Warsaw`). `MovieNight.business_date` is a property using this utility.
- **Tests use in-memory SQLite** — `settings.py` swaps the DB when `test` is in `sys.argv`. No mocking of the DB layer.

### Frontend (`frontend/src/`)
- **Pages**: `homePage`, `loginPage`, `registerPage`, `accountPage`, `calendarPage`, `moviePage` — routes defined in `App.tsx`.
- **Auth guard**: `RequireAuth` in `App.tsx` checks `localStorage` for `username`. Username is stored there on login; CSRF token is read from the `csrftoken` cookie via `universal-cookie`.
- **API layer** (`connections/internal/`): thin axios wrappers per domain (`movie.ts`, `movieNight.ts`, `movieRate.ts`, `authentication.ts`, `user.ts`). Backend URL defaults to `DEFAULT_BACKEND_URL` in `constants/defaults.ts`, overridable via `VITE_APP_BACKEND_URL`.
- **External API** (`connections/external/omdb.ts`): OMDb is called client-side using `VITE_OMDB_API_KEY` for movie metadata/covers.
- **UI framework**: PrimeReact (`vela-green` theme) + PrimeFlex for layout. Physics animations use `matter-js` (`bucketWithCovers` component).
- **Types** mirror the `connections/` split: `types/internal/` and `types/external/`.

### Cron service (`backend/cron/`)
- Separate Dockerfile that builds from the `backend/` context.
- Runs `python manage.py select_movie_for_nights` every minute.
- Logs to `/tmp/movie_selection.log` inside the container (mounted as `cron_logs` volume).
- The management command (`movies/management/commands/select_movie_for_nights.py`) auto-selects a movie for any `MovieNight` within 1 minute of its start time that has no `selected_movie` yet.

## Environment variables

**`backend/.env`**: `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST`, `RATE_LIMIT_ENABLED`, `BUSINESS_TIMEZONE`

**`frontend/.env`**: `VITE_OMDB_API_KEY`, `VITE_APP_BACKEND_URL`
