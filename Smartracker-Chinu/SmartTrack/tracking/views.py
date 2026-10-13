"""
SmartTrack Faculty Locator — All API Views and Admin Panel Views
"""
import json
import csv
import io
from urllib.parse import urlsplit
from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse, HttpResponse
from django.core.exceptions import ImproperlyConfigured
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.clickjacking import xframe_options_exempt
from django.views.decorators.http import require_http_methods
from django.utils import timezone
from django.db.models import Prefetch, Q, Count
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status as drf_status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

import pandas as pd

from .models import Faculty, TimeTable
from .serializers import FacultySerializer, TimetableSerializer, FacultyLiveStatusSerializer
from .ml_engine.predictor import predict_locations_with_confidence


# ─────────────────────────────────────────────────
# HELPER
# ─────────────────────────────────────────────────
def _get_active_timetable_prefetch():
    now = timezone.localtime()
    current_day = now.weekday()
    current_time = now.time()
    return Prefetch(
        'timetables',
        queryset=TimeTable.objects.filter(
            day_of_week=current_day,
            start_time__lte=current_time,
            end_time__gte=current_time,
        ),
        to_attr='current_classes',
    )


def _annotate_active_class(faculty_qs):
    for faculty in faculty_qs:
        faculty.active_class = faculty.current_classes[0] if faculty.current_classes else None
    return faculty_qs


# ─────────────────────────────────────────────────
# MAIN 3D VIEW
# ─────────────────────────────────────────────────
@xframe_options_exempt
def index(request):
    campus_origin = urlsplit(settings.CAMPUS_APP_ORIGIN)
    if (
        campus_origin.scheme not in ('http', 'https')
        or not campus_origin.netloc
        or campus_origin.username
        or campus_origin.password
        or campus_origin.path not in ('', '/')
        or campus_origin.query
        or campus_origin.fragment
    ):
        raise ImproperlyConfigured('CAMPUS_APP_ORIGIN must be an HTTP(S) origin without a path.')

    response = render(request, 'index.html')
    allowed_origins = [f"{campus_origin.scheme}://{campus_origin.netloc}"]
    loopback_alias = {
        'localhost': '127.0.0.1',
        '127.0.0.1': 'localhost',
    }.get(campus_origin.hostname)
    if loopback_alias:
        alias_netloc = loopback_alias
        if campus_origin.port is not None:
            alias_netloc = f'{alias_netloc}:{campus_origin.port}'
        allowed_origins.append(f'{campus_origin.scheme}://{alias_netloc}')

    response['Content-Security-Policy'] = (
        f"frame-ancestors 'self' {' '.join(allowed_origins)}"
    )
    return response


# ─────────────────────────────────────────────────
# API: LIVE STATUS
# ─────────────────────────────────────────────────
class FacultyLiveStatusView(APIView):
    """Returns current room assignments for all faculty based on day/time."""

    def get(self, request):
        prefetch = _get_active_timetable_prefetch()
        faculties = Faculty.objects.prefetch_related(prefetch).all()
        _annotate_active_class(faculties)
        serializer = FacultyLiveStatusSerializer(faculties, many=True, context={'request': request})
        return Response(serializer.data)


# ─────────────────────────────────────────────────
# API: DASHBOARD STATS
# ─────────────────────────────────────────────────
class StatsView(APIView):
    def get(self, request):
        now = timezone.localtime()
        current_day = now.weekday()
        current_time = now.time()

        total_faculty = Faculty.objects.count()
        total_rooms = TimeTable.objects.values('room_number').distinct().count()
        total_entries = TimeTable.objects.count()
        active_sessions = TimeTable.objects.filter(
            day_of_week=current_day,
            start_time__lte=current_time,
            end_time__gte=current_time,
        ).count()

        return Response({
            'total_faculty': total_faculty,
            'total_rooms': total_rooms,
            'total_entries': total_entries,
            'active_sessions': active_sessions,
            'current_day': now.strftime('%A'),
            'current_time': now.strftime('%H:%M'),
        })


# ─────────────────────────────────────────────────
# API: FACULTY CRUD
# ─────────────────────────────────────────────────
class FacultyListCreateView(APIView):
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        faculties = Faculty.objects.all()
        serializer = FacultySerializer(faculties, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        serializer = FacultySerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=drf_status.HTTP_201_CREATED)
        return Response(serializer.errors, status=drf_status.HTTP_400_BAD_REQUEST)


class FacultyDetailView(APIView):
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request, pk):
        faculty = get_object_or_404(Faculty, pk=pk)
        serializer = FacultySerializer(faculty, context={'request': request})
        return Response(serializer.data)

    def put(self, request, pk):
        faculty = get_object_or_404(Faculty, pk=pk)
        serializer = FacultySerializer(faculty, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=drf_status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        faculty = get_object_or_404(Faculty, pk=pk)
        faculty.delete()
        return Response({'message': 'Faculty deleted.'}, status=drf_status.HTTP_204_NO_CONTENT)


class FacultySearchView(APIView):
    def get(self, request):
        q = request.GET.get('q', '').strip()
        if not q:
            return Response([])
        prefetch = _get_active_timetable_prefetch()
        results = Faculty.objects.prefetch_related(prefetch).filter(
            Q(name__icontains=q) | Q(department__icontains=q) | Q(specialization__icontains=q)
        )[:10]
        _annotate_active_class(results)
        serializer = FacultyLiveStatusSerializer(results, many=True, context={'request': request})
        return Response(serializer.data)


# ─────────────────────────────────────────────────
# API: TIMETABLE CRUD
# ─────────────────────────────────────────────────
class TimetableListCreateView(APIView):
    def get(self, request):
        qs = TimeTable.objects.select_related('faculty').all()
        # Filters
        faculty_id = request.GET.get('faculty')
        day = request.GET.get('day')
        room = request.GET.get('room')
        if faculty_id:
            qs = qs.filter(faculty_id=faculty_id)
        if day is not None:
            qs = qs.filter(day_of_week=day)
        if room:
            qs = qs.filter(room_number__icontains=room)
        serializer = TimetableSerializer(qs, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = TimetableSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=drf_status.HTTP_201_CREATED)
        return Response(serializer.errors, status=drf_status.HTTP_400_BAD_REQUEST)


class TimetableDetailView(APIView):
    def get(self, request, pk):
        entry = get_object_or_404(TimeTable, pk=pk)
        return Response(TimetableSerializer(entry).data)

    def put(self, request, pk):
        entry = get_object_or_404(TimeTable, pk=pk)
        serializer = TimetableSerializer(entry, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=drf_status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        entry = get_object_or_404(TimeTable, pk=pk)
        entry.delete()
        return Response({'message': 'Entry deleted.'}, status=drf_status.HTTP_204_NO_CONTENT)


# ─────────────────────────────────────────────────
# API: EXCEL BULK UPLOAD
# ─────────────────────────────────────────────────
class TimetableUploadView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file = request.FILES.get('file')
        replace = request.data.get('replace', 'false').lower() == 'true'

        if not file:
            return Response({'error': 'No file uploaded.'}, status=drf_status.HTTP_400_BAD_REQUEST)

        if not file.name.endswith(('.xlsx', '.xls')):
            return Response({'error': 'Please upload an Excel file (.xlsx or .xls).'}, status=drf_status.HTTP_400_BAD_REQUEST)

        try:
            df = pd.read_excel(file)
        except Exception as e:
            return Response({'error': f'Failed to read Excel file: {str(e)}'}, status=drf_status.HTTP_400_BAD_REQUEST)

        # Normalize column names — handle different capitalizations/spaces
        df.columns = [str(c).strip().lower().replace(' ', '_') for c in df.columns]

        # Map common column name variants
        col_map = {
            'teacher_guardian': 'faculty_name',
            'teacher': 'faculty_name',
            'faculty': 'faculty_name',
            'faculty_name': 'faculty_name',
            'room_no': 'room_number',
            'room': 'room_number',
            'room_number': 'room_number',
            'day': 'day',
            'time': 'time',
            'subject': 'subject',
            'course': 'course',
            'year': 'year',
            'semester': 'semester',
            'branch': 'branch',
        }
        df.rename(columns=col_map, inplace=True)

        # Validate required columns
        required = ['faculty_name', 'room_number', 'day', 'time']
        missing = [c for c in required if c not in df.columns]
        if missing:
            return Response({
                'error': f'Missing required columns: {missing}. '
                         f'Found columns: {list(df.columns)}'
            }, status=drf_status.HTTP_400_BAD_REQUEST)

        # Day name → integer mapping
        day_map = {
            'monday': 0, 'mon': 0,
            'tuesday': 1, 'tue': 1,
            'wednesday': 2, 'wed': 2,
            'thursday': 3, 'thu': 3,
            'friday': 4, 'fri': 4,
            'saturday': 5, 'sat': 5,
        }

        def parse_day(val):
            v = str(val).strip().lower()
            if v.isdigit():
                return int(v)
            return day_map.get(v, None)

        def parse_time(val):
            """Parse various time formats: '09:00', '9:00-10:00', '9 AM', etc."""
            val = str(val).strip()
            # Handle range like "09:00-10:00" or "9:00 - 10:00"
            if '-' in val:
                parts = val.split('-')
                start_raw = parts[0].strip()
                end_raw = parts[1].strip() if len(parts) > 1 else ''
                return _parse_single_time(start_raw), _parse_single_time(end_raw)
            return _parse_single_time(val), None

        def _parse_single_time(val):
            import datetime
            val = str(val).strip()
            for fmt in ['%H:%M', '%H:%M:%S', '%I:%M %p', '%I %p', '%H.%M']:
                try:
                    return datetime.datetime.strptime(val, fmt).time()
                except ValueError:
                    pass
            return None

        errors = []
        created_count = 0
        skipped_count = 0

        if replace:
            TimeTable.objects.all().delete()

        for idx, row in df.iterrows():
            row_num = idx + 2  # Excel row (1-indexed + header)
            faculty_name = str(row.get('faculty_name', '')).strip()
            room_number = str(row.get('room_number', '')).strip()
            day_raw = row.get('day', '')
            time_raw = row.get('time', '')

            if not faculty_name or faculty_name.lower() in ('nan', ''):
                skipped_count += 1
                continue

            # Get or create faculty
            faculty, _ = Faculty.objects.get_or_create(
                name=faculty_name,
                defaults={'department': '', 'designation': '', 'cabin_number': ''}
            )

            day_int = parse_day(day_raw)
            if day_int is None:
                errors.append(f"Row {row_num}: Invalid day '{day_raw}'")
                continue

            start_time, end_time = parse_time(time_raw)
            if not start_time:
                errors.append(f"Row {row_num}: Cannot parse time '{time_raw}'")
                continue

            if not end_time:
                # Default: 1 hour class
                import datetime
                dt = datetime.datetime.combine(datetime.date.today(), start_time)
                end_time = (dt + datetime.timedelta(hours=1)).time()

            subject = str(row.get('subject', '')).strip() if 'subject' in df.columns else ''
            course = str(row.get('course', '')).strip() if 'course' in df.columns else ''
            year = str(row.get('year', '')).strip() if 'year' in df.columns else ''
            semester = str(row.get('semester', '')).strip() if 'semester' in df.columns else ''
            branch = str(row.get('branch', '')).strip() if 'branch' in df.columns else ''

            # Clean 'nan' strings
            for var_name, var_val in [('subject', subject), ('course', course), ('year', year),
                                       ('semester', semester), ('branch', branch)]:
                if var_val.lower() == 'nan':
                    locals()[var_name] = ''

            subject = '' if subject.lower() == 'nan' else subject
            course = '' if course.lower() == 'nan' else course
            year = '' if year.lower() == 'nan' else year
            semester = '' if semester.lower() == 'nan' else semester
            branch = '' if branch.lower() == 'nan' else branch

            # Check overlap
            overlapping = TimeTable.objects.filter(
                faculty=faculty,
                day_of_week=day_int,
                start_time__lt=end_time,
                end_time__gt=start_time,
            )
            if overlapping.exists() and not replace:
                skipped_count += 1
                errors.append(f"Row {row_num}: Overlap for {faculty_name} on {day_raw}")
                continue

            TimeTable.objects.create(
                faculty=faculty,
                day_of_week=day_int,
                start_time=start_time,
                end_time=end_time,
                room_number=room_number,
                subject=subject,
                course=course,
                year=year,
                semester=semester,
                branch=branch,
            )
            created_count += 1

        return Response({
            'message': f'Upload complete. Created: {created_count}, Skipped: {skipped_count}',
            'created': created_count,
            'skipped': skipped_count,
            'errors': errors[:20],  # Return first 20 errors
        })


# ─────────────────────────────────────────────────
# API: EXPORT TIMETABLE
# ─────────────────────────────────────────────────
class TimetableExportView(APIView):
    def get(self, request):
        fmt = request.GET.get('format', 'csv')
        qs = TimeTable.objects.select_related('faculty').all()

        if fmt == 'json':
            data = list(qs.values(
                'faculty__name', 'day_of_week', 'start_time', 'end_time',
                'room_number', 'subject', 'course', 'year', 'semester', 'branch'
            ))
            return JsonResponse(data, safe=False)

        # CSV
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="timetable_export.csv"'
        writer = csv.writer(response)
        writer.writerow([
            'Faculty Name', 'Day', 'Start Time', 'End Time',
            'Room No', 'Subject', 'Course', 'Year', 'Semester', 'Branch'
        ])
        day_names = dict(TimeTable.DAY_CHOICES)
        for entry in qs:
            writer.writerow([
                entry.faculty.name,
                day_names.get(entry.day_of_week, str(entry.day_of_week)),
                entry.start_time.strftime('%H:%M'),
                entry.end_time.strftime('%H:%M'),
                entry.room_number,
                entry.subject, entry.course, entry.year, entry.semester, entry.branch
            ])
        return response


# ─────────────────────────────────────────────────
# API: ML PREDICTION
# ─────────────────────────────────────────────────
class PredictLocationView(APIView):
    def get(self, request, faculty_id):
        faculty = get_object_or_404(Faculty, pk=faculty_id)
        now = timezone.localtime()
        predictions = predict_locations_with_confidence(faculty_id, now)
        return Response({
            'faculty_id': faculty_id,
            'faculty_name': faculty.name,
            'predictions': predictions,
            'queried_at': now.strftime('%H:%M, %A'),
        })


# ─────────────────────────────────────────────────
# API: ROOMS LIST (for 3D mapping)
# ─────────────────────────────────────────────────
class RoomsListView(APIView):
    def get(self, request):
        now = timezone.localtime()
        current_day = now.weekday()
        current_time = now.time()

        active_rooms = TimeTable.objects.filter(
            day_of_week=current_day,
            start_time__lte=current_time,
            end_time__gte=current_time,
        ).values('room_number').annotate(faculty_count=Count('id'))

        all_rooms = TimeTable.objects.values_list('room_number', flat=True).distinct()
        active_room_numbers = {r['room_number'] for r in active_rooms}

        return Response({
            'all_rooms': sorted(set(all_rooms)),
            'active_rooms': list(active_room_numbers),
            'active_room_details': list(active_rooms),
        })


# ─────────────────────────────────────────────────
# ADMIN PANEL VIEWS (Template-based)
# ─────────────────────────────────────────────────
def admin_panel_login(request):
    if request.user.is_authenticated and request.user.is_staff:
        return redirect('admin_dashboard')
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user and user.is_staff:
            login(request, user)
            return redirect('admin_dashboard')
        messages.error(request, 'Invalid credentials or insufficient permissions.')
    return render(request, 'admin_panel/login.html')


def admin_panel_logout(request):
    logout(request)
    return redirect('admin_login')


@login_required(login_url='admin_login')
def admin_dashboard(request):
    now = timezone.localtime()
    current_day = now.weekday()
    current_time = now.time()

    total_faculty = Faculty.objects.count()
    total_rooms = TimeTable.objects.values('room_number').distinct().count()
    total_entries = TimeTable.objects.count()
    active_sessions = TimeTable.objects.filter(
        day_of_week=current_day,
        start_time__lte=current_time,
        end_time__gte=current_time,
    ).select_related('faculty')

    context = {
        'total_faculty': total_faculty,
        'total_rooms': total_rooms,
        'total_entries': total_entries,
        'active_sessions': active_sessions,
        'active_count': active_sessions.count(),
        'current_day': now.strftime('%A'),
        'current_time': now.strftime('%I:%M %p'),
    }
    return render(request, 'admin_panel/dashboard.html', context)


@login_required(login_url='admin_login')
def admin_faculty(request):
    faculties = Faculty.objects.all().order_by('name')
    return render(request, 'admin_panel/faculty_list.html', {'faculties': faculties})


@login_required(login_url='admin_login')
def admin_timetable(request):
    faculties = Faculty.objects.all().order_by('name')
    day_filter = request.GET.get('day', '')
    faculty_filter = request.GET.get('faculty', '')
    room_filter = request.GET.get('room', '')

    entries = TimeTable.objects.select_related('faculty').all()
    if day_filter:
        entries = entries.filter(day_of_week=int(day_filter))
    if faculty_filter:
        entries = entries.filter(faculty_id=int(faculty_filter))
    if room_filter:
        entries = entries.filter(room_number__icontains=room_filter)

    context = {
        'entries': entries,
        'faculties': faculties,
        'day_choices': TimeTable.DAY_CHOICES,
        'day_filter': day_filter,
        'faculty_filter': faculty_filter,
        'room_filter': room_filter,
    }
    return render(request, 'admin_panel/timetable_list.html', context)


@login_required(login_url='admin_login')
def admin_upload(request):
    faculties = Faculty.objects.all().order_by('name')
    required_cols = {
        'Teacher Guardian': 'Faculty name (required)',
        'Room No': 'Room number (required)',
        'Day': 'Day name or number (required)',
        'Time': 'Time or range e.g. 09:00-10:00 (required)',
        'Subject': 'Subject name (optional)',
        'Course': 'Course e.g. B.E. (optional)',
        'Year': 'Student year (optional)',
        'Semester': 'Semester number (optional)',
        'Branch': 'Branch e.g. CSE (optional)',
    }
    context = {'faculties': faculties, 'required_cols': required_cols}
    return render(request, 'admin_panel/upload.html', context)
