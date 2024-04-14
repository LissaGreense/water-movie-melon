from django.db import models
from django.contrib.auth.models import AbstractUser


class Movie(models.Model):
    title = models.CharField(max_length=50)
    link = models.CharField(max_length=150)
    user = models.CharField(max_length=20)
    date_added = models.DateTimeField('date_added')
    genre = models.CharField(max_length=20)


class User(AbstractUser):
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)

    def __str__(self):
        return self.username


class Rate(models.Model):
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.IntegerField()

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['movie', 'user'], name='unique_movie_user_rating')
        ]
