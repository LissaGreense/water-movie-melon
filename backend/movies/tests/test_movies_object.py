import datetime
import json

from django.db import IntegrityError
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from ..models import Movie, User, MovieNight


class MoviesObjectAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpassword', tickets=5)
        self.user_no_tickets = User.objects.create_user(username='notickets', password='testpassword', tickets=0)

        self.movie1 = Movie.objects.create(
            title='Inception',
            link='http://example.com/inception',
            user=self.user.username,
            date_added=timezone.now(),
            genre='Sci-Fi',
        )
        self.movie2 = Movie.objects.create(
            title='The Dark Knight',
            link='http://example.com/tdk',
            user=self.user.username,
            date_added=timezone.now(),
            genre='Action',
        )
        self.movie3 = Movie.objects.create(
            title='Interstellar',
            link='http://example.com/interstellar',
            user=self.user.username,
            date_added=timezone.now(),
            genre='Sci-Fi',
        )

        self.watched_movie_night = MovieNight.objects.create(
            host=self.user.username,
            night_date=timezone.now() - datetime.timedelta(days=1),
            location='Living Room',
            selected_movie=self.movie1
        )

    def test_get_movies_no_parameters(self):
        response = self.client.get('/movies/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(json.loads(response.content)), 3)

    def test_get_movies_filter_watched_false(self):
        response = self.client.get('/movies/', {'watched': 'false'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = json.loads(response.content)
        self.assertEqual(len(data), 2)
        titles = [movie['title'] for movie in data]
        self.assertNotIn(self.movie1.title, titles)
        self.assertIn(self.movie2.title, titles)

    def test_get_movies_filter_watched_true(self):
        response = self.client.get('/movies/', {'watched': 'true'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = json.loads(response.content)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['title'], self.movie1.title)

    def test_get_movies_random(self):
        response = self.client.get('/movies/', {'random': 'true'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(json.loads(response.content)), 3)

    def test_get_movies_limit(self):
        response = self.client.get('/movies/', {'limit': '2'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(json.loads(response.content)), 2)

    def test_get_movies_search(self):
        response = self.client.get('/movies/', {'search': 'Inception'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = json.loads(response.content)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['title'], 'Inception')

    def test_get_movies_order_by_title_asc(self):
        response = self.client.get('/movies/', {'orderBy[type]': 'title'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = json.loads(response.content)
        titles = [movie['title'] for movie in data]
        self.assertEqual(titles, ['Inception', 'Interstellar', 'The Dark Knight'])

    def test_get_movies_order_by_title_desc(self):
        response = self.client.get('/movies/', {'orderBy[type]': 'title', 'orderBy[ascending]': 'false'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = json.loads(response.content)
        titles = [movie['title'] for movie in data]
        self.assertEqual(titles, ['The Dark Knight', 'Interstellar', 'Inception'])

    def test_get_movies_combination_filters(self):
        response = self.client.get('/movies/', {'watched': 'false', 'orderBy[type]': 'title'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = json.loads(response.content)
        self.assertEqual(len(data), 2)
        titles = [movie['title'] for movie in data]
        self.assertEqual(titles, ['Interstellar', 'The Dark Knight'])

    def test_get_movies_no_movies_in_db(self):
        Movie.objects.all().delete()
        response = self.client.get('/movies/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(json.loads(response.content), [])

    def test_post_movie_success(self):
        self.client.force_login(self.user)
        movie_data = {
            'title': 'Pulp Fiction',
            'link': 'http://example.com/pulpfiction',
            'user': self.user.username,
            'date_added': timezone.now().isoformat(),
            'genre': 'Crime',
            'cover_link': '',
            'duration': 154
        }
        response = self.client.post('/movies/', movie_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(Movie.objects.filter(title='Pulp Fiction').exists())
        self.user.refresh_from_db()
        self.assertEqual(self.user.tickets, 4)

    def test_post_movie_no_tickets(self):
        self.client.force_login(self.user_no_tickets)
        movie_data = {
            'title': 'Pulp Fiction',
            'link': 'http://example.com/pulpfiction',
            'user': self.user_no_tickets.username,
            'date_added': timezone.now().isoformat(),
            'genre': 'Crime',
            'cover_link': '',
            'duration': 154
        }
        response = self.client.post('/movies/', movie_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_402_PAYMENT_REQUIRED)
        self.assertFalse(Movie.objects.filter(title='Pulp Fiction').exists())

    def test_post_movie_invalid_data(self):
        self.client.force_login(self.user)
        movie_data = {'title': 'Missing Fields', 'user': self.user.username}
        with self.assertRaises(IntegrityError):
            self.client.post('/movies/', movie_data, format='json')

    def test_post_movie_unauthenticated(self):
        movie_data = {
            'title': 'Pulp Fiction',
            'link': 'http://example.com/pulpfiction',
            'user': self.user.username,
            'date_added': timezone.now().isoformat(),
            'genre': 'Crime',
            'cover_link': '',
            'duration': 154
        }
        response = self.client.post('/movies/', movie_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN) 