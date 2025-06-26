import json
import datetime

from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase, APIClient

from ..models import User, RegisterQuestion


@override_settings(CACHES={'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache'}})
class UserRegisterAPITest(APITestCase):

    def setUp(self):
        self.username = 'newuser'
        self.password = 'newpassword'
        self.correct_answer = 'the correct answer'
        self.wrong_answer = 'the wrong answer'

        today_weekday = str(datetime.datetime.today().weekday())

        RegisterQuestion.objects.create(
            day=today_weekday,
            question="What is the answer?",
            answer=self.correct_answer
        )

        User.objects.create_user(username='existinguser', password='password')

    def test_register_success(self):
        register_data = {
            'username': self.username,
            'password': self.password,
            'answer': self.correct_answer,
        }
        response = self.client.post('/movies/register/', register_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(User.objects.filter(username=self.username).exists())

    def test_register_existing_username(self):
        register_data = {
            'username': 'existinguser',
            'password': self.password,
            'answer': self.correct_answer,
        }
        response = self.client.post('/movies/register/', register_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(json.loads(response.content), {'error': 'USER ALREADY EXISTS'})

    def test_register_incorrect_answer(self):
        register_data = {
            'username': self.username,
            'password': self.password,
            'answer': self.wrong_answer,
        }
        response = self.client.post('/movies/register/', register_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(json.loads(response.content), {'error': 'BAD ANSWER'})

    def test_register_non_post_request(self):
        response = self.client.get('/movies/register/')
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_register_success_no_question(self):
        today_weekday = str(datetime.datetime.today().weekday())
        RegisterQuestion.objects.get(day=today_weekday).delete()

        register_data = {
            'username': self.username,
            'password': self.password,
        }
        response = self.client.post('/movies/register/', register_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(User.objects.filter(username=self.username).exists())

    def test_register_missing_answer_when_question_exists(self):
        register_data = {
            'username': self.username,
            'password': self.password,
        }
        response = self.client.post('/movies/register/', register_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(json.loads(response.content), {'error': 'ANSWER NOT PROVIDED'})