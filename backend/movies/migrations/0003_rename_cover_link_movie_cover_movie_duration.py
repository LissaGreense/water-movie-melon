# Generated by Django 5.0.3 on 2024-04-14 19:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('movies', '0002_rename_cover_movie_cover_link_remove_movie_duration'),
    ]

    operations = [
        migrations.RenameField(
            model_name='movie',
            old_name='cover_link',
            new_name='cover',
        ),
        migrations.AddField(
            model_name='movie',
            name='duration',
            field=models.IntegerField(default=None),
            preserve_default=False,
        ),
    ]
