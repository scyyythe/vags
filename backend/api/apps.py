from django.apps import AppConfig
from api.core.firebase_config import initialize_firebase

class ApiConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "api"

    def ready(self):
        # Initialize Firebase once when Django starts
        initialize_firebase()
