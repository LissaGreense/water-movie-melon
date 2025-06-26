import os
from django.core.files.uploadedfile import SimpleUploadedFile
from django.conf import settings
from rest_framework import status
from rest_framework.test import APITestCase
from ..models import User


class AvatarAPITest(APITestCase):

    def setUp(self):
        self.user_with_avatar = User.objects.create_user(username='user1', password='password')
        self.user_without_avatar = User.objects.create_user(username='user2', password='password')
        self.other_user = User.objects.create_user(username='otheruser', password='password')

        # Create a dummy file for upload
        self.avatar_file = SimpleUploadedFile("avatar.jpg", b"file_content", content_type="image/jpeg")
        self.user_with_avatar.avatar.save("avatar.jpg", self.avatar_file)

        self.client.login(username='user1', password='password')

    def tearDown(self):
        # Clean up created media files
        if self.user_with_avatar.avatar:
            if os.path.exists(self.user_with_avatar.avatar.path):
                 os.remove(self.user_with_avatar.avatar.path)
        # Clean up other avatar files if necessary
        user = User.objects.get(username='user2')
        if user.avatar and os.path.exists(user.avatar.path):
            os.remove(user.avatar.path)


    def test_get_avatar_for_user_with_avatar(self):
        url = f'/movies/userAvatar/{self.user_with_avatar.username}/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('avatar_url', response.json())
        self.assertTrue(response.json()['avatar_url'].endswith('avatar.jpg'))

    def test_get_avatar_for_user_without_avatar(self):
        url = f'/movies/userAvatar/{self.user_without_avatar.username}/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), {'avatar_url': ''})

    def test_get_avatar_for_non_existent_user(self):
        url = '/movies/userAvatar/nonexistentuser/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_get_avatar_unauthenticated(self):
        self.client.logout()
        url = f'/movies/userAvatar/{self.user_with_avatar.username}/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_upload_new_avatar_replaces_old(self):
        url = f'/movies/userAvatar/{self.user_with_avatar.username}/'
        old_avatar_path = self.user_with_avatar.avatar.path
        
        new_avatar_file = SimpleUploadedFile("new_avatar.jpg", b"new_file_content", content_type="image/jpeg")
        
        response = self.client.post(url, {'avatar': new_avatar_file}, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user_with_avatar.refresh_from_db()
        self.assertIn(self.user_with_avatar.username, self.user_with_avatar.avatar.name)
        self.assertFalse(os.path.exists(old_avatar_path))

    def test_upload_avatar_first_time(self):
        url = f'/movies/userAvatar/{self.user_without_avatar.username}/'
        self.client.login(username='user2', password='password')
        
        avatar_file = SimpleUploadedFile("first_avatar.jpg", b"file_content", content_type="image/jpeg")
        response = self.client.post(url, {'avatar': avatar_file}, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user_without_avatar.refresh_from_db()
        self.assertIn(self.user_without_avatar.username, self.user_without_avatar.avatar.name)

    def test_upload_avatar_for_another_user(self):
        # user1 tries to upload for otheruser
        url = f'/movies/userAvatar/{self.other_user.username}/'
        avatar_file = SimpleUploadedFile("another_avatar.jpg", b"file_content", content_type="image/jpeg")
        
        response = self.client.post(url, {'avatar': avatar_file}, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_upload_avatar_unauthenticated(self):
        self.client.logout()
        url = f'/movies/userAvatar/{self.user_with_avatar.username}/'
        avatar_file = SimpleUploadedFile("unauth_avatar.jpg", b"file_content", content_type="image/jpeg")
        
        response = self.client.post(url, {'avatar': avatar_file}, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN) 