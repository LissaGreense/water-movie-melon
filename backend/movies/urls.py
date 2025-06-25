from django.urls import path

from . import views

urlpatterns = [
    path("", views.MoviesObject.as_view(), name="moviesObject"),
    path("rate/", views.RateAPI.as_view(), name="rate"),
    path("newNight/", views.Night.as_view(), name='newNight'),
    path("attendees/", views.AttendeesView.as_view(), name='attendees'),
    path("login/", views.Login.as_view(), name='login'),
    path("logout/", views.Logout.as_view(), name='logout'),
    path("userAvatar/<str:username>/", views.Avatar.as_view(), name='userAvatar'),
    path("selectedMovie/", views.RandMovie.as_view(), name='selectedMovie'),
    path("movieDate/", views.MovieDate.as_view(), name='movieDate'),
    path("upcomingNights/", views.UpcomingNights.as_view(), name='upcomingNights'),
    path("userStatistics/<str:username>/", views.UserStatistics.as_view(), name='userStatistics'),
    path("register/", views.UserRegister.as_view(), name='userRegister'),
    path("registerQuestion/", views.RegisterQuestions.as_view(), name='registerQuestion'),
    path("userPassword/<str:username>/", views.UserPassword.as_view(), name='userPassword'),
    path("average_ratings/", views.AverageRatings.as_view(), name='averageRatings'),
]
