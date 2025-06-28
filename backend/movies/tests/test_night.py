import json
from datetime import timedelta

from django.utils import timezone
from django.utils.dateparse import parse_datetime
from rest_framework import status
from rest_framework.test import APITestCase

from ..models import User, MovieNight, Attendees


class NightAPITest(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password', tickets=1)
        self.night1_date = timezone.now() + timedelta(days=10)
        self.night2_date = timezone.now() + timedelta(days=20)

        self.night1 = MovieNight.objects.create(
            host=self.user.username,
            night_date=self.night1_date,
            location='Location 1'
        )
        self.night2 = MovieNight.objects.create(
            host=self.user.username,
            night_date=self.night2_date,
            location='Location 2'
        )

    def test_get_all_nights_authenticated(self):
        self.client.force_login(self.user)
        response = self.client.get('/movies/newNight/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = json.loads(response.content)
        self.assertEqual(len(data), 2)

    def test_get_specific_night_by_date(self):
        self.client.force_login(self.user)
        start_date = self.night1_date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = self.night1_date.replace(hour=23, minute=59, second=59, microsecond=999999)
        response = self.client.get('/movies/newNight/', {
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat()
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = json.loads(response.content)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['host'], self.user.username)
        self.assertEqual(parse_datetime(data[0]['night_date']).date(), self.night1_date.date())

    def test_get_night_for_non_existent_date(self):
        self.client.force_login(self.user)
        non_existent_date = timezone.now() + timedelta(days=5)
        start_date = non_existent_date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = non_existent_date.replace(hour=23, minute=59, second=59, microsecond=999999)
        response = self.client.get('/movies/newNight/', {
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat()
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(json.loads(response.content), [])

    def test_get_night_unauthenticated(self):
        response = self.client.get('/movies/newNight/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_post_new_night_success(self):
        self.client.force_login(self.user)
        initial_tickets = self.user.tickets
        new_night_date = timezone.now() + timedelta(days=30)
        night_data = {
            'host': self.user.username,
            'night_date': new_night_date.isoformat(),
            'location': 'New Location'
        }
        response = self.client.post('/movies/newNight/', night_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(MovieNight.objects.filter(location='New Location').exists())
        self.user.refresh_from_db()
        self.assertEqual(self.user.tickets, initial_tickets + 2)
        # Check if host is added as attendee
        new_night = MovieNight.objects.get(location='New Location')
        self.assertTrue(Attendees.objects.filter(night=new_night, user=self.user).exists())

    def test_post_new_night_on_existing_date(self):
        self.client.force_login(self.user)
        night_data = {
            'host': self.user.username,
            'night_date': self.night1_date.isoformat(),
            'location': 'Another Location'
        }
        response = self.client.post('/movies/newNight/', night_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(json.loads(response.content), {'error': 'A MovieNight already exists on this calendar day (UTC).'})

    def test_post_new_night_incomplete_data(self):
        self.client.force_login(self.user)
        night_data = {'host': self.user.username}
        response = self.client.post('/movies/newNight/', night_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(json.loads(response.content), {'error': 'out of field'})

    def test_post_new_night_unauthenticated(self):
        new_night_date = timezone.now() + timedelta(days=30)
        night_data = {
            'host': self.user.username,
            'night_date': new_night_date.isoformat(),
            'location': 'New Location'
        }
        response = self.client.post('/movies/newNight/', night_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN) 