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
- **Movie List Management**: Add movCheck out how many movie nights you’ve hosted, how , and flex a little among your
  friends.ies to a global list shared across all movie nights. Once a film is added, it remains
  in the pool, keeping the options fresh and interesting for future events until it’s finally selected!
- **Random Movie Selector**: Let watermoviemelon randomly pick a movie from the curated list, adding a touch of
  excitement
  to each night.
- **Rating System**: Rate the film after the event to capture everyone’s opinions and build a record of past movie
  nights.
- **Account Statistics**: Keep track of your movie-night stats! Check out how many movie nights you’ve hosted, how many
  you've watched and many more!

## Project structure

```
.
├── backend                # Backend service (e.g., API, database models)
│   ├── ...            
│   ├── Dockerfile         # Docker configuration for the backend
│   ├── movies             # Application directory for managing movie-related features
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

### Docker-compose

TODO

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

4. The app should now be running locally at http://localhost:3000. You can make changes to the source code, and the
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

TODO

### Backend (docker)

TODO

## Unit tests

### Backend

The backend uses Django’s built-in testing framework along with pytest (if configured) for more flexibility. Here’s how
to run the backend tests:

1. Navigate to the backend directory:

```bash
cd watermoviemelon/backend
```

2. Activate the virtual environment (if using a manual setup):

```bash
source venv/bin/activate # On Windows use: venv\Scripts\activate
```

3. Run all test cases by executing:

```bash
python manage.py test
```

## Authors

- [LissaGreense](https://github.com/LissaGreense)
- [adlbrtbsr](https://github.com/adlbrtbsr)
- [kajedot](https://github.com/kajedot)
