"""
Cron job functions for the movies app.
These functions are called by django-crontab.
"""

import logging
from django.utils import timezone
from django.db import transaction
from .models import MovieNight, Movie
from random import choice
import datetime

logger = logging.getLogger(__name__)


def select_movies_for_nights():
    """
    Select movies for movie nights that are due.
    This function is called by django-crontab every minute.
    """
    now = timezone.now()
    
    # Find nights that need movie selection (within 10 seconds of start time)
    # Only select for nights that don't already have a selected movie
    upcoming_nights = MovieNight.objects.filter(
        selected_movie__isnull=True,
        night_date__lte=now + datetime.timedelta(seconds=59)
    ).order_by('night_date')
    
    if not upcoming_nights.exists():
        logger.info('No movie nights need selection at this time')
        return
    
    # Build a mutable pool of unwatched movies so we don't assign the same movie to multiple nights in one run
    movies_pool = list(
        Movie.objects.filter(watched_movie__isnull=True)
    )
    
    if not movies_pool:
        logger.warning('No unwatched movies available for selection')
        return
    
    selections_made = 0
    
    for night in upcoming_nights:
        try:
            with transaction.atomic():
                # Double check that this night still needs selection (avoid race conditions)
                night.refresh_from_db()
                if night.selected_movie is not None:
                    logger.info(f'Night {night.id} already has a selected movie, skipping')
                    continue
                
                # Ensure we still have movies left in the pool
                if not movies_pool:
                    logger.warning('Ran out of unwatched movies while processing nights')
                    break

                # Select a random unwatched movie and remove it from the pool
                selected_movie = choice(movies_pool)
                movies_pool.remove(selected_movie)
                night.selected_movie = selected_movie
                night.movie_selected_at = now
                night.save()
                
                selections_made += 1
                
                logger.info(
                    f'Selected movie "{selected_movie.title}" for night {night.id} '
                    f'(host: {night.host}, date: {night.night_date})'
                )
                
        except Exception as e:
            logger.error(f'Error selecting movie for night {night.id}: {str(e)}')
    
    if selections_made > 0:
        logger.info(f'Successfully selected movies for {selections_made} night(s)')
    else:
        logger.info('No new movie selections were needed') 