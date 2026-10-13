from django.contrib import admin
from django.utils.html import format_html
from .models import Faculty, TimeTable


class TimeTableInline(admin.TabularInline):
    model = TimeTable
    extra = 1
    fields = ['day_of_week', 'start_time', 'end_time', 'room_number', 'subject', 'course', 'year', 'semester', 'branch']


@admin.register(Faculty)
class FacultyAdmin(admin.ModelAdmin):
    list_display = ['name', 'department', 'designation', 'cabin_number', 'contact', 'photo_preview']
    list_filter = ['department', 'designation']
    search_fields = ['name', 'department', 'specialization']
    readonly_fields = ['unique_id', 'photo_preview', 'created_at', 'updated_at']
    inlines = [TimeTableInline]
    fieldsets = (
        ('Basic Info', {
            'fields': ('unique_id', 'name', 'designation', 'department', 'bio')
        }),
        ('Qualifications', {
            'fields': ('qualification', 'specialization')
        }),
        ('Contact & Location', {
            'fields': ('cabin_number', 'contact', 'default_cabin')
        }),
        ('Photo', {
            'fields': ('photo', 'photo_preview')
        }),
        ('Override', {
            'fields': ('manual_override_active', 'manual_location')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def photo_preview(self, obj):
        if obj.photo:
            return format_html('<img src="{}" style="height:50px;width:50px;object-fit:cover;border-radius:50%">', obj.photo.url)
        return "No photo"
    photo_preview.short_description = "Photo"


@admin.register(TimeTable)
class TimeTableAdmin(admin.ModelAdmin):
    list_display = ['faculty', 'day_of_week', 'start_time', 'end_time', 'room_number', 'subject', 'course', 'year', 'semester', 'branch']
    list_filter = ['day_of_week', 'course', 'branch', 'faculty']
    search_fields = ['faculty__name', 'room_number', 'subject']
    list_select_related = ['faculty']
