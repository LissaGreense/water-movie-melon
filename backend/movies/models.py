from django.db import models


class Movie(models.Model):
    title = models.CharField(max_length=50)
    link = models.CharField(max_length=150)
    user = models.CharField(max_length=20)
    date_added = models.DateTimeField('date_added')
    genre = models.CharField(max_length=20)
    cover_link = models.CharField(max_length=150, default='')
    duration = models.IntegerField(default=1)


class MovieNight(models.Model):
    host = models.CharField(max_length=50)
    night_date = models.DateTimeField('night_date')
    location = models.CharField(max_length=100)
