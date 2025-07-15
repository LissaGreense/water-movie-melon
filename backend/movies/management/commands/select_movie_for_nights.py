from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction
from movies.models import MovieNight, Movie
from random import choice
import datetime
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Select movies for movie nights that are due'
    
    def handle(self, *args, **options):
        """
        Select movies for nights that are within 10 seconds of their start time
        Ensures idempotency (don't change already selected movies)
        """
        now = timezone.now()
        
        # Find nights that need movie selection (within 10 seconds of start time)
        # Only select for nights that don't already have a selected movie
        upcoming_nights = MovieNight.objects.filter(
            selected_movie__isnull=True,
            night_date__lte=now + datetime.timedelta(seconds=10)
        ).order_by('night_date')
        
        if not upcoming_nights.exists():
            self.stdout.write(self.style.SUCCESS('No movie nights need selection at this time'))
            return
        
        # Build a mutable pool of unwatched movies so we don't assign the same movie to multiple nights in one run
        movies_pool = list(
            Movie.objects.filter(watched_movie__isnull=True)
        )
        
        if not movies_pool:
            self.stdout.write(self.style.WARNING('No unwatched movies available for selection'))
            logger.warning('No unwatched movies available for selection')
            return
        
        selections_made = 0
        
        for night in upcoming_nights:
            try:
                with transaction.atomic():
                    # Double check that this night still needs selection (avoid race conditions)
                    night.refresh_from_db()
                    if night.selected_movie is not None:
                        self.stdout.write(f'Night {night.id} already has a selected movie, skipping')
                        continue
                    
                    # Ensure we still have movies left in the pool
                    if not movies_pool:
                        self.stdout.write(self.style.WARNING(
                            'Ran out of unwatched movies while processing nights'
                        ))
                        break

                    # Select a random unwatched movie and remove it from the pool
                    selected_movie = choice(movies_pool)
                    movies_pool.remove(selected_movie)
                    night.selected_movie = selected_movie
                    night.movie_selected_at = now
                    night.save()
                    
                    selections_made += 1
                    
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'Selected movie "{selected_movie.title}" for night {night.id} '
                            f'(host: {night.host}, date: {night.night_date})'
                        )
                    )
                    logger.info(
                        f'Selected movie "{selected_movie.title}" for night {night.id} '
                        f'(host: {night.host}, date: {night.night_date})'
                    )
                    
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Error selecting movie for night {night.id}: {str(e)}')
                )
                logger.error(f'Error selecting movie for night {night.id}: {str(e)}')
        
        if selections_made > 0:
            self.stdout.write(
                self.style.SUCCESS(f'Successfully selected movies for {selections_made} night(s)')
            )
        else:
            self.stdout.write(self.style.SUCCESS('No new movie selections were needed')) 