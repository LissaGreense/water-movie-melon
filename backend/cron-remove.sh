#!/bin/bash

# Movie Selection Cron Job Removal Script

echo "Removing movie selection cron job..."

# Check if cron job exists
if crontab -l 2>/dev/null | grep -q "select_movie_for_nights"; then
    echo "Found existing cron job. Removing..."
    # Remove the cron job
    crontab -l 2>/dev/null | grep -v "select_movie_for_nights" | crontab -
    echo "✅ Cron job removed successfully!"
else
    echo "❌ No movie selection cron job found."
fi

echo ""
echo "📋 Current crontab (should not contain select_movie_for_nights):"
crontab -l 2>/dev/null | head -10 