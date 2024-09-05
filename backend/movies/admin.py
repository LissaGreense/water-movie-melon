from django.contrib import admin
from .models import Movie, Rate, User, MovieNight, Attendees, RegisterQuestion

admin.site.register(User)
admin.site.register(Movie)
admin.site.register(Rate)
admin.site.register(MovieNight)
admin.site.register(Attendees)
admin.site.register(RegisterQuestion)
