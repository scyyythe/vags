from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from api.models.user_model.users import User
from django.core.mail import send_mail
import random
from django.conf import settings
from rest_framework.permissions import AllowAny

class RequestResetEmailView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects(email=email).first()
            if not user:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
            
            otp = random.randint(1000, 9999)
            user.otp = otp
            user.save()

            send_mail(
                'Password Reset Request',
                f"""
                Hi {user.username},

                We received a request to reset your password for your account.

                Your One-Time Password (OTP) is: {otp}

                Please use this code to reset your password. This OTP will expire in 10 minutes.

                If you did not request a password reset, please ignore this email or contact support.

                Thanks,  
                The Team
                """,
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )

            return Response({"message": "OTP sent to email."}, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VerifyOTPView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")

        user = User.objects(email=email).first()
        if not user or str(user.otp) != str(otp):
            return Response({"detail": "Invalid OTP or email."}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"detail": "OTP verified successfully."}, status=status.HTTP_200_OK)

class ResendOTPView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        email = request.data.get("email")
        user = User.objects(email=email).first()
        if not user:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        otp = random.randint(1000, 9999)
        user.otp = otp
        user.save()

        send_mail(
            subject="Your Resent OTP Code",
            message=f"Your new OTP is {otp}.",
            from_email="noreply@yourdomain.com",
            recipient_list=[email],
            fail_silently=False,
        )
        return Response({"detail": "OTP resent."}, status=status.HTTP_200_OK)

class ResetPasswordView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        email = request.data.get("email")
        new_password = request.data.get("new_password")

        user = User.objects(email=email).first()
        if not user:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        user.set_password(new_password)
        user.otp = None
        user.save()
        return Response({"detail": "Password reset successfully."}, status=status.HTTP_200_OK)
