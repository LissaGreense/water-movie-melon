import datetime
import json
from random import choice

from dateutil import parser
from django.contrib.auth import login, authenticate, logout
from django.core import serializers
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.core.serializers.json import DjangoJSONEncoder
from django.db import IntegrityError
from django.db.models import Avg
from django.http import HttpResponse
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from django_ratelimit.decorators import ratelimit
from rest_framework import permissions
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.views import APIView

from watermoviemelon.query_search import get_query
from .models import Movie, Rate, MovieNight, Attendees, User, RegisterQuestion


class MoviesObject(APIView):
    authentication_classes = (SessionAuthentication,)
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request, format=None):
        movies = Movie.objects.all()
        watched = request.GET.get('watched', None)
        random = request.GET.get('random', None)
        limit = request.GET.get('limit', None)
        search = request.GET.get('search', None)
        order_by = request.GET.get('orderBy[type]', None)

        print(request.GET)
        print(order_by)

        if watched and watched.lower() == 'false':
            movies = movies.filter(watched_movie__isnull=True)
        elif watched and watched.lower() == 'true':
            movies = movies.filter(watched_movie__isnull=False)
        if len(movies) == 0:
            return HttpResponse(json.dumps([], cls=DjangoJSONEncoder), content_type='application/json')

        if random:
            movies = movies.order_by('?')

        if limit:
            limit = int(limit)
            movies = movies[:limit]

        if search:
            search_query = get_query(search, ['title', 'user', 'genre'])
            movies = movies.filter(search_query)

        if order_by:
            order_field = None
            if order_by == 'Tytuł':
                order_field = 'title'
            elif order_by == 'Data dodania':
                order_field = 'date_added'
            elif order_by == 'Czas trwania':
                order_field = 'date_added'
            order_ascending = request.GET.get('orderBy[ascending]', None)

            if order_ascending and order_ascending.lower() == 'false':
                order_field = '-' + order_field

            movies = movies.order_by(order_field)

        serialized_movies = serializers.serialize('python', movies)
        movies_field = [d['fields'] for d in serialized_movies]

        return HttpResponse(json.dumps(movies_field, cls=DjangoJSONEncoder), content_type='application/json')

    def post(self, request, format=None):
        movie_from_body = request.data
        user = User.objects.get(username=movie_from_body['user'])

        if user.tickets > 0:
            user.tickets -= 1
        else:
            return HttpResponse(json.dumps({'error': 'not enough tickets'}), content_type='application/json',
                                status=402)

        try:
            new_movie = Movie(**movie_from_body)
        except TypeError:
            return HttpResponse(json.dumps({'error': 'out of field'}), content_type='application/json', status=400)

        user.save()
        new_movie.save()

        return HttpResponse(json.dumps({'result': 'OK'}), content_type='application/json')


class AverageRatings(APIView):
    def get(self, request, format=None):
        all_movies = Movie.objects.all()
        average_ratings_response = []

        for movie in all_movies:
            average_rating = Rate.objects.filter(movie=movie).aggregate(Avg('rating'))['rating__avg']
            if average_rating:
                rating_response = {
                    'movie': serializers.serialize('python', [movie, ])[0]['fields'],
                    'average_rating': average_rating
                }
                average_ratings_response.append(rating_response)

        return HttpResponse(json.dumps(average_ratings_response, cls=DjangoJSONEncoder),
                            content_type='application/json')


class RateAPI(APIView):
    authentication_classes = (SessionAuthentication,)
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request, format=None):
        all_ratings = serializers.serialize('python', Rate.objects.all())
        ratings_response = []

        for rating in all_ratings:
            rating_fields = rating['fields']
            movie = Movie.objects.get(pk=rating_fields['movie'])
            user_object = User.objects.get(pk=rating_fields['user'])
            user = user_object.username
            rating = rating_fields['rating']

            rating_response = {
                "movie": serializers.serialize('python', [movie, ])[0]['fields'],
                "user": user,
                "rating": rating,
            }
            ratings_response.append(rating_response)

        return HttpResponse(json.dumps(ratings_response, cls=DjangoJSONEncoder), content_type='application/json')

    def post(self, request, format=None):
        rate_from_body = request.data
        movie = Movie.objects.get(title=rate_from_body['movie'])
        user = User.objects.get(username=rate_from_body['user'])
        rating = rate_from_body['rating']

        try:
            new_rate = Rate(movie=movie, user=user, rating=rating)
        except TypeError:
            return HttpResponse(json.dumps({'error': 'out of field'}), content_type='application/json', status=400)

        new_rate.save()

        return HttpResponse(json.dumps({'result': 'OK'}), content_type='application/json')


class Night(APIView):
    authentication_classes = (SessionAuthentication,)
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        date = request.GET.get('date', None)

        if date:
            parsed_date = parser.parse(date)
            movie_night = MovieNight.objects.get(night_date__date=parsed_date)

            if movie_night.selected_movie:
                selected_movie = serializers.serialize('python', [movie_night.selected_movie, ])[0]['fields']
            else:
                selected_movie = None

            nights_response = {
                "host": movie_night.host,
                "night_date": date,
                "location": movie_night.location,
                "selected_movie": selected_movie,
            }
            return HttpResponse(json.dumps([nights_response], cls=DjangoJSONEncoder), content_type='application/json')
        else:
            all_nights = serializers.serialize('python', MovieNight.objects.all())

        night_field = [d['fields'] for d in all_nights]

        return HttpResponse(json.dumps(night_field, cls=DjangoJSONEncoder), content_type='application/json')

    def post(self, request, format=None):
        night_from_body = request.data
        user = User.objects.get(username=night_from_body['host'])

        try:
            night_date = parse_datetime(night_from_body.get('night_date'))
            if MovieNight.objects.filter(night_date__date=night_date.date()).exists():
                return HttpResponse(json.dumps({'error': 'A MovieNight already exists for this date.'}), status=400)

            new_movie_night = MovieNight(**night_from_body)
        except TypeError:
            return HttpResponse(json.dumps({'error': 'out of field'}), content_type='application/json', status=400)

        new_movie_night.save()

        try:
            new_attendee = Attendees(night=new_movie_night, user=user, accept_date=datetime.datetime.now())
            new_attendee.save()
        except TypeError:
            return HttpResponse(json.dumps({'error': 'out of field'}), content_type='application/json', status=400)

        user.tickets += 2
        user.save()

        return HttpResponse(json.dumps({'result': 'OK'}), content_type='application/json')


class AttendeesView(APIView):
    authentication_classes = (SessionAuthentication,)
    permission_classes = [IsAuthenticated]

    def get(self, request):
        all_attendees = serializers.serialize('python', Attendees.objects.all())

        attendees_response = []

        for attendee in all_attendees:
            attendee_fields = attendee["fields"]
            accept_date = attendee_fields["accept_date"]
            night = MovieNight.objects.get(pk=attendee_fields['night'])
            user = User.objects.get(pk=attendee_fields['user'])

            attendee_response = {
                "accept_date": accept_date,
                "night": serializers.serialize('python', [night, ])[0]['fields'],
                "user": serializers.serialize('python', [user, ])[0]['fields']['username']
            }

            attendees_response.append(attendee_response)

        return HttpResponse(json.dumps(attendees_response, cls=DjangoJSONEncoder), content_type='application/json')

    def post(self, request, format=None):
        attendee_from_body = request.data
        night_date = parser.parse(attendee_from_body['night']['night_date'])

        night = MovieNight.objects.get(night_date__date=night_date)
        user = User.objects.get(username=attendee_from_body['user'])
        accept_date = attendee_from_body['accept_date']

        try:
            new_attendee = Attendees(night=night, user=user, accept_date=accept_date)
            new_attendee.save()
        except TypeError:
            return HttpResponse(json.dumps({'error': 'out of field'}), content_type='application/json', status=400)

        user.tickets += 1
        user.save()

        return HttpResponse(json.dumps({'result': 'OK'}), content_type='application/json')


class Login(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return HttpResponse({'error': 'Username and password are required.'}, status=400)

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return HttpResponse({'message': 'Login successful'}, status=200)
        else:
            return HttpResponse(json.dumps({'error': 'Invalid credentials'}), content_type='application/json',
                                status=401)


class Logout(APIView):
    authentication_classes = [SessionAuthentication]

    def post(self, request):
        logout(request)
        return HttpResponse({'message': 'Logout successful'}, status=200)


class Avatar(APIView):
    authentication_classes = (SessionAuthentication,)
    permission_classes = [IsAuthenticated]

    def get(self, request, username, format=None):
        try:
            user = User.objects.get(username=username)

            if not user.avatar or not hasattr(user.avatar, 'url'):
                return HttpResponse(json.dumps({'avatar_url': ''}))

            avatar_url = user.avatar.url
            return HttpResponse(json.dumps({'avatar_url': avatar_url}))

        except User.DoesNotExist:
            return HttpResponse(json.dumps({'error': 'User not found'}), status=404)

    def post(self, request, username, format=None):
        user = User.objects.get(username=username)
        new_avatar = request.FILES["avatar"]

        old_avatar_path = None
        if user.avatar and hasattr(user.avatar, 'url'):
            old_avatar_path = user.avatar.path

        new_avatar_path = default_storage.save(new_avatar.name, ContentFile(new_avatar.read()))
        user.avatar = new_avatar_path
        user.save()

        if old_avatar_path:
            default_storage.delete(old_avatar_path)

        return HttpResponse(json.dumps({'result': 'OK'}), content_type='application/json')


class UserStatistics(APIView):
    authentication_classes = (SessionAuthentication,)
    permission_classes = [IsAuthenticated]

    def get(self, request, username, format=None):
        try:
            user = User.objects.get(username=username)

            current_date = timezone.now().date()
            hosted_nights = MovieNight.objects.filter(host=username, night_date__lte=current_date).count()

            movies_with_avg_ratings = Movie.objects.filter(user=username).annotate(
                avg_rating=Avg('rate__rating')
            ).exclude(
                avg_rating=None
            ).order_by('-avg_rating')

            seven_rated_movies = Movie.objects.filter(user=username).annotate(
                avg_rating=Avg('rate__rating')
            ).filter(
                avg_rating__gte=7
            ).count()

            statistics = {
                'added_movies': Movie.objects.filter(user=username).count(),
                'seven_rated_movies': seven_rated_movies,
                'watched_movies': Attendees.objects.filter(user=user.id).count() + hosted_nights,
                'hosted_movie_nights': hosted_nights,
                'highest_rated_movie': movies_with_avg_ratings.first().title if len(
                    movies_with_avg_ratings) > 0 else None,
                'lowest_rated_movie': movies_with_avg_ratings.last().title if len(
                    movies_with_avg_ratings) > 0 else None,
                'movie_tickets': user.tickets
            }
            return HttpResponse(json.dumps(statistics))

        except User.DoesNotExist:
            return HttpResponse(json.dumps({'error': 'User not found'}), status=404)


@ratelimit(key='ip', rate='3/d')
def user_register(request):
    if request.method == 'POST':
        user_data = request.data
        question = RegisterQuestion.objects.get(day=datetime.datetime.today().weekday())

        if user_data['answer'].strip().lower() == question.answer.strip().lower():
            try:
                user = User.objects.create_user(username=user_data["username"], password=user_data["password"])
                user.save()

                return HttpResponse(json.dumps({'result': 'OK'}), content_type='application/json')
            except IntegrityError:
                return HttpResponse(json.dumps({'error': 'USER ALREADY EXISTS'}), status=400)
        else:
            return HttpResponse(json.dumps({'error': 'BAD ANSWER'}), content_type='application/json', status=400)
    else:
        return HttpResponse(json.dumps({'error': 'Only POST method is allowed'}), status=405)


class UserPassword(APIView):
    authentication_classes = (SessionAuthentication,)
    permission_classes = [IsAuthenticated]

    def post(self, request, username):
        try:
            user = User.objects.get(username=username)
            password_data = request.data

            if not user.check_password(password_data['old_password']):
                return HttpResponse(json.dumps({'error': 'Wrong password provided'}), status=400)

            user.set_password(password_data['new_password'])
            user.save()

            return HttpResponse(json.dumps({'result': 'OK'}))

        except User.DoesNotExist:
            return HttpResponse(json.dumps({'error': 'User not found'}), status=404)


class RegisterQuestions(APIView):
    def get(self, request, format=None):
        question = RegisterQuestion.objects.get(day=datetime.datetime.today().weekday())

        return HttpResponse(json.dumps({"question": question.question}), content_type='application/json')


class RandMovie(APIView):
    def get(self, request, format=None):
        upcoming_nights = MovieNight.objects.filter(selected_movie__isnull=True).order_by('night_date')
        if len(upcoming_nights) == 0:
            return HttpResponse(json.dumps([], cls=DjangoJSONEncoder), content_type='application/json')

        next_night = upcoming_nights[0]
        if timezone.now() < next_night.night_date - datetime.timedelta(seconds=10):
            return HttpResponse(json.dumps({'error': 'Too soon, try again later'}), status=425)

        movies_not_watched = Movie.objects.filter(watched_movie=None)

        if len(movies_not_watched) == 0:
            return HttpResponse(json.dumps([], cls=DjangoJSONEncoder), content_type='application/json')

        selected_movie = choice(movies_not_watched)
        next_night.selected_movie = selected_movie
        next_night.save()

        selected_movie_response = {
            'title': selected_movie.title,
            'link': selected_movie.link,
            'user': selected_movie.user,
            'date_added': selected_movie.date_added,
            'genre': selected_movie.genre,
            'cover_link': selected_movie.cover_link,
            'duration': selected_movie.duration,
        }

        return HttpResponse(json.dumps(selected_movie_response, cls=DjangoJSONEncoder), content_type='application/json')


class MovieDate(APIView):
    def get(self, request, format=None):
        now = datetime.datetime.now()
        upcoming_nights = MovieNight.objects.filter(selected_movie__isnull=True, night_date__gt=now).order_by(
            'night_date')

        if len(upcoming_nights) == 0:
            return HttpResponse(json.dumps([], cls=DjangoJSONEncoder), content_type='application/json')

        next_night = upcoming_nights[0]
        next_night_date = next_night.night_date

        return HttpResponse(json.dumps(next_night_date, cls=DjangoJSONEncoder), content_type='application/json')


class UpcomingNights(APIView):
    def get(self, request, format=None):
        upcoming_night = MovieNight.objects.filter(selected_movie__isnull=True).order_by('night_date')

        if len(upcoming_night) != 0:
            return HttpResponse(json.dumps(True, cls=DjangoJSONEncoder), content_type='application/json')

        return HttpResponse(json.dumps(False, cls=DjangoJSONEncoder), content_type='application/json')
