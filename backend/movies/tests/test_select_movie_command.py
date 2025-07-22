import datetime
from unittest.mock import patch
from django.test import TestCase
from django.utils import timezone
from django.core.management import call_command
from io import StringIO
from ..models import Movie, MovieNight, User


class SelectMovieCommandTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password')
        
        # Create some unwatched movies
        self.movie1 = Movie.objects.create(
            title='Unwatched Movie 1', 
            link='link1', 
            user='testuser', 
            date_added=timezone.now(), 
            genre='genre1'
        )
        self.movie2 = Movie.objects.create(
            title='Unwatched Movie 2', 
            link='link2', 
            user='testuser', 
            date_added=timezone.now(), 
            genre='genre2'
        )
        
        # Create a watched movie
        self.watched_movie = Movie.objects.create(
            title='Watched Movie', 
            link='link3', 
            user='testuser', 
            date_added=timezone.now(), 
            genre='genre3'
        )
        
        # Create a past night with watched movie
        past_night = MovieNight.objects.create(
            host='testuser',
            night_date=timezone.now() - datetime.timedelta(days=7),
            location='past location',
            selected_movie=self.watched_movie,
            movie_selected_at=timezone.now() - datetime.timedelta(days=7)
        )

    def test_normal_movie_selection(self):
        """Test normal movie selection when night is due"""
        now = timezone.now()
        # Create a night that is due for selection (within 10 seconds)
        upcoming_night = MovieNight.objects.create(
            host='testuser',
            night_date=now + datetime.timedelta(seconds=5),
            location='upcoming'
        )

        with patch('django.utils.timezone.now', return_value=now):
            call_command('select_movie_for_nights')

        upcoming_night.refresh_from_db()
        self.assertIsNotNone(upcoming_night.selected_movie)
        self.assertIsNotNone(upcoming_night.movie_selected_at)
        self.assertIn(upcoming_night.selected_movie, [self.movie1, self.movie2])

    def test_no_upcoming_nights(self):
        """Test when there are no upcoming nights needing selection"""
        out = StringIO()
        call_command('select_movie_for_nights', stdout=out)
        
        self.assertIn('No movie nights need selection at this time', out.getvalue())

    def test_too_early_for_selection(self):
        """Test that movies are not selected too early"""
        now = timezone.now()
        # Create a night that is more than 10 seconds in the future
        future_night = MovieNight.objects.create(
            host='testuser',
            night_date=now + datetime.timedelta(minutes=30),
            location='future'
        )

        with patch('django.utils.timezone.now', return_value=now):
            call_command('select_movie_for_nights')

        future_night.refresh_from_db()
        self.assertIsNone(future_night.selected_movie)
        self.assertIsNone(future_night.movie_selected_at)

    def test_no_unwatched_movies_available(self):
        """Test when no unwatched movies are available"""
        # Mark all movies as watched by creating movie nights for them
        MovieNight.objects.create(
            host='testuser',
            night_date=timezone.now() - datetime.timedelta(days=1),
            location='another past location',
            selected_movie=self.movie1,
            movie_selected_at=timezone.now() - datetime.timedelta(days=1)
        )
        MovieNight.objects.create(
            host='testuser',
            night_date=timezone.now() - datetime.timedelta(days=2),
            location='yet another past location',
            selected_movie=self.movie2,
            movie_selected_at=timezone.now() - datetime.timedelta(days=2)
        )

        now = timezone.now()
        upcoming_night = MovieNight.objects.create(
            host='testuser',
            night_date=now + datetime.timedelta(seconds=5),
            location='upcoming_no_movies'
        )

        out = StringIO()
        with patch('django.utils.timezone.now', return_value=now):
            call_command('select_movie_for_nights', stdout=out)

        upcoming_night.refresh_from_db()
        self.assertIsNone(upcoming_night.selected_movie)
        self.assertIn('No unwatched movies available for selection', out.getvalue())

    def test_idempotency_already_selected(self):
        """Test that command doesn't process nights that already have selected movies"""
        now = timezone.now()
        
        # Create a night with already selected movie
        night_with_movie = MovieNight.objects.create(
            host='testuser',
            night_date=now - datetime.timedelta(seconds=5),
            location='already selected',
            selected_movie=self.movie1,
            movie_selected_at=now - datetime.timedelta(minutes=1)
        )
        
        # Create a night without selected movie that needs selection
        night_without_movie = MovieNight.objects.create(
            host='testuser',
            night_date=now - datetime.timedelta(seconds=3),
            location='needs selection'
        )

        out = StringIO()
        with patch('django.utils.timezone.now', return_value=now):
            call_command('select_movie_for_nights', stdout=out)

        night_with_movie.refresh_from_db()
        night_without_movie.refresh_from_db()
        
        # Should still have the same movie
        self.assertEqual(night_with_movie.selected_movie, self.movie1)
        # The other night should now have a movie selected
        self.assertIsNotNone(night_without_movie.selected_movie)
        # Should have processed only the night without a movie
        self.assertIn('Successfully selected movies for 1 night(s)', out.getvalue())

    def test_multiple_nights_selection(self):
        """Test selecting movies for multiple nights at once"""
        now = timezone.now()
        
        # Create multiple nights that need selection
        night1 = MovieNight.objects.create(
            host='testuser',
            night_date=now + datetime.timedelta(seconds=5),
            location='night1'
        )
        night2 = MovieNight.objects.create(
            host='testuser',
            night_date=now + datetime.timedelta(seconds=8),
            location='night2'
        )

        with patch('django.utils.timezone.now', return_value=now):
            call_command('select_movie_for_nights')

        night1.refresh_from_db()
        night2.refresh_from_db()
        
        self.assertIsNotNone(night1.selected_movie)
        self.assertIsNotNone(night1.movie_selected_at)
        self.assertIsNotNone(night2.selected_movie)
        self.assertIsNotNone(night2.movie_selected_at) 