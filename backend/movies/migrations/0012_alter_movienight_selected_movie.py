# Generated by Django 5.0.3 on 2024-08-08 22:04

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('movies', '0011_remove_movie_is_watched'),
    ]

    operations = [
        migrations.AlterField(
            model_name='movienight',
            name='selected_movie',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='watched_movie', to='movies.movie'),
        ),
    ]
