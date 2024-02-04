from django.db import models


class Movie(models.Model):
    title = models.CharField(max_length=50)
    link = models.CharField(max_length=150)
    user = models.CharField(max_length=20)
    date_added = models.DateTimeField('date_added')
    genre = models.CharField(max_length=20)
