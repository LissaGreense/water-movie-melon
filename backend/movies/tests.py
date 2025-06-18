import json
from datetime import datetime, timedelta

from django.conf import settings
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.urls import reverse

from . import models
from .models import User
from .views import Night
import os
import shutil

DB_FORMAT_STRING = '%Y-%m-%dT%H:%M:%SZ'
PARAM_FORMAT_STRING = '%d.%m.%Y'


class TestCalls(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password')
        self.client.login(username='testuser', password='password')

    def test_new_movie_night_view_should_return_movie_night(self):
        # Given
        host_expected = "someone"
        night_date_expected = datetime.today().strftime(DB_FORMAT_STRING)
        location_expected = "somewhere"

        # When
        models.MovieNight.objects.create(host=host_expected, night_date=night_date_expected,
                                        location=location_expected)
        response = self.client.get(reverse('newNight'))

        # Then
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers['Content-Type'], 'application/json')
        response_data = json.loads(response.content)
        self.assertEqual(response_data[0]["host"], host_expected)
        self.assertEqual(response_data[0]["night_date"], night_date_expected)
        self.assertEqual(response_data[0]["location"], location_expected)

    def test_movie_night_view_params(self):
        # Given
        night_date_expected = datetime.today()
        night_date_expected_db_format = night_date_expected.strftime(DB_FORMAT_STRING)
        host = "someone"
        location = "somewhere"
        night_date_additional = (datetime.today() - timedelta(days=2)).strftime(DB_FORMAT_STRING)
        url = reverse('newNight') + f'?date={night_date_expected.strftime(PARAM_FORMAT_STRING)}'

        # When
        models.MovieNight.objects.create(host=host, night_date=night_date_expected_db_format, location=location)
        models.MovieNight.objects.create(host=host, night_date=night_date_additional, location=location)
        response = self.client.get(url)

        # Then
        movie_nights = json.loads(response.content)
        self.assertEqual(len(movie_nights), 1)
        self.assertEqual(movie_nights[0]['night_date'], night_date_expected.strftime(PARAM_FORMAT_STRING))


class AvatarUploadTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password')
        self.client.login(username='testuser', password='password')
        # Ensure the avatar directory exists
        self.avatar_dir = os.path.join(settings.MEDIA_ROOT)
        os.makedirs(self.avatar_dir, exist_ok=True)

    def tearDown(self):
        # Clean up the media directory
        if os.path.exists(self.avatar_dir):
            shutil.rmtree(self.avatar_dir)

    def test_avatar_upload(self):
        # First upload
        avatar_file = SimpleUploadedFile("avatar.jpg", b"file_content", content_type="image/jpeg")
        url = reverse('userAvatar', kwargs={'username': self.user.username})
        response = self.client.post(url, {'avatar': avatar_file})

        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.avatar.name.startswith(f'{self.user.username}_'))
        self.assertTrue(self.user.avatar.name.endswith('.jpg'))

        first_avatar_path = self.user.avatar.path
        self.assertTrue(os.path.exists(first_avatar_path))

        # Second upload
        new_avatar_file = SimpleUploadedFile("new_avatar.png", b"new_content", content_type="image/png")
        response = self.client.post(url, {'avatar': new_avatar_file})

        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.avatar.name.startswith(f'{self.user.username}_'))
        self.assertTrue(self.user.avatar.name.endswith('.png'))

        new_avatar_path = self.user.avatar.path
        self.assertTrue(os.path.exists(new_avatar_path))
        self.assertNotEqual(first_avatar_path, new_avatar_path)
        self.assertFalse(os.path.exists(first_avatar_path))
