# Generated by Django 5.0.3 on 2024-04-26 20:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('movies', '0008_attendees_attendees_unique_night_user_attendee'),
    ]

    operations = [
        migrations.AddField(
            model_name='movie',
            name='cover_link',
            field=models.CharField(default='', max_length=150),
        ),
        migrations.AddField(
            model_name='movie',
            name='duration',
            field=models.IntegerField(default=1),
        ),
        migrations.AddField(
            model_name='movie',
            name='is_watched',
            field=models.BooleanField(default=False),
        ),
    ]