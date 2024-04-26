from django.contrib import admin
from .models import Movie, Rate, User


admin.site.register(User)
admin.site.register(Movie)
admin.site.register(Rate)
