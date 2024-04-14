from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("rate", views.rate, name="rate"),
    path("newNight", views.new_night, name='newNight'),
]
