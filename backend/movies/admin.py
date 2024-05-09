from django.contrib import admin
from .models import Movie, Rate, User, MovieNight, Attendees

admin.site.register(User)
admin.site.register(Movie)
admin.site.register(Rate)
admin.site.register(MovieNight)
admin.site.register(Attendees)
