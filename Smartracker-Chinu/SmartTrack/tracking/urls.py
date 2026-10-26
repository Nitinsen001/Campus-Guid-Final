from django.urls import path
from . import views

urlpatterns = [
    # ── Main 3D View ──
    path('', views.index, name='index'),

    # ── REST APIs ──
    path('api/live/', views.FacultyLiveStatusView.as_view(), name='live_status'),
    path('api/stats/', views.StatsView.as_view(), name='stats'),
    path('api/rooms/', views.RoomsListView.as_view(), name='rooms_list'),

    # Faculty
    path('api/faculty/', views.FacultyListCreateView.as_view(), name='faculty_list_create'),
    path('api/faculty/<int:pk>/', views.FacultyDetailView.as_view(), name='faculty_detail'),
    path('api/faculty/search/', views.FacultySearchView.as_view(), name='faculty_search'),

    # Timetable
    path('api/timetable/', views.TimetableListCreateView.as_view(), name='timetable_list_create'),
    path('api/timetable/<int:pk>/', views.TimetableDetailView.as_view(), name='timetable_detail'),
    path('api/timetable/upload/', views.TimetableUploadView.as_view(), name='timetable_upload'),
    path('api/timetable/export/', views.TimetableExportView.as_view(), name='timetable_export'),

    # ML Prediction
    path('api/predict/<int:faculty_id>/', views.PredictLocationView.as_view(), name='predict_location'),

    # ── Admin Panel ──
    path('admin-panel/login/', views.admin_panel_login, name='admin_login'),
    path('admin-panel/logout/', views.admin_panel_logout, name='admin_logout'),
    path('admin-panel/', views.admin_dashboard, name='admin_dashboard'),
    path('admin-panel/faculty/', views.admin_faculty, name='admin_faculty'),
    path('admin-panel/timetable/', views.admin_timetable, name='admin_timetable'),
    path('admin-panel/upload/', views.admin_upload, name='admin_upload'),
]
