from django.urls import path
from api.views.auth.google_auth_views import GoogleRegisterView

auth_urlpatterns = [
    path('user/google-register/', GoogleRegisterView.as_view(), name='google-register'),
    
]
