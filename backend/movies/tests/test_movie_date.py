from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from ..models import Movie, MovieNight, User
import datetime
import json
from django.core.serializers.json import DjangoJSONEncoder

class MovieDateAPITest(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password')
        self.client.login(username='testuser', password='password')
        self.url = '/movies/movieDate/'
        self.movie = Movie.objects.create(user='testuser', title='Test Movie', link='link', date_added=timezone.now(), genre='genre')

    def test_upcoming_night_exists(self):
        # Create a night in the future
        future_date = timezone.now() + datetime.timedelta(days=10)
        MovieNight.objects.create(host='testuser', night_date=future_date, location='here')

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # The response should be a JSON-encoded datetime string
        expected_json = json.dumps(future_date, cls=DjangoJSONEncoder)
        self.assertEqual(response.content.decode(), expected_json)

    def test_no_upcoming_nights(self):
        # Ensure no future nights exist
        MovieNight.objects.all().delete()
        # Create a night in the past
        past_date = timezone.now() - datetime.timedelta(days=10)
        MovieNight.objects.create(host='testuser', night_date=past_date, location='there')
        
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), [])

    def test_upcoming_night_has_selected_movie(self):
        # Create a future night that already has a movie
        future_date = timezone.now() + datetime.timedelta(days=10)
        MovieNight.objects.create(host='testuser', night_date=future_date, location='here', selected_movie=self.movie)

        # Create another future night even further in the future without a movie
        # to ensure the view still returns nothing if the *next* one has a movie.
        # The view logic seems to only find the *very next* night.
        # Let's test based on the current implementation.
        # If the closest upcoming night has a movie, it should return [].
        
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), []) 