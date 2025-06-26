import datetime
from unittest.mock import patch

from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from ..models import Movie, MovieNight, User


class RandMovieAPITest(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password')
        self.client.login(username='testuser', password='password')
        self.url = '/movies/selectedMovie/'

        self.movie1 = Movie.objects.create(title='Unwatched Movie 1', link='link1', user='testuser', date_added=timezone.now(), genre='genre1')
        self.movie2 = Movie.objects.create(title='Unwatched Movie 2', link='link2', user='testuser', date_added=timezone.now(), genre='genre2')
        self.watched_movie = Movie.objects.create(title='Watched Movie', link='link3', user='testuser', date_added=timezone.now(), genre='genre3')
        
        past_night = MovieNight.objects.create(
            host='testuser',
            night_date=timezone.now() - datetime.timedelta(days=7),
            location='past location',
            selected_movie=self.watched_movie
        )

    def test_successful_random_movie_selection(self):
        night_date = timezone.now() + datetime.timedelta(seconds=5)
        upcoming_night = MovieNight.objects.create(host='testuser', night_date=night_date, location='upcoming')

        with patch('django.utils.timezone.now', return_value=night_date):
            response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn(response.json()['title'], [self.movie1.title, self.movie2.title])

        upcoming_night.refresh_from_db()
        self.assertIsNotNone(upcoming_night.selected_movie)

    def test_no_upcoming_nights(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), [])

    def test_too_early_to_select_movie(self):
        night_date = timezone.now() + datetime.timedelta(days=1)
        MovieNight.objects.create(host='testuser', night_date=night_date, location='far_future')
        
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, status.HTTP_425_TOO_EARLY)
        self.assertEqual(response.json(), {'error': 'Too soon, try again later'})

    def test_no_unwatched_movies_available(self):
        # Mark all movies as watched
        MovieNight.objects.create(
            host='testuser',
            night_date=timezone.now() - datetime.timedelta(days=1),
            location='another past location',
            selected_movie=self.movie1
        )
        MovieNight.objects.create(
            host='testuser',
            night_date=timezone.now() - datetime.timedelta(days=2),
            location='yet another past location',
            selected_movie=self.movie2
        )

        night_date = timezone.now() + datetime.timedelta(seconds=5)
        MovieNight.objects.create(host='testuser', night_date=night_date, location='upcoming_no_movies')

        with patch('django.utils.timezone.now', return_value=night_date):
            response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), []) 