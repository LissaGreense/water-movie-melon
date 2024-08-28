from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("rate", views.rate, name="rate"),
    path("newNight", views.new_night, name='newNight'),
    path("attendees", views.attendees, name='attendees'),
    path("login", views.login_user, name='login'),
    path("userAvatar/<str:username>", views.user_avatar, name='userAvatar'),
    path("getSelectedMovie", views.rand_movie, name='getSelectedMovie'),
    path("getMovieDate", views.movie_date, name='getMovieDate'),
    path("checkForNights", views.check_for_nights, name='checkForNights'),
]
