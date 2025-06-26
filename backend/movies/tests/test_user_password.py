from rest_framework import status
from rest_framework.test import APITestCase
from ..models import User


class UserPasswordAPITest(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='oldpassword')
        self.other_user = User.objects.create_user(username='otheruser', password='password')
        self.url = f'/movies/userPassword/{self.user.username}/'
        self.other_user_url = f'/movies/userPassword/{self.other_user.username}/'

    def test_password_change_success(self):
        self.client.login(username='testuser', password='oldpassword')
        data = {'old_password': 'oldpassword', 'new_password': 'newpassword'}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('newpassword'))

    def test_password_change_incorrect_old_password(self):
        self.client.login(username='testuser', password='oldpassword')
        data = {'old_password': 'wrongpassword', 'new_password': 'newpassword'}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json(), {'error': 'Wrong password provided'})

    def test_password_change_for_another_user(self):
        self.client.login(username='testuser', password='oldpassword')
        data = {'old_password': 'password', 'new_password': 'newpassword'}
        response = self.client.post(self.other_user_url, data, format='json')
        # Assuming the view should prevent this. The view logic needs to be checked.
        # A 403 Forbidden would be appropriate. Let's see what the view does.
        # For now, let's assume it should be forbidden. If the test fails, we check the view.
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_password_change_unauthenticated(self):
        data = {'old_password': 'oldpassword', 'new_password': 'newpassword'}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN) 