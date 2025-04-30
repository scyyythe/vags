from django.contrib import admin
from django.urls import path, include
from api.views.user_views.user_views import CreateUserView, CustomTokenObtainPairView, CustomTokenRefreshView
from api.views.auth_views import VerifyOTPView
from django.http import JsonResponse
from .views import google_register
from api.views.auth.google_auth_views import GoogleRegisterView,GoogleLoginView
def home(request):
    return JsonResponse({"message": "API is working"}, safe=False)

urlpatterns = [
    path('admin/', admin.site.urls),
    path("", home), 
    path("api/user/register/", CreateUserView.as_view(), name="register"),
    path('api/user/google-register/', GoogleRegisterView.as_view(), name='google-register'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify_otp'), 
    path("api/token/", CustomTokenObtainPairView.as_view(), name="get_token"),
    path("api/user/google-login/", GoogleLoginView.as_view(), name="google-login"),
    path("api/token/refresh/", CustomTokenRefreshView.as_view(), name="refresh_token"),
    path('api/', include('api.urls')),
    
  
]
