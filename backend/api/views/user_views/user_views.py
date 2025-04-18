import jwt
from datetime import datetime, timedelta
import bcrypt
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
from api.models.user_model.users import User
from api.serializers.user_s.users_serializers import UserSerializer 
from api.auth.permissions import IsAdminOrOwner 
from api.utils.email_utils import generate_otp, send_otp_email

class CreateUserView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        otp = generate_otp()
        user.otp = otp
        user.otp_expires_at = datetime.utcnow() + timedelta(minutes=5)
        user.save()
        send_otp_email(user.email, otp)

class RetrieveUserView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

class UpdateUserView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminOrOwner]

class DeleteUserView(generics.DestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
  
# Custom JWT Token 
class CustomTokenObtainPairView(APIView):
    """Handles JWT authentication for MongoEngine users"""
    permission_classes = [AllowAny] 
    def post(self, request):
        email, password = request.data.get("email"), request.data.get("password").encode("utf-8")

       
        user = User.objects(email=email).first()
        if not user or not bcrypt.checkpw(password, user.password.encode("utf-8")):
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

     
        def generate_token(payload, exp_delta):
            payload.update({"exp": datetime.datetime.utcnow() + exp_delta, "iat": datetime.datetime.utcnow()})
            return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

       
        access_token = generate_token({
            "user_id": str(user.id), 
            "email": user.email, 
            "jti": f"{user.id}_access",
            "token_type": "access"
        }, datetime.timedelta(hours=1))

        
        refresh_token = generate_token({
            "user_id": str(user.id), 
            "jti": f"{user.id}_refresh",
            "token_type": "refresh"
        }, datetime.timedelta(days=7))

      
        return Response({
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user_id": str(user.id),
            "email": user.email
        }, status=status.HTTP_200_OK)



class CustomTokenRefreshView(APIView):
    """Handles JWT token refresh"""

    def post(self, request):
        refresh_token = request.data.get("refresh_token")
        if not refresh_token:
            return Response({"error": "refresh_token is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
           
            decoded_refresh_token = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=["HS256"])
            user = User.objects(id=decoded_refresh_token["user_id"]).first()
            
            if not user:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
            
            def generate_token(payload, exp_delta):
                payload.update({"exp": datetime.datetime.utcnow() + exp_delta, "iat": datetime.datetime.utcnow()})
                return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")


            access_token = generate_token({
            "user_id": str(user.id), 
            "email": user.email, 
            "jti": f"{user.id}_access",
            "token_type": "access"
            }, datetime.timedelta(hours=1))


            refresh_token = generate_token({
            "user_id": str(user.id), 
            "jti": f"{user.id}_refresh",
            "token_type": "refresh"
             }, datetime.timedelta(days=7))

    
            return Response({
                "access_token": access_token,
                "refresh_token": refresh_token,
                "user_id": str(user.id),
                "email": user.email
            }, status=status.HTTP_200_OK)

        except jwt.ExpiredSignatureError:
            return Response({"error": "Refresh token has expired"}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return Response({"error": "Invalid refresh token"}, status=status.HTTP_400_BAD_REQUEST)

