from django.urls import path
from api.views.reset_password.reset_views import RequestResetEmailView, ResendOTPView, VerifyOTPView, ResetPasswordView

reset_urlpatterns = [
    path("request-reset-email/", RequestResetEmailView.as_view()),
    path("verify-otp/", VerifyOTPView.as_view()),
    path("resend-otp/", ResendOTPView.as_view()),
    path("reset-password/", ResetPasswordView.as_view()),

]
