from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("newNight", views.new_night, name='newNight'),
]