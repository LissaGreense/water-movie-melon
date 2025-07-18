# syntax=docker/dockerfile:1

FROM python:3.12-bookworm

# Install cron
RUN apt-get update && apt-get install -y cron && rm -rf /var/lib/apt/lists/*

RUN useradd --create-home --shell /bin/bash wsgi

RUN mkdir -p /home/wsgi/app && chown -R wsgi:wsgi /home/wsgi/app
RUN mkdir -p /home/wsgi/app/database && chown -R wsgi:wsgi /home/wsgi/app/database

WORKDIR /home/wsgi/app

COPY requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

USER wsgi

COPY --chown=wsgi:wsgi . .

# Copy cron setup script and make it executable
USER root
COPY --chown=root:root cron-setup.sh /cron-setup.sh
RUN chmod +x /cron-setup.sh

USER wsgi

# Start cron and run the setup script, then start gunicorn
CMD bash -c "sudo service cron start && /cron-setup.sh && exec gunicorn -b 0.0.0.0:8000 watermoviemelon.wsgi"