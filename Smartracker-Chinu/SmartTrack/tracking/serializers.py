from rest_framework import serializers
from .models import Faculty, TimeTable
from django.utils import timezone


class FacultySerializer(serializers.ModelSerializer):
    """Full faculty profile serializer."""
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = Faculty
        fields = [
            'id', 'unique_id', 'name', 'bio', 'designation', 'department',
            'qualification', 'specialization', 'cabin_number', 'contact',
            'default_cabin', 'photo_url', 'manual_override_active', 'manual_location',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'unique_id', 'created_at', 'updated_at']

    def get_photo_url(self, obj):
        request = self.context.get('request')
        if obj.photo and request:
            return request.build_absolute_uri(obj.photo.url)
        if obj.photo:
            return obj.photo.url
        return None


class TimetableSerializer(serializers.ModelSerializer):
    """Timetable entry serializer with faculty name for display."""
    faculty_name = serializers.CharField(source='faculty.name', read_only=True)
    day_name = serializers.CharField(source='get_day_of_week_display', read_only=True)

    class Meta:
        model = TimeTable
        fields = [
            'id', 'faculty', 'faculty_name', 'day_of_week', 'day_name',
            'start_time', 'end_time', 'room_number',
            'subject', 'course', 'year', 'semester', 'branch',
            'created_at'
        ]
        read_only_fields = ['id', 'faculty_name', 'day_name', 'created_at']

    def validate(self, data):
        """Validate that there's no time overlap for the same faculty on the same day."""
        faculty = data.get('faculty')
        day = data.get('day_of_week')
        start = data.get('start_time')
        end = data.get('end_time')
        instance_id = self.instance.id if self.instance else None

        if start and end and start >= end:
            raise serializers.ValidationError("End time must be after start time.")

        if faculty and day is not None and start and end:
            overlapping = TimeTable.objects.filter(
                faculty=faculty,
                day_of_week=day,
                start_time__lt=end,
                end_time__gt=start,
            )
            if instance_id:
                overlapping = overlapping.exclude(id=instance_id)
            if overlapping.exists():
                raise serializers.ValidationError(
                    f"Time overlap detected for {faculty.name} on {dict(TimeTable.DAY_CHOICES)[day]}."
                )
        return data


class FacultyLiveStatusSerializer(serializers.ModelSerializer):
    """Serializer for live faculty status on the 3D map."""
    current_location = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    is_in_class = serializers.SerializerMethodField()
    is_overridden = serializers.BooleanField(source='manual_override_active', read_only=True)
    is_predicted = serializers.SerializerMethodField()
    photo_url = serializers.SerializerMethodField()
    active_class_info = serializers.SerializerMethodField()

    class Meta:
        model = Faculty
        fields = [
            'id', 'name', 'designation', 'department', 'qualification',
            'specialization', 'cabin_number', 'default_cabin',
            'photo_url', 'current_location', 'status',
            'is_in_class', 'is_overridden', 'is_predicted', 'active_class_info'
        ]

    def get_photo_url(self, obj):
        request = self.context.get('request')
        if obj.photo and request:
            return request.build_absolute_uri(obj.photo.url)
        return None

    def get_current_location(self, obj):
        if obj.manual_override_active:
            return obj.manual_location or obj.cabin_number or obj.default_cabin
        active_class = getattr(obj, 'active_class', None)
        if active_class:
            return active_class.room_number
        return obj.cabin_number or obj.default_cabin or 'Unknown'

    def get_status(self, obj):
        if obj.manual_override_active:
            return 'overridden'
        active_class = getattr(obj, 'active_class', None)
        if active_class:
            return 'in_class'
        # Check if they have any schedule today
        day = timezone.localtime().weekday()
        has_schedule_today = TimeTable.objects.filter(
            faculty=obj, day_of_week=day
        ).exists()
        if has_schedule_today:
            return 'free'
        return 'not_scheduled'

    def get_is_in_class(self, obj):
        if obj.manual_override_active:
            return False
        return getattr(obj, 'active_class', None) is not None

    def get_is_predicted(self, obj):
        if obj.manual_override_active or getattr(obj, 'active_class', None):
            return False
        return False  # True when ML prediction is used

    def get_active_class_info(self, obj):
        active_class = getattr(obj, 'active_class', None)
        if not active_class:
            return None
        return {
            'room': active_class.room_number,
            'subject': active_class.subject,
            'course': active_class.course,
            'year': active_class.year,
            'semester': active_class.semester,
            'branch': active_class.branch,
            'start_time': active_class.start_time.strftime('%H:%M'),
            'end_time': active_class.end_time.strftime('%H:%M'),
        }
