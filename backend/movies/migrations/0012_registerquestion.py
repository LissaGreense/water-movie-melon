# Generated by Django 5.0.2 on 2024-08-08 21:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('movies', '0011_remove_movie_is_watched'),
    ]

    operations = [
        migrations.CreateModel(
            name='RegisterQuestion',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('question', models.CharField(max_length=150)),
                ('answer', models.CharField(max_length=100)),
                ('day', models.CharField(choices=[('1', 'Monday'), ('2', 'Tuesday'), ('3', 'Wednesday'), ('4', 'Thursday'), ('5', 'Friday'), ('6', 'Saturday'), ('7', 'Sunday')], max_length=2, unique=True)),
            ],
        ),
    ]
