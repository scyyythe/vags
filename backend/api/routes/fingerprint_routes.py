from django.urls import path
from api.views.fingerprint.views import trigger_fingerprint_scan
from api.views.fingerprint.views_verify import TriggerFingerprintScanView

fingerprint_urlpatterns = [
    path('trigger-fingerprint-scan/', trigger_fingerprint_scan, name='trigger_fingerprint_scan'),
    path('trigger-fingerprint-verification/', TriggerFingerprintScanView.as_view(), name='trigger-fingerprint-verification'),
]
