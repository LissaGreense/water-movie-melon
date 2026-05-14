<p align="center">
<img alt="watermoviemelon" style="border-radius: 20%" height="300" src="https://i.ibb.co/xz57Dns/Untitled-design.png" width="300"/>
</p>

# What is this all about?

**watermoviemelon** is a fun, interactive web application designed to bring friends, family, and movie lovers together
to organize unforgettable movie nights! It makes planning and hosting movie events a breeze. Users can create a movie
night, add movie options, and let the app randomly select a film for the evening—keeping the suspense alive until
showtime! Once the night ends, everyone can rate the film!

### Key Features:

- **Event Creation**: Easily set up movie nights or join to the existing one.
- **Movie List Management**: Add movies to a global list shared across all movie nights. Once a film is added, it
  remains in the pool, keeping the options fresh and interesting for future events until it's finally selected!
- **Random Movie Selector**: Let watermoviemelon randomly pick a movie from the curated list, adding a touch of
  excitement
  to each night.
- **Rating System**: Rate the film after the event to capture everyone's opinions and build a record of past movie
  nights.
- **Account Statistics**: Keep track of your movie-night stats! Check out how many movie nights you've hosted, how many
  you've watched and many more!
- **Automated Movie Selection**: The system automatically selects movies for upcoming movie nights using a built-in cron job that runs every minute.

## Project structure

```
.
├── backend                # Backend service (e.g., API, database models)
│   ├── ...            
│   ├── Dockerfile         # Docker configuration for the backend
│   ├── movies             # Application directory for managing movie-related features
│   │   └── tests/         # Django test cases (one file per view/feature)
│   ├── requirements.txt   # Python dependencies
│   └── watermoviemelon    # Project configuration and main app settings for backend
│
├── compose.yaml           # Docker Compose configuration for orchestrating services
│
├── frontend               # Frontend service (React application)
│   ├── ...               
│   ├── Dockerfile         # Docker configuration for the frontend   
│   ├── public             # Public assets, like icons and images
│   └── src                # Source code, organized by components, pages, utilities, etc.
│       ├── components     # Reusable React components
│       ├── connections    # API layer (internal backend + external OMDb)
│       ├── pages          # Page-level components (one per route)
│       ├── types          # TypeScript interfaces
│       ├── utils          # Utility functions
│       └── test           # All frontend tests, mirroring the src/ structure
│           ├── components/
│           ├── connections/internal/
│           └── utils/
├── ...                
└── README.md              # Project documentation


```

## How to run

### Prerequisites

Before running the app, ensure that you have the following installed:

- **Docker**: Required for running the application using Docker
  containers. [Get Docker](https://docs.docker.com/engine/install/)
- **Docker Compose**: Used to manage multi-container
  applications. [Get Docker Compose](https://docs.docker.com/compose/install/)
- **Node.js**: For the frontend to work locally. [Get Node.js](https://nodejs.org/en/download/package-manager)
- **Python 3.x**: Required for the backend. [Get Python](https://www.python.org/downloads/)

### Environment variables

To make sure your application can access required APIs and other configurations, set up environment variables by
creating a `.env` file in each relevant directory.

#### Frontend

1. Create a .env file in the root directory

```bash
cd frontend
touch .env
```

2. Add required environment variables:

```bash
# OMDb API Key for fetching movie details
VITE_OMDB_API_KEY="OMDB_KEY_HERE"
```

#### Backend

1. Create a .env file in the `backend` directory:

```bash
cd backend
touch .env
```

2. Add required environment variables:

```bash
# PostgreSQL database configuration
POSTGRES_DB=your_db_name
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_db_password
POSTGRES_HOST=db

# For register view rate limiting
RATE_LIMIT_ENABLED=True

# Business timezone for consistent day-boundary logic (optional)
# Used for movie night scheduling and conflict detection
# Default: Europe/Warsaw
BUSINESS_TIMEZONE=Europe/Warsaw
```

### Docker-compose

To run the application using docker compose simply navigate to the water-movie-melon project directory in terminal.
Then type:

```bash
docker compose up
```

App will start, you can connect locally to the frontend at http://localhost:4173, and to the backend at http://localhost:8000.

#### Automated Movie Selection

The application includes an automated movie selection system that runs in a separate cron container. This feature:

- **Automatically selects movies** for upcoming movie nights that are within 1 minute of their start time
- **Runs every minute** to ensure timely movie selection
- **Prevents duplicate selections** by checking if a movie has already been selected for a night
- **Logs all activities** to `/tmp/movie_selection.log` within the cron container

The cron service is automatically started when you run `docker compose up -d`. You can view the selection logs by accessing the cron container:

```bash
docker compose logs -f cron
```

##### Cron Service Management

The cron service runs in its own container for better separation of concerns:

- **View cron logs**: `docker compose logs -f cron`
- **Restart cron service**: `docker compose restart cron`
- **Access cron container**: `docker compose exec cron bash`
- **Run cron job manually** (for testing): `docker compose exec cron python manage.py select_movie_for_nights`

This architecture provides better resource management and easier debugging by isolating scheduled tasks from the web server.


### Local Development

#### Frontend

1. navigate to the frontend folder:

```bash
cd watermoviemelon/frontend
```

2. Install dependencies using npm or yarn:

If you're using npm

```bash
npm install
```

Or if you prefer yarn:

```bash
yarn install
```

3. Start the development server:

If you're using npm:

```bash
npm run dev
```

Or with yarn:

```bash
yarn dev
```

4. The app should now be running locally at http://localhost:5173. You can make changes to the source code, and the
   development server will automatically reload the page.
5. To stop the server, use Ctrl+C in your terminal.

#### Backend

1. navigate to the backend folder:

```bash
cd watermoviemelon/backend
```

2. Create and activate a virtual environment (recommended for managing Python dependencies)::

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
```

3. Install backend dependencies:

```bash
pip install -r requirements.txt
```

4. Run database migrations (if applicable):

```bash
python manage.py migrate
```

5. Start the backend server

```bash
python manage.py runserver
```

6. The backend will now be running locally on http://localhost:8000. You can make changes to the backend code, and the
   server will automatically reload when saved.

7. To stop the server, use Ctrl+C in your terminal.

### Frontend (docker)

To run frontend of the app using docker first navigate to the water-movie-melon/frontend directory in terminal.
Then build the image using:

```bash
docker build . -t {frontend_image_name}
```
And next run the docker:

```bash
docker run -p 4173:4173 {frontend_image_name}
```

### Backend (docker)

To run backend of the app using docker first navigate to the water-movie-melon/backend directory in terminal.
Then build the image using:

```bash
docker build . -t {backend_image_name}
```
And next run the docker:

```bash
docker run -p 8000:8000 {backend_image_name}
```

### Database (docker)
To start database using docker run this command in terminal:

```bash
docker run -d --name postgres -e POSTGRES_PASSWORD=mypassword  -p 5432:5432 postgres
```

## Unit tests

### Backend

Tests live in `backend/movies/tests/`, one file per view or feature. The test runner automatically uses an in-memory SQLite database, so no running Postgres instance is needed.

```bash
cd backend
source venv/bin/activate
python manage.py test                        # run all tests
python manage.py test movies.tests.test_night  # run a single module
```

### Frontend

Tests live in `frontend/src/test/`, mirroring the source structure. Powered by [Vitest](https://vitest.dev/) and React Testing Library.

```bash
cd frontend
npm test            # run all tests once
npm run test:watch  # run in watch mode during development
```

## Authors

- [LissaGreense](https://github.com/LissaGreense)
- [adlbrtbsr](https://github.com/adlbrtbsr)
- [kajedot](https://github.com/kajedot)
