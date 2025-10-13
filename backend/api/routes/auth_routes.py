from django.urls import path
from api.views.auth.google_auth_views import GoogleRegisterView
from api.views.auth.two_factor_views import (
    TwoFactorSetupView,
    TwoFactorVerifySetupView,
    TwoFactorVerifyView,
    TwoFactorDisableView,
    TwoFactorBackupCodesView,
    TwoFactorStatusView
)

auth_urlpatterns = [
    path('user/google-register/', GoogleRegisterView.as_view(), name='google-register'),
    
    # Two-Factor Authentication routes
    path('auth/2fa/setup/', TwoFactorSetupView.as_view(), name='2fa-setup'),
    path('auth/2fa/verify-setup/', TwoFactorVerifySetupView.as_view(), name='2fa-verify-setup'),
    path('auth/2fa/verify/', TwoFactorVerifyView.as_view(), name='2fa-verify'),
    path('auth/2fa/disable/', TwoFactorDisableView.as_view(), name='2fa-disable'),
    path('auth/2fa/backup-codes/', TwoFactorBackupCodesView.as_view(), name='2fa-backup-codes'),
    path('auth/2fa/status/', TwoFactorStatusView.as_view(), name='2fa-status'),
]
