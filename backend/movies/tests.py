import json
from datetime import datetime, timedelta
from django.test import TestCase
from django.test.client import RequestFactory

from . import models
from . import views

DB_FORMAT_STRING = '%Y-%m-%dT%H:%M:%SZ'
PARAM_FORMAT_STRING = '%d.%m.%Y'


class TestCalls(TestCase):
    def setUp(self):
        self.factory = RequestFactory()

    def test_new_movie_night_view_should_return_movie_night(self):
        # Given
        request = self.factory.get('/newNight')
        host_expected = "someone"
        night_date_expected = datetime.today().strftime(DB_FORMAT_STRING)
        location_expected = "somewhere"

        # When
        models.MovieNight.objects.create(host=host_expected, night_date=night_date_expected, location=location_expected)
        response = views.new_night(request)

        # Then
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers, {'Content-Type': 'application/json'})
        self.assertEqual(json.loads(response.content),
                         [{"host": host_expected, "night_date": night_date_expected, "location": location_expected}])

    def test_movie_night_view_params(self):
        # Given
        night_date_expected = datetime.today()
        night_date_expected_db_format = night_date_expected.strftime(DB_FORMAT_STRING)
        host = "someone"
        location = "somewhere"
        night_date_additional = (datetime.today() - timedelta(days=2)).strftime(DB_FORMAT_STRING)
        request = self.factory.get('/newNight', {"date": night_date_expected.strftime(PARAM_FORMAT_STRING)})

        # When
        models.MovieNight.objects.create(host=host, night_date=night_date_expected_db_format, location=location)
        models.MovieNight.objects.create(host=host, night_date=night_date_additional, location=location)
        response = views.new_night(request)

        # Then
        movie_nights = json.loads(response.content)
        self.assertEqual(len(movie_nights), 1)
        self.assertEqual(movie_nights[0]['night_date'], night_date_expected_db_format)
