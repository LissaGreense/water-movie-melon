from rest_framework import status
from rest_framework.test import APITestCase

from ..models import User


class LogoutAPITest(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpassword')

    def test_logout_authenticated_user(self):
        self.client.force_login(self.user)
        self.assertTrue('_auth_user_id' in self.client.session)

        response = self.client.post('/movies/logout/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse('_auth_user_id' in self.client.session)

    def test_logout_unauthenticated_user(self):
        response = self.client.post('/movies/logout/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN) 