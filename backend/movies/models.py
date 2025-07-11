from django.db import models
from django.contrib.auth.models import AbstractUser
from watermoviemelon.utils.timezone import get_business_date


class Movie(models.Model):
    title = models.CharField(max_length=50)
    link = models.CharField(max_length=150)
    user = models.CharField(max_length=20)
    date_added = models.DateTimeField('date_added')
    genre = models.CharField(max_length=20)
    cover_link = models.CharField(max_length=150, default='')
    duration = models.IntegerField(default=1)


class User(AbstractUser):
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    tickets = models.PositiveIntegerField(default=1)

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


class MovieNight(models.Model):
    host = models.CharField(max_length=50)
    night_date = models.DateTimeField('night_date')
    location = models.CharField(max_length=100)
    selected_movie = models.ForeignKey(Movie, on_delete=models.CASCADE, null=True, related_name='watched_movie')

    @property
    def business_date(self):
        """Get the calendar date in business timezone"""
        return get_business_date(self.night_date)


class Attendees(models.Model):
    night = models.ForeignKey(MovieNight, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    accept_date = models.DateTimeField('accept_date')

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['night', 'user'], name='unique_night_user_attendee')
        ]

class RegisterQuestion(models.Model):
    QUESTION_DAY = [
        ("0", "Monday"),
        ("1", "Tuesday"),
        ("2", "Wednesday"),
        ("3", "Thursday"),
        ("4", "Friday"),
        ("5", "Saturday"),
        ("6", "Sunday"),
    ]
    question = models.CharField(max_length=150)
    answer = models.CharField(max_length=100)
    day = models.CharField(max_length=1, choices=QUESTION_DAY, unique=True)