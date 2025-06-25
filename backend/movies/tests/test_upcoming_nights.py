from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from ..models import Movie, MovieNight, User
import datetime

class UpcomingNightsAPITest(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password')
        self.client.login(username='testuser', password='password')
        self.url = '/movies/upcomingNights/'
        self.movie = Movie.objects.create(user='testuser', title='Test Movie', link='link', date_added=timezone.now(), genre='genre')

    def test_upcoming_night_exists(self):
        # Create a night in the future without a movie
        future_date = timezone.now() + datetime.timedelta(days=5)
        MovieNight.objects.create(host='testuser', night_date=future_date, location='someplace')

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), True)

    def test_no_upcoming_nights(self):
        # No future nights exist
        MovieNight.objects.all().delete()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), False)

    def test_upcoming_night_already_has_movie(self):
        # Create a future night that already has a movie assigned
        future_date = timezone.now() + datetime.timedelta(days=5)
        MovieNight.objects.create(host='testuser', night_date=future_date, location='someplace', selected_movie=self.movie)

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), False) 