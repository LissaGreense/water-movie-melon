import json
from datetime import datetime, timedelta
from django.utils import timezone as django_timezone
import pytz
from rest_framework import status
from rest_framework.test import APITestCase
from ..models import User, MovieNight
from watermoviemelon.utils.timezone import (
    get_business_timezone,
    get_business_day_range,
    convert_to_business_timezone,
    get_business_date
)


class TimezoneLogicTest(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password', tickets=1)
        self.client.force_login(self.user)

    def test_business_day_boundaries(self):
        """Test that day boundaries work correctly in business timezone"""
        # Test with a specific date in business timezone
        business_tz = get_business_timezone()
        test_date = datetime(2024, 3, 15, 14, 30)  # 2:30 PM on March 15, 2024
        test_date_aware = business_tz.localize(test_date)
        
        # Get business day range
        start_utc, end_utc = get_business_day_range(test_date_aware.date())
        
        # Convert back to business timezone to verify
        start_business = convert_to_business_timezone(start_utc)
        end_business = convert_to_business_timezone(end_utc)
        
        # Should be start and end of day in business timezone
        self.assertIsNotNone(start_business)
        self.assertIsNotNone(end_business)
        self.assertEqual(start_business.hour, 0)
        self.assertEqual(start_business.minute, 0)
        self.assertEqual(start_business.second, 0)
        self.assertEqual(end_business.hour, 23)
        self.assertEqual(end_business.minute, 59)
        self.assertEqual(end_business.second, 59)
        
        # Should be the same calendar date
        self.assertEqual(start_business.date(), test_date_aware.date())
        self.assertEqual(end_business.date(), test_date_aware.date())

    def test_get_business_date(self):
        """Test getting business date from UTC datetime"""
        business_tz = get_business_timezone()
        
        # Create a UTC datetime that might be on a different day in business timezone
        utc_time = datetime(2024, 3, 15, 23, 30, tzinfo=pytz.UTC)  # 11:30 PM UTC
        
        # Convert to business timezone
        business_time = convert_to_business_timezone(utc_time)
        expected_date = business_time.date()
        
        # Test our utility function
        result_date = get_business_date(utc_time)
        
        self.assertEqual(result_date, expected_date)

    def test_midnight_edge_cases(self):
        """Test movie nights created near midnight"""
        # Create a movie night at 10:00 AM in business timezone
        business_tz = get_business_timezone()
        morning_time = business_tz.localize(datetime(2024, 3, 15, 10, 0))
        
        # Create the movie night
        night_data = {
            'host': self.user.username,
            'night_date': morning_time.astimezone(pytz.UTC).isoformat(),
            'location': 'Morning Location'
        }
        
        response = self.client.post('/movies/newNight/', night_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Try to create another night at 23:45 the same day (should fail - same calendar day)
        late_night = business_tz.localize(datetime(2024, 3, 15, 23, 45))
        
        night_data2 = {
            'host': self.user.username,
            'night_date': late_night.astimezone(pytz.UTC).isoformat(),
            'location': 'Late Night Location'
        }
        
        response2 = self.client.post('/movies/newNight/', night_data2, format='json')
        self.assertEqual(response2.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('already exists', json.loads(response2.content)['error'])

    def test_consistent_get_post_behavior(self):
        """Test that GET and POST methods use consistent day boundaries"""
        business_tz = get_business_timezone()
        test_datetime = business_tz.localize(datetime(2024, 3, 15, 14, 30))
        
        # Create a movie night
        night_data = {
            'host': self.user.username,
            'night_date': test_datetime.astimezone(pytz.UTC).isoformat(),
            'location': 'Test Location'
        }
        
        response = self.client.post('/movies/newNight/', night_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Query for the same date using GET
        get_response = self.client.get('/movies/newNight/', {
            'date': test_datetime.astimezone(pytz.UTC).isoformat()
        })
        
        self.assertEqual(get_response.status_code, status.HTTP_200_OK)
        data = json.loads(get_response.content)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['location'], 'Test Location')

    def test_business_timezone_configuration(self):
        """Test that business timezone is properly configured"""
        business_tz = get_business_timezone()
        self.assertEqual(str(business_tz), 'Europe/Warsaw')

    def test_none_handling(self):
        """Test that timezone functions handle None values properly"""
        self.assertIsNone(convert_to_business_timezone(None))
        self.assertIsNone(get_business_date(None)) 