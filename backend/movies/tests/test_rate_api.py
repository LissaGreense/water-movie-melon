import json

from django.db import IntegrityError
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from ..models import Movie, User, Rate


class RateAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password')
        self.movie = Movie.objects.create(
            title='Test Movie',
            link='http://example.com/testmovie',
            user=self.user.username,
            date_added=timezone.now(),
            genre='Test',
        )

    def test_get_ratings_success(self):
        Rate.objects.create(movie=self.movie, user=self.user, rating=9)
        response = self.client.get('/movies/rate/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = json.loads(response.content)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['movie']['title'], self.movie.title)
        self.assertEqual(data[0]['user'], self.user.username)
        self.assertEqual(data[0]['rating'], 9)

    def test_get_ratings_no_ratings_in_db(self):
        response = self.client.get('/movies/rate/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(json.loads(response.content), [])

    def test_post_rating_success(self):
        self.client.force_login(self.user)
        rating_data = {
            'movie': self.movie.title,
            'user': self.user.username,
            'rating': 8,
        }
        response = self.client.post('/movies/rate/', rating_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(Rate.objects.filter(movie=self.movie, user=self.user, rating=8).exists())

    def test_post_rating_non_existent_movie(self):
        self.client.force_login(self.user)
        rating_data = {
            'movie': 'Non Existent Movie',
            'user': self.user.username,
            'rating': 5,
        }
        response = self.client.post('/movies/rate/', rating_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_post_rating_incomplete_data(self):
        self.client.force_login(self.user)
        rating_data = {'movie': self.movie.title, 'user': self.user.username}
        response = self.client.post('/movies/rate/', rating_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_post_rating_unauthenticated(self):
        rating_data = {
            'movie': self.movie.title,
            'user': self.user.username,
            'rating': 8,
        }
        response = self.client.post('/movies/rate/', rating_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_post_rating_duplicate(self):
        self.client.force_login(self.user)
        Rate.objects.create(movie=self.movie, user=self.user, rating=10)
        rating_data = {
            'movie': self.movie.title,
            'user': self.user.username,
            'rating': 5,
        }
        with self.assertRaises(IntegrityError):
            self.client.post('/movies/rate/', rating_data, format='json') 