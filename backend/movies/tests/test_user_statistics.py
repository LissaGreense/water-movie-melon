from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from ..models import User, Movie, Rate, MovieNight, Attendees
import datetime

class UserStatisticsAPITest(APITestCase):

    def setUp(self):
        self.stats_user = User.objects.create_user(username='statsuser', password='password', tickets=5)
        self.other_user = User.objects.create_user(username='otheruser', password='password')
        self.client.login(username='otheruser', password='password')
        self.url = f'/movies/userStatistics/{self.stats_user.username}/'

        # 1. Movies added by stats_user
        self.movie1 = Movie.objects.create(user='statsuser', title='High Rated Movie', link='l1', date_added=timezone.now(), genre='g1')
        self.movie2 = Movie.objects.create(user='statsuser', title='Low Rated Movie', link='l2', date_added=timezone.now(), genre='g2')
        Movie.objects.create(user='otheruser', title='Another Movie', link='l3', date_added=timezone.now(), genre='g3')

        # 2. Ratings for those movies
        Rate.objects.create(movie=self.movie1, user=self.other_user, rating=9)
        Rate.objects.create(movie=self.movie2, user=self.other_user, rating=3)

        # 3. A night hosted by stats_user (in the past)
        hosted_night = MovieNight.objects.create(host='statsuser', night_date=timezone.now() - datetime.timedelta(days=7), location='loc1')
        Attendees.objects.create(night=hosted_night, user=self.stats_user, accept_date=timezone.now())

        # 4. A night attended by stats_user
        attended_night = MovieNight.objects.create(host='otheruser', night_date=timezone.now() - datetime.timedelta(days=14), location='loc2')
        Attendees.objects.create(night=attended_night, user=self.stats_user, accept_date=timezone.now())

    def test_get_statistics_for_existing_user(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        expected_stats = {
            'added_movies': 2,
            'seven_rated_movies': 1,
            'watched_movies': 2, # User attended 2 nights (1 hosted, 1 regular)
            'hosted_movie_nights': 1,
            'highest_rated_movie': 'High Rated Movie',
            'lowest_rated_movie': 'Low Rated Movie',
            'movie_tickets': 5
        }
        self.assertEqual(response.json(), expected_stats)

    def test_get_statistics_for_new_user(self):
        new_user = User.objects.create_user(username='newuser', password='password', tickets=1)
        url = f'/movies/userStatistics/{new_user.username}/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        expected_stats = {
            'added_movies': 0,
            'seven_rated_movies': 0,
            'watched_movies': 0,
            'hosted_movie_nights': 0,
            'highest_rated_movie': None,
            'lowest_rated_movie': None,
            'movie_tickets': 1
        }
        self.assertEqual(response.json(), expected_stats)

    def test_get_statistics_for_non_existent_user(self):
        url = '/movies/userStatistics/nonexistentuser/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_get_statistics_unauthenticated(self):
        self.client.logout()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN) 