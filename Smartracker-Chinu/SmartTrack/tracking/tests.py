from django.contrib.auth.models import User
from django.test import override_settings
from django.test import TestCase
from django.urls import reverse

from .models import Faculty


class CampusFrameOriginTests(TestCase):
    @override_settings(CAMPUS_APP_ORIGIN="http://localhost:3000")
    def test_campus_loopback_alias_can_embed_smarttracker(self):
        response = self.client.get(reverse("index"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response["Content-Security-Policy"],
            "frame-ancestors 'self' http://localhost:3000 http://127.0.0.1:3000",
        )


class AdminFacultyViewTests(TestCase):
    def test_admin_back_to_campus_links_to_campus_home(self):
        response = self.client.get(reverse("admin_login"))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'href="http://localhost:3000/"')

    def test_admin_sidebar_campus_link_opens_campus_home(self):
        staff_user = User.objects.create_user(username="staff", is_staff=True)
        self.client.force_login(staff_user)

        response = self.client.get(reverse("admin_dashboard"))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'href="http://localhost:3000/"')

    def test_faculty_without_photo_is_shown_with_avatar_fallback(self):
        staff_user = User.objects.create_user(username="staff", is_staff=True)
        self.client.force_login(staff_user)
        faculty = Faculty.objects.create(name="Faculty Without Photo")

        response = self.client.get(reverse("admin_faculty"))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, faculty.name)
        self.assertContains(response, "https://ui-avatars.com/api/")
