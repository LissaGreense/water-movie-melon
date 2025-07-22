#!/bin/bash

# Movie Selection Cron Job Setup Script
# This script sets up a cron job to run movie selection every minute

echo "Setting up movie selection cron job..."

# Get the current directory (project root)
PROJECT_ROOT=$(pwd)

# Create the cron job command
# Note: We need to wait for the database to be ready
CRON_COMMAND="* * * * * cd $PROJECT_ROOT && /usr/local/bin/python3 manage.py select_movie_for_nights >> /tmp/movie_selection.log 2>&1"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "select_movie_for_nights"; then
    echo "Cron job already exists. Removing old one..."
    # Remove existing job
    crontab -l 2>/dev/null | grep -v "select_movie_for_nights" | crontab -
fi

# Add the new cron job
echo "Adding new cron job..."
(crontab -l 2>/dev/null; echo "$CRON_COMMAND") | crontab -

echo "✅ Cron job installed successfully!"
echo "📋 Current crontab:"
crontab -l | grep "select_movie_for_nights"

echo ""
echo "📝 Log file location: /tmp/movie_selection.log"
echo "🔍 To view logs: tail -f /tmp/movie_selection.log"
echo "🗑️  To remove cron job: crontab -e (then delete the line with select_movie_for_nights)"

echo ""
echo "⚠️  Waiting for database to be ready..."
# Wait for database to be ready
while ! /usr/local/bin/python3 manage.py check --database default 2>/dev/null; do
    echo "Database not ready yet, waiting..."
    sleep 5
done

echo "✅ Database is ready! Cron jobs will start executing." 