"""
Migration: Add new fields to Faculty and TimeTable for Faculty Locator v2.
"""
import uuid
import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tracking', '0002_faculty_manual_location_and_more'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # ─── Faculty new fields ─────────────────────────────────────
        migrations.AddField(
            model_name='faculty',
            name='unique_id',
            field=models.UUIDField(default=uuid.uuid4, editable=False, unique=True),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='faculty',
            name='qualification',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
        migrations.AddField(
            model_name='faculty',
            name='specialization',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
        migrations.AddField(
            model_name='faculty',
            name='cabin_number',
            field=models.CharField(blank=True, default='', max_length=100),
        ),
        migrations.AddField(
            model_name='faculty',
            name='contact',
            field=models.CharField(blank=True, default='', max_length=20),
        ),
        migrations.AddField(
            model_name='faculty',
            name='photo',
            field=models.ImageField(blank=True, null=True, upload_to='faculty_photos/'),
        ),
        migrations.AddField(
            model_name='faculty',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='faculty',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
        # Make designation and department allow blank
        migrations.AlterField(
            model_name='faculty',
            name='designation',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
        migrations.AlterField(
            model_name='faculty',
            name='department',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
        migrations.AlterField(
            model_name='faculty',
            name='default_cabin',
            field=models.CharField(blank=True, default='', max_length=100),
        ),
        # ─── TimeTable new fields ───────────────────────────────────
        migrations.AddField(
            model_name='timetable',
            name='subject',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
        migrations.AddField(
            model_name='timetable',
            name='course',
            field=models.CharField(blank=True, default='', max_length=100),
        ),
        migrations.AddField(
            model_name='timetable',
            name='year',
            field=models.CharField(blank=True, default='', max_length=20),
        ),
        migrations.AddField(
            model_name='timetable',
            name='semester',
            field=models.CharField(blank=True, default='', max_length=20),
        ),
        migrations.AddField(
            model_name='timetable',
            name='branch',
            field=models.CharField(blank=True, default='', max_length=100),
        ),
        migrations.AddField(
            model_name='timetable',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        # Update day choices (remove Sunday)
        migrations.AlterField(
            model_name='timetable',
            name='day_of_week',
            field=models.IntegerField(choices=[
                (0, 'Monday'), (1, 'Tuesday'), (2, 'Wednesday'),
                (3, 'Thursday'), (4, 'Friday'), (5, 'Saturday'),
            ]),
        ),
        # Add new index
        migrations.AddIndex(
            model_name='timetable',
            index=models.Index(fields=['faculty', 'day_of_week'], name='tracking_ti_faculty_dow_idx'),
        ),
        # Update ordering
        migrations.AlterModelOptions(
            name='faculty',
            options={'ordering': ['name'], 'verbose_name_plural': 'Faculty'},
        ),
        migrations.AlterModelOptions(
            name='timetable',
            options={'ordering': ['day_of_week', 'start_time']},
        ),
    ]
