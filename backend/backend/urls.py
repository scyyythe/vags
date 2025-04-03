from django.contrib import admin
from django.urls import path, include
from api.views.user_views import CreateUserView, CustomTokenObtainPairView, CustomTokenRefreshView
from django.http import JsonResponse
from api.views.views import FingerprintStatusView

def home(request):
    return JsonResponse({"message": "API is working"}, safe=False)

urlpatterns = [
    path('admin/', admin.site.urls),
    path("", home), 
    path("api/user/register/", CreateUserView.as_view(), name="register"),
    path("api/token/", CustomTokenObtainPairView.as_view(), name="get_token"),
    path("api/token/refresh/", CustomTokenRefreshView.as_view(), name="refresh_token"), 
    path("api-auth/", include("rest_framework.urls")),
    path('api/fingerprint-status', FingerprintStatusView.as_view(), name='fingerprint_status'),
    path('api/', include('api.urls')),
  
]
