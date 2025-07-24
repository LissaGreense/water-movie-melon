# syntax=docker/dockerfile:1

FROM python:3.12-bookworm

# Install cron
RUN apt-get update && apt-get install -y cron && rm -rf /var/lib/apt/lists/*

RUN useradd --create-home --shell /bin/bash cronuser

RUN mkdir -p /home/cronuser/app && chown -R cronuser:cronuser /home/cronuser/app

WORKDIR /home/cronuser/app

COPY requirements.txt ./

# Install packages globally so they're available to cronuser
RUN pip install --no-cache-dir -r requirements.txt

# Copy only essential Django files
COPY manage.py ./
COPY watermoviemelon/ ./watermoviemelon/
COPY movies/models.py ./movies/
COPY movies/management/ ./movies/management/
COPY movies/__init__.py ./movies/
COPY movies/apps.py ./movies/

# Copy cron setup script
COPY --chown=root:root cron/cron-setup.sh /cron-setup.sh
RUN chmod +x /cron-setup.sh

USER cronuser

# Switch back to root for running cron service
USER root

# Start cron and run the setup script
CMD bash -c "service cron start && /cron-setup.sh && tail -f /tmp/movie_selection.log" 