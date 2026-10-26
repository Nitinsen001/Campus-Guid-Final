from django.conf import settings


def campus_app_context(request):
    return {'campus_home_url': f'{settings.CAMPUS_APP_ORIGIN.rstrip("/")}/'}
