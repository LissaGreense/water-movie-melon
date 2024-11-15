# water-movie-melon
Tool to pick the best title for movie night with your friends

### Docker

#### Docker-compose

To run the application using docker compose simply navigate to the water-movie-melon project directory in terminal.
Then type:

```bash
docker compose up
```

App will start, you can connect locally to the frontend at http://localhost:4173, and to the backend at http://localhost:8000.

#### Docker backend

To run backend of the app using docker first navigate to the water-movie-melon\backend directory in terminal.
Then build the image using:

```bash
docker build . -t {backend_image_name}
```
And next run the docker:

```bash
docker run -p 8000:8000 {backend_image_name}
```

#### Docker frontend

To run frontend of the app using docker first navigate to the water-movie-melon\frontend directory in terminal.
Then build the image using:

```bash
docker build . -t {frontend_image_name}
```
And next run the docker:

```bash
docker run -p 4173:4173 {frontend_image_name}
```

## Authors
- [LissaGreense](https://github.com/LissaGreense)
- [adlbrtbsr](https://github.com/adlbrtbsr)
- [kajedot](https://github.com/kajedot)

## How to run
1. pip install backend/requirements.txt
2. cd frontend && npm install
3. cd ..
4. python backend/manage.py migrate
5. python backend/manage.py runserver
6. cd frontend && npm run dev