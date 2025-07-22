"""
Integration tests for cron functionality
"""
import datetime
from unittest.mock import patch
from django.test import TestCase
from django.utils import timezone
from django.core.management import call_command
from io import StringIO
from ..models import Movie, MovieNight, User


class CronIntegrationTest(TestCase):
    """Test cron job integration functionality"""

    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password')
        
        # Create some unwatched movies
        self.movie1 = Movie.objects.create(
            title='Test Movie 1', 
            link='link1', 
            user='testuser', 
            date_added=timezone.now(), 
            genre='genre1'
        )
        self.movie2 = Movie.objects.create(
            title='Test Movie 2', 
            link='link2', 
            user='testuser', 
            date_added=timezone.now(), 
            genre='genre2'
        )

    def test_cron_command_output_format(self):
        """Test that the cron command produces expected output format"""
        out = StringIO()
        call_command('select_movie_for_nights', stdout=out)
        output = out.getvalue()
        
        # Should contain one of the expected messages
        expected_messages = [
            'No movie nights need selection at this time',
            'No unwatched movies available for selection',
            'Successfully selected movies for'
        ]
        
        self.assertTrue(
            any(msg in output for msg in expected_messages),
            f"Expected one of {expected_messages} in output: {output}"
        )

    def test_cron_command_with_upcoming_night(self):
        """Test cron command when there's an upcoming night"""
        now = timezone.now()
        upcoming_night = MovieNight.objects.create(
            host='testuser',
            night_date=now + datetime.timedelta(seconds=5),
            location='test location'
        )

        with patch('django.utils.timezone.now', return_value=now):
            out = StringIO()
            call_command('select_movie_for_nights', stdout=out)
            output = out.getvalue()

        upcoming_night.refresh_from_db()
        
        # Should have selected a movie
        self.assertIsNotNone(upcoming_night.selected_movie)
        self.assertIsNotNone(upcoming_night.movie_selected_at)
        
        # Output should indicate success
        self.assertIn('Successfully selected movies for', output)

    def test_cron_command_idempotency(self):
        """Test that running the cron command multiple times doesn't change existing selections"""
        now = timezone.now()
        night = MovieNight.objects.create(
            host='testuser',
            night_date=now + datetime.timedelta(seconds=5),
            location='test location'
        )

        with patch('django.utils.timezone.now', return_value=now):
            # Run command first time
            call_command('select_movie_for_nights')
            night.refresh_from_db()
            first_movie = night.selected_movie
            first_selection_time = night.movie_selected_at
            
            # Run command second time
            call_command('select_movie_for_nights')
            night.refresh_from_db()
            second_movie = night.selected_movie
            second_selection_time = night.movie_selected_at
            
            # Should be the same
            self.assertEqual(first_movie, second_movie)
            self.assertEqual(first_selection_time, second_selection_time)

    def test_cron_command_no_movies_available(self):
        """Test cron command when no unwatched movies are available"""
        # Mark all movies as watched
        past_night = MovieNight.objects.create(
            host='testuser',
            night_date=timezone.now() - datetime.timedelta(days=1),
            location='past location',
            selected_movie=self.movie1,
            movie_selected_at=timezone.now() - datetime.timedelta(days=1)
        )
        
        MovieNight.objects.create(
            host='testuser',
            night_date=timezone.now() - datetime.timedelta(days=2),
            location='another past location',
            selected_movie=self.movie2,
            movie_selected_at=timezone.now() - datetime.timedelta(days=2)
        )

        # Create an upcoming night
        now = timezone.now()
        upcoming_night = MovieNight.objects.create(
            host='testuser',
            night_date=now + datetime.timedelta(seconds=5),
            location='upcoming'
        )

        with patch('django.utils.timezone.now', return_value=now):
            out = StringIO()
            call_command('select_movie_for_nights', stdout=out)
            output = out.getvalue()

        upcoming_night.refresh_from_db()
        
        # Should not have selected a movie
        self.assertIsNone(upcoming_night.selected_movie)
        self.assertIsNone(upcoming_night.movie_selected_at)
        
        # Output should indicate no movies available
        self.assertIn('No unwatched movies available for selection', output) 