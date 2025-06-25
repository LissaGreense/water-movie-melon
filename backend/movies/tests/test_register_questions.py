import datetime
from rest_framework import status
from rest_framework.test import APITestCase
from ..models import RegisterQuestion

class RegisterQuestionsAPITest(APITestCase):

    def setUp(self):
        self.url = '/movies/registerQuestion/'
        # The model stores weekday as a string "1" (Monday) to "7" (Sunday)
        today_weekday_model_format = str(datetime.datetime.today().weekday() + 1)
        self.question_text = "What is the airspeed velocity of an unladen swallow?"
        
        RegisterQuestion.objects.create(
            day=today_weekday_model_format,
            question=self.question_text,
            answer="What do you mean? An African or European swallow?"
        )

    def test_get_question_for_current_day(self):
        """
        Tests that the correct question is retrieved for the current day.
        """
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), {"question": self.question_text})

    def test_no_question_for_current_day(self):
        """
        Tests that a 500 error is returned if no question is set for the current day.
        """
        # Delete the question created in setUp
        RegisterQuestion.objects.all().delete()
        
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR) 