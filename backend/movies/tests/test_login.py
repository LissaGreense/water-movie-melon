import json

from rest_framework import status
from rest_framework.test import APITestCase

from ..models import User


class LoginAPITest(APITestCase):

    def setUp(self):
        self.username = 'testuser'
        self.password = 'testpassword'
        self.user = User.objects.create_user(username=self.username, password=self.password)

    def test_login_success(self):
        login_data = {'username': self.username, 'password': self.password}
        response = self.client.post('/movies/login/', login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue('_auth_user_id' in self.client.session)

    def test_login_invalid_password(self):
        login_data = {'username': self.username, 'password': 'wrongpassword'}
        response = self.client.post('/movies/login/', login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(json.loads(response.content), {'error': 'Invalid credentials'})
        self.assertFalse('_auth_user_id' in self.client.session)

    def test_login_non_existent_user(self):
        login_data = {'username': 'nonexistent', 'password': 'password'}
        response = self.client.post('/movies/login/', login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(json.loads(response.content), {'error': 'Invalid credentials'})
        self.assertFalse('_auth_user_id' in self.client.session)

    def test_login_missing_credentials(self):
        # Missing password
        login_data_no_pass = {'username': self.username}
        response_no_pass = self.client.post('/movies/login/', login_data_no_pass, format='json')
        self.assertEqual(response_no_pass.status_code, status.HTTP_400_BAD_REQUEST)

        # Missing username
        login_data_no_user = {'password': self.password}
        response_no_user = self.client.post('/movies/login/', login_data_no_user, format='json')
        self.assertEqual(response_no_user.status_code, status.HTTP_400_BAD_REQUEST)

        # Empty credentials
        login_data_empty = {}
        response_empty = self.client.post('/movies/login/', login_data_empty, format='json')
        self.assertEqual(response_empty.status_code, status.HTTP_400_BAD_REQUEST) 