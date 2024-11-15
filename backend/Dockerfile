# syntax=docker/dockerfile:1

FROM python:3.12-bookworm

RUN useradd --create-home --shell /bin/bash wsgi

RUN mkdir -p /home/wsgi/app && chown -R wsgi:wsgi /home/wsgi/app
RUN mkdir -p /home/wsgi/app/database && chown -R wsgi:wsgi /home/wsgi/app/database

WORKDIR /home/wsgi/app

COPY requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

USER wsgi

COPY --chown=wsgi:wsgi . .

CMD ["gunicorn", "-b", "0.0.0.0:8000", "watermoviemelon.wsgi"]