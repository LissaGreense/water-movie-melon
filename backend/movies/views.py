from django.core.serializers.json import DjangoJSONEncoder
from django.http import HttpResponse
from django.core import serializers
import json

from django.views.decorators.csrf import csrf_exempt

from .models import Movie, Rate


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

        try:
            new_movie = Movie(**rate_from_body)
        except TypeError:
            return HttpResponse(json.dumps({'error': 'out of field'}), content_type='application/json', status=400)

        new_movie.save()
        return HttpResponse(json.dumps({'result': 'OK'}), content_type='application/json')
