from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime
from api.models.user_model.users import User

class VerifyOTPView(APIView):
    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')

        user = User.objects(email=email).first()

        if not user:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        if user.otp != otp:
            return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)

        if user.otp_expires_at and datetime.utcnow() > user.otp_expires_at:
            return Response({'error': 'OTP has expired'}, status=status.HTTP_400_BAD_REQUEST)

        user.otp = None
        user.otp_expires_at = None
        user.save()

        return Response({'message': 'OTP verified successfully'}, status=status.HTTP_200_OK)
