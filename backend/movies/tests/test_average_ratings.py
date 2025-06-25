import json

from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from ..models import Movie, User, Rate


class AverageRatingsAPITest(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username='user1', password='password')
        self.user2 = User.objects.create_user(username='user2', password='password')

        self.movie1 = Movie.objects.create(
            title='Movie 1',
            link='http://example.com/movie1',
            user=self.user1.username,
            date_added=timezone.now(),
            genre='Genre 1',
        )
        self.movie2 = Movie.objects.create(
            title='Movie 2',
            link='http://example.com/movie2',
            user=self.user1.username,
            date_added=timezone.now(),
            genre='Genre 2',
        )
        self.movie_no_ratings = Movie.objects.create(
            title='Movie No Ratings',
            link='http://example.com/movienoratings',
            user=self.user1.username,
            date_added=timezone.now(),
            genre='Genre 3',
        )

        Rate.objects.create(movie=self.movie1, user=self.user1, rating=8)
        Rate.objects.create(movie=self.movie1, user=self.user2, rating=6) # Avg: 7.0
        Rate.objects.create(movie=self.movie2, user=self.user1, rating=5) # Avg: 5.0

    def test_get_average_ratings_success(self):
        # Test Case 1: Movies with ratings
        response = self.client.get('/movies/average_ratings/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = json.loads(response.content)
        self.assertEqual(len(data), 2)

        movie1_data = next((item for item in data if item['movie']['title'] == 'Movie 1'), None)
        movie2_data = next((item for item in data if item['movie']['title'] == 'Movie 2'), None)

        self.assertIsNotNone(movie1_data)
        self.assertIsNotNone(movie2_data)
        self.assertEqual(movie1_data['average_rating'], 7.0)
        self.assertEqual(movie2_data['average_rating'], 5.0)

    def test_get_average_ratings_ignores_movies_with_no_ratings(self):
        # Test Case 2: Movies with no ratings are not included
        response = self.client.get('/movies/average_ratings/')
        data = json.loads(response.content)
        titles = [item['movie']['title'] for item in data]
        self.assertNotIn('Movie No Ratings', titles)

    def test_get_average_ratings_no_movies_in_db(self):
        # Test Case 3: No movies in database
        Movie.objects.all().delete()
        response = self.client.get('/movies/average_ratings/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(json.loads(response.content), [])

    def test_get_average_ratings_unauthenticated_access(self):
        # Test Case 4: Unauthenticated access is allowed
        self.client.logout()
        response = self.client.get('/movies/average_ratings/')
        self.assertEqual(response.status_code, status.HTTP_200_OK) 