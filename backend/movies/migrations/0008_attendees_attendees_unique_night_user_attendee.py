# Generated by Django 5.0.2 on 2024-04-14 21:07

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('movies', '0007_remove_movie_cover_link_remove_movie_duration'),
    ]

    operations = [
        migrations.CreateModel(
            name='Attendees',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('accept_date', models.DateTimeField(verbose_name='accept_date')),
                ('night', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='movies.movienight')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddConstraint(
            model_name='attendees',
            constraint=models.UniqueConstraint(fields=('night', 'user'), name='unique_night_user_attendee'),
        ),
    ]