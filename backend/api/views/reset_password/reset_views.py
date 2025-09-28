from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from api.models.user_model.users import User
from django.core.mail import send_mail
import random
from django.conf import settings
from rest_framework.permissions import AllowAny
from datetime import datetime
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

            html_content = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                <div style="text-align: center; margin-bottom: 20px;">
                  <img src="http://localhost:8080/static/images/worxist_logo.png" alt="Worxist Logo" style="width: 120px; height: auto;" />

                </div>

                <h2 style="color: #b91c1c; text-align: center;">Password Reset OTP</h2>
                <p style="font-size: 14px; color: #333;">
                    Hi {user.username},<br/><br/>
                    We received a request to reset your password for your Worxist account.<br/>
                    Use the following One-Time Password (OTP) to reset your password:
                </p>

                <p style="font-size: 24px; font-weight: bold; color: #b91c1c; text-align: center; margin: 20px 0;">
                    {otp}
                </p>

                <p style="font-size: 12px; color: #555; text-align: center;">
                    This OTP will expire in 10 minutes.<br/>
                    If you did not request a password reset, please ignore this email.
                </p>

                <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;" />
                <p style="font-size: 12px; color: #999; text-align: center;">
                    &copy; {datetime.utcnow().year} Worxist Website. All rights reserved.
                </p>
            </div>
            """

            send_mail(
                subject='Worxist Website | Password Reset Request',
                message='',
                from_email='Worxist Website <noreply@worxist.com>',
                recipient_list=[email],
                html_message=html_content,
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

        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 20px;">
           <img src="http://localhost:8080/static/images/worxist_logo.png" alt="Worxist Logo" style="width: 120px; height: auto;" />

            </div>

            <h2 style="color: #b91c1c; text-align: center;">Resent OTP Code</h2>
            <p style="font-size: 14px; color: #333;">
                Hi {user.username},<br/><br/>
                Here is your new One-Time Password (OTP) to reset your Worxist password:
            </p>

            <p style="font-size: 24px; font-weight: bold; color: #b91c1c; text-align: center; margin: 20px 0;">
                {otp}
            </p>

            <p style="font-size: 12px; color: #555; text-align: center;">
                This OTP will expire in 10 minutes.<br/>
                If you did not request a password reset, please ignore this email.
            </p>

            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;" />
            <p style="font-size: 12px; color: #999; text-align: center;">
                &copy; {datetime.utcnow().year} Worxist Website. All rights reserved.
            </p>
        </div>
        """

        send_mail(
            subject='Worxist Website | Resent OTP Code',
            message='',
            from_email='Worxist Website <noreply@worxist.com>',
            recipient_list=[email],
            html_message=html_content,
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
        user.is_oauth_user = False 
        user.otp = None
        user.otp_expires_at = None
        user.save()

        return Response({"detail": "Password reset successfully."}, status=status.HTTP_200_OK)
