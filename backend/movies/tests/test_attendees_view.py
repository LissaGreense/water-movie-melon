import json
from datetime import timedelta

from django.db import IntegrityError
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from ..models import User, MovieNight, Attendees


class AttendeesViewAPITest(APITestCase):

    def setUp(self):
        self.user1 = User.objects.create_user(username='user1', password='password', tickets=1)
        self.user2 = User.objects.create_user(username='user2', password='password', tickets=1)
        self.night = MovieNight.objects.create(
            host=self.user1.username,
            night_date=timezone.now() + timedelta(days=5),
            location='Someplace'
        )
        Attendees.objects.create(night=self.night, user=self.user1, accept_date=timezone.now())

    def test_get_all_attendees_authenticated(self):
        self.client.force_login(self.user1)
        Attendees.objects.create(night=self.night, user=self.user2, accept_date=timezone.now())
        response = self.client.get('/movies/attendees/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = json.loads(response.content)
        self.assertEqual(len(data), 2)
        usernames = {item['user'] for item in data}
        self.assertIn(self.user1.username, usernames)
        self.assertIn(self.user2.username, usernames)

    def test_get_no_attendees(self):
        self.client.force_login(self.user1)
        Attendees.objects.all().delete()
        response = self.client.get('/movies/attendees/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(json.loads(response.content), [])

    def test_get_attendees_unauthenticated(self):
        response = self.client.get('/movies/attendees/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_post_attendee_success(self):
        self.client.force_login(self.user2)
        initial_tickets = self.user2.tickets
        attendee_data = {
            'night': {
                'night_date': self.night.night_date.isoformat()
            },
            'user': self.user2.username,
            'accept_date': timezone.now().isoformat()
        }
        response = self.client.post('/movies/attendees/', attendee_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(Attendees.objects.filter(night=self.night, user=self.user2).exists())
        self.user2.refresh_from_db()
        self.assertEqual(self.user2.tickets, initial_tickets + 1)

    def test_post_attendee_non_existent_night(self):
        self.client.force_login(self.user2)
        non_existent_date = (timezone.now() + timedelta(days=99)).isoformat()
        attendee_data = {
            'night': {
                'night_date': non_existent_date
            },
            'user': self.user2.username,
            'accept_date': timezone.now().isoformat()
        }
        with self.assertRaises(MovieNight.DoesNotExist):
            self.client.post('/movies/attendees/', attendee_data, format='json')

    def test_post_attendee_duplicate(self):
        self.client.force_login(self.user1)
        attendee_data = {
            'night': {
                'night_date': self.night.night_date.isoformat()
            },
            'user': self.user1.username,
            'accept_date': timezone.now().isoformat()
        }
        with self.assertRaises(IntegrityError):
            self.client.post('/movies/attendees/', attendee_data, format='json')

    def test_post_attendee_unauthenticated(self):
        attendee_data = {
            'night': {
                'night_date': self.night.night_date.isoformat()
            },
            'user': self.user2.username,
            'accept_date': timezone.now().isoformat()
        }
        response = self.client.post('/movies/attendees/', attendee_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN) 