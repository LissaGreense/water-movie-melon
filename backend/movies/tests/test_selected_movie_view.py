import datetime
from unittest.mock import patch
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from ..models import Movie, MovieNight, User


class SelectedMovieViewTest(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password')
        self.client.login(username='testuser', password='password')
        self.url = '/movies/selectedMovie/'

        # Create test movies
        self.movie1 = Movie.objects.create(
            title='Selected Movie 1', 
            link='link1', 
            user='testuser', 
            date_added=timezone.now(), 
            genre='genre1'
        )
        self.movie2 = Movie.objects.create(
            title='Selected Movie 2', 
            link='link2', 
            user='testuser', 
            date_added=timezone.now(), 
            genre='genre2'
        )

    def test_get_selected_movie_during_display_period(self):
        """Test getting selected movie during the display period"""
        now = timezone.now()
        # Create a night that just finished (within 1 hour)
        recent_night = MovieNight.objects.create(
            host='testuser',
            night_date=now - datetime.timedelta(minutes=30),
            location='recent',
            selected_movie=self.movie1,
            movie_selected_at=now - datetime.timedelta(minutes=30)
        )

        with patch('django.utils.timezone.now', return_value=now):
            response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data['title'], self.movie1.title)
        self.assertIn('movie_selected_at', data)
        self.assertIn('night_date', data)

    def test_get_selected_movie_after_display_period(self):
        """Test getting selected movie after the 1-hour display period"""
        now = timezone.now()
        # Create a night that finished more than 1 hour ago
        old_night = MovieNight.objects.create(
            host='testuser',
            night_date=now - datetime.timedelta(hours=2),
            location='old',
            selected_movie=self.movie1,
            movie_selected_at=now - datetime.timedelta(hours=2)
        )

        with patch('django.utils.timezone.now', return_value=now):
            response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNone(response.json())

    def test_get_selected_movie_future_night(self):
        """Test getting selected movie for a future night"""
        now = timezone.now()
        # Create a future night with selected movie
        future_night = MovieNight.objects.create(
            host='testuser',
            night_date=now + datetime.timedelta(hours=1),
            location='future',
            selected_movie=self.movie1,
            movie_selected_at=now - datetime.timedelta(minutes=5)
        )

        with patch('django.utils.timezone.now', return_value=now):
            response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data['title'], self.movie1.title)

    def test_no_movie_selected_yet(self):
        """Test when no movie has been selected yet"""
        now = timezone.now()
        # Create a future night without selected movie
        future_night = MovieNight.objects.create(
            host='testuser',
            night_date=now + datetime.timedelta(hours=1),
            location='future'
        )

        with patch('django.utils.timezone.now', return_value=now):
            response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNone(response.json())

    def test_multiple_movie_nights_priority(self):
        """Test priority when multiple movie nights exist"""
        now = timezone.now()
        
        # Create a past night (within 1 hour)
        past_night = MovieNight.objects.create(
            host='testuser',
            night_date=now - datetime.timedelta(minutes=30),
            location='past',
            selected_movie=self.movie1,
            movie_selected_at=now - datetime.timedelta(minutes=30)
        )
        
        # Create a future night
        future_night = MovieNight.objects.create(
            host='testuser',
            night_date=now + datetime.timedelta(hours=1),
            location='future',
            selected_movie=self.movie2,
            movie_selected_at=now - datetime.timedelta(minutes=10)
        )

        with patch('django.utils.timezone.now', return_value=now):
            response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        # Should prioritize future night over past night
        self.assertEqual(data['title'], self.movie2.title)

    def test_current_night_countdown_finished(self):
        """Test when countdown has just finished (night is happening now)"""
        now = timezone.now()
        # Create a night happening right now
        current_night = MovieNight.objects.create(
            host='testuser',
            night_date=now - datetime.timedelta(seconds=30),
            location='current',
            selected_movie=self.movie1,
            movie_selected_at=now - datetime.timedelta(minutes=5)
        )

        with patch('django.utils.timezone.now', return_value=now):
            response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data['title'], self.movie1.title)

    def test_read_only_endpoint(self):
        """Test that this is a read-only endpoint"""
        # This endpoint should only support GET requests
        post_response = self.client.post(self.url, {})
        self.assertEqual(post_response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
        
        put_response = self.client.put(self.url, {})
        self.assertEqual(put_response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
        
        delete_response = self.client.delete(self.url)
        self.assertEqual(delete_response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_response_includes_all_fields(self):
        """Test that response includes all expected fields"""
        now = timezone.now()
        night = MovieNight.objects.create(
            host='testuser',
            night_date=now - datetime.timedelta(minutes=10),
            location='test',
            selected_movie=self.movie1,
            movie_selected_at=now - datetime.timedelta(minutes=15)
        )

        with patch('django.utils.timezone.now', return_value=now):
            response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        
        # Check all movie fields are present
        required_fields = ['title', 'link', 'user', 'date_added', 'genre', 'cover_link', 'duration']
        for field in required_fields:
            self.assertIn(field, data)
        
        # Check new metadata fields are present
        self.assertIn('movie_selected_at', data)
        self.assertIn('night_date', data) 