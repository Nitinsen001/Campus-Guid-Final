from django.db import models
from django.contrib.auth.models import User
import uuid


class Faculty(models.Model):
    """Faculty member profile model."""
    unique_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=255)
    bio = models.TextField(blank=True, null=True)
    designation = models.CharField(max_length=255, blank=True, default='')
    department = models.CharField(max_length=255, blank=True, default='')
    qualification = models.CharField(max_length=255, blank=True, default='')
    specialization = models.CharField(max_length=255, blank=True, default='')
    cabin_number = models.CharField(max_length=100, blank=True, default='')
    contact = models.CharField(max_length=20, blank=True, default='')
    photo = models.ImageField(upload_to='faculty_photos/', blank=True, null=True)

    # Keep default_cabin for backward compatibility
    default_cabin = models.CharField(max_length=100, blank=True, default='')

    # Manual Override fields
    manual_override_active = models.BooleanField(default=False)
    manual_location = models.CharField(max_length=100, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Faculty"
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.department})"

    @property
    def photo_url(self):
        if self.photo:
            return self.photo.url
        return None


class TimeTable(models.Model):
    """Timetable entry for a faculty member."""
    DAY_CHOICES = [
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
    ]

    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE, related_name='timetables')
    day_of_week = models.IntegerField(choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    room_number = models.CharField(max_length=100)
    subject = models.CharField(max_length=255, blank=True, default='')
    course = models.CharField(max_length=100, blank=True, default='')
    year = models.CharField(max_length=20, blank=True, default='')
    semester = models.CharField(max_length=20, blank=True, default='')
    branch = models.CharField(max_length=100, blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['day_of_week', 'start_time']
        indexes = [
            models.Index(fields=['day_of_week', 'start_time', 'end_time']),
            models.Index(fields=['faculty', 'day_of_week']),
        ]

    def __str__(self):
        return (f"{self.faculty.name} — {self.get_day_of_week_display()} "
                f"{self.start_time.strftime('%H:%M')}-{self.end_time.strftime('%H:%M')} "
                f"Room {self.room_number}")
