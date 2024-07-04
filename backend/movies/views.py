import datetime

from django.core.serializers.json import DjangoJSONEncoder
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from django.http import HttpResponse
from django.core import serializers
import json

from django.views.decorators.csrf import csrf_exempt

from .models import Movie, Rate, MovieNight, Attendees, User


# TODO: to remove, only for debugging purpose
@csrf_exempt
def index(request):
    if request.method == 'GET':
        all_movies = serializers.serialize('python', Movie.objects.all())
        movies_field = [d['fields'] for d in all_movies]

        return HttpResponse(json.dumps(movies_field, cls=DjangoJSONEncoder), content_type='application/json')

    elif request.method == 'POST':
        movie_from_body = json.loads(request.body)
        try:
            new_movie = Movie(**movie_from_body)
        except TypeError:
            return HttpResponse(json.dumps({'error': 'out of field'}), content_type='application/json', status=400)

        new_movie.save()

        return HttpResponse(json.dumps({'result': 'OK'}), content_type='application/json')


@csrf_exempt
def rate(request):
    if request.method == 'GET':
        all_ratings = serializers.serialize('python', Rate.objects.all())
        rating_field = [d['fields'] for d in all_ratings]

        return HttpResponse(json.dumps(rating_field, cls=DjangoJSONEncoder), content_type='application/json')

    elif request.method == 'POST':
        rate_from_body = json.loads(request.body)
        movie = Movie.objects.get(title=rate_from_body['movie']['title'])
        user = User.objects.get(username=rate_from_body['user'])
        rating = rate_from_body['rating']
        try:
            new_rate = Rate(movie=movie, user=user, rating=rating)
        except TypeError:
            return HttpResponse(json.dumps({'error': 'out of field'}), content_type='application/json', status=400)

        new_rate.save()
        return HttpResponse(json.dumps({'result': 'OK'}), content_type='application/json')


@csrf_exempt
def new_night(request):
    if request.method == 'GET':
        date = request.GET.get('date', None)
        if date:
            parsed_date = datetime.datetime.strptime(date, "%d.%m.%Y")
            all_nights = serializers.serialize('python', MovieNight.objects.filter(night_date__date=parsed_date))
        else:
            all_nights = serializers.serialize('python', MovieNight.objects.all())
        night_field = [d['fields'] for d in all_nights]
        return HttpResponse(json.dumps(night_field, cls=DjangoJSONEncoder), content_type='application/json')
    elif request.method == 'POST':
        night_from_body = json.loads(request.body)
        try:
            new_movie_night = MovieNight(**night_from_body)
        except TypeError:
            return HttpResponse(json.dumps({'error': 'out of field'}), content_type='application/json', status=400)

        new_movie_night.save()
        return HttpResponse(json.dumps({'result': 'OK'}), content_type='application/json')


@csrf_exempt
def attendees(request):
    if request.method == 'GET':
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

    elif request.method == 'POST':
        attendee_from_body = json.loads(request.body)
        night = MovieNight.objects.get(night_date=attendee_from_body['night']['night_date'])
        user = User.objects.get(username=attendee_from_body['user'])
        accept_date = attendee_from_body['accept_date']
        try:
            new_attendee = Attendees(night=night, user=user, accept_date=accept_date)
        except TypeError:
            return HttpResponse(json.dumps({'error': 'out of field'}), content_type='application/json', status=400)

        new_attendee.save()
        return HttpResponse(json.dumps({'result': 'OK'}), content_type='application/json')


@csrf_exempt
def login_user(request):
    if request.method == 'POST':
        user_data = json.loads(request.body)
        username = user_data["username"]
        password = user_data["password"]

        user = authenticate(request, username=username, password=password)

        if user is not None:
            token, created = Token.objects.get_or_create(user=user)

            return HttpResponse(json.dumps({'token': token.key}), content_type='application/json')

        return HttpResponse(json.dumps({'error': 'Invalid credentials'}), content_type='application/json', status=401)

@csrf_exempt
def user_avatar(request, username):
    if request.method == 'GET':
        try:
            user = User.objects.get(username=username)
            avatar_url = user.avatar.url

            return HttpResponse(json.dumps({'avatar_url': avatar_url}))
        except User.DoesNotExist:
            return HttpResponse(json.dumps({'error': 'User not found'}), status=404)
    elif request.method == 'POST':
        user = User.objects.get(username=username)
        new_avatar = request.FILES["avatar"]
        old_avatar_path = user.avatar.path

        new_avatar_path = default_storage.save(new_avatar.name, ContentFile(new_avatar.read()))
        user.avatar = new_avatar_path
        user.save()

        default_storage.delete(old_avatar_path)
        return HttpResponse(json.dumps({'result': 'OK'}), content_type='application/json')

    else:
        return HttpResponse(json.dumps({'error': 'Only GET method is allowed'}), status=405)
