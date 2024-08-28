from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("rate", views.rate, name="rate"),
    path("newNight", views.new_night, name='newNight'),
    path("attendees", views.attendees, name='attendees'),
    path("login", views.login_user, name='login'),
    path("userAvatar/<str:username>", views.user_avatar, name='userAvatar'),
    path("selectedMovie", views.rand_movie, name='selectedMovie'),
    path("movieDate", views.movie_date, name='movieDate'),
    path("upcomingNights", views.upcoming_nights, name='upcomingNights'),
    path("userStatistics/<str:username>", views.user_statistics, name='userStatistics'),
]
