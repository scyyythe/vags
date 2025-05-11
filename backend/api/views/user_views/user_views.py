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
import traceback
from bson import ObjectId

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


class RetrieveUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            if not ObjectId.is_valid(pk):
                return Response({"error": "Invalid user ID format."}, status=status.HTTP_400_BAD_REQUEST)

            user = User.objects(id=ObjectId(pk)).first()

            if not user:
                return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

            serializer = UserSerializer(user, context={"request": request})
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            print("Error retrieving user:", e)
            traceback.print_exc()
            return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UpdateUserView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminOrOwner]
    
class UpdateUserDetailsView(APIView):
    def patch(self, request, user_id):  
        try:
            user = User.objects.get(id=ObjectId(user_id))  
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

   
        serializer = UserSerializer(instance=user, data=request.data, partial=True)
       
        if serializer.is_valid():
            serializer.save() 
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class DeleteUserView(generics.DestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
  

class CustomTokenObtainPairView(APIView):
    """Handles JWT authentication for MongoEngine users"""
    permission_classes = [AllowAny] 
    def post(self, request):
        email, password = request.data.get("email"), request.data.get("password").encode("utf-8")

        user = User.objects(email=email).first()
        if not user or not user.password or not bcrypt.checkpw(password, user.password.encode("utf-8")):
            return Response({"error": "Please check your credentials and try again"}, status=status.HTTP_401_UNAUTHORIZED)


      
        def generate_token(payload, exp_delta):
            payload.update({"exp": datetime.utcnow() + exp_delta, "iat": datetime.utcnow()})
            return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

   
        access_token = generate_token({
            "user_id": str(user.id), 
            "email": user.email, 
            "jti": f"{user.id}_access",
            "token_type": "access"
        }, timedelta(hours=8))  

        refresh_token = generate_token({
            "user_id": str(user.id), 
            "jti": f"{user.id}_refresh",
            "token_type": "refresh"
        }, timedelta(days=7))  

        return Response({
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user_id": str(user.id),
            "email": user.email
        }, status=status.HTTP_200_OK)

class CustomTokenRefreshView(APIView):
    """Handles JWT token refresh"""
    permission_classes = [AllowAny] 
    def post(self, request):
        refresh_token = request.data.get("refresh_token")
        if not refresh_token:
            return Response({"error": "refresh_token is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Decode the refresh token
            decoded_refresh_token = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=["HS256"], options={"verify_exp": True})

            # Retrieve user from database
            user = User.objects(id=decoded_refresh_token["user_id"]).first()
            if not user:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

            # Generate token helper function
            def generate_token(payload, exp_delta):
                payload.update({"exp": datetime.utcnow() + exp_delta, "iat": datetime.utcnow()})
                return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

            # Generate new access token
            access_token = generate_token({
                "user_id": str(user.id),
                "email": user.email,
                "jti": f"{user.id}_access",
                "token_type": "access"
            }, timedelta(hours=8))  # Correct usage of timedelta

            # Optionally rotate the refresh token
            refresh_token = generate_token({
                "user_id": str(user.id),
                "jti": f"{user.id}_refresh",
                "token_type": "refresh"
            }, timedelta(days=7))  # Correct usage of timedelta

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
