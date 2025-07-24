# syntax=docker/dockerfile:1

FROM python:3.12-bookworm

# Install cron
RUN apt-get update && apt-get install -y cron && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt ./

# Install packages
RUN pip install --no-cache-dir -r requirements.txt

# Copy only essential Django files
COPY manage.py ./
COPY watermoviemelon/ ./watermoviemelon/
COPY movies/models.py ./movies/
COPY movies/management/ ./movies/management/
COPY movies/__init__.py ./movies/
COPY movies/apps.py ./movies/

# Copy cron setup script
COPY cron/cron-setup.sh /cron-setup.sh
RUN chmod +x /cron-setup.sh

# Start cron and run the setup script
CMD bash -c "service cron start && /cron-setup.sh && tail -f /tmp/movie_selection.log" 