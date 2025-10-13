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
from rest_framework import status
from rest_framework.response import Response
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
from api.core.firebase_config import initialize_firebase      
from api.models.user_model.session import UserSession  
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from api.models.user_model.session import UserSession


if not firebase_admin._apps:
    cred = credentials.Certificate("path/to/firebase-service-account.json")
    firebase_admin.initialize_app(cred)
                
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

class ListAllUsersView(APIView):
    permission_classes = [IsAuthenticated]  

    def get(self, request):
        try:
            users = User.objects(role__in=["Admin", "Moderator", "User"])
            serializer = UserSerializer(users, many=True, context={"request": request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            print("Error listing users:", e)
            return Response({"error": "Failed to fetch users."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


        
class RetrieveUserView(APIView):
    permission_classes = [AllowAny]
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

        serializer = UserSerializer(instance=user, data=request.data, partial=True, context={'request': request})
       
        if serializer.is_valid():
            serializer.save() 
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DeleteUserView(generics.DestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

class BlockUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        current_user = request.user
        user_to_block = User.objects(id=user_id).first()
        if not user_to_block:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        
        if user_to_block == current_user:
            return Response({"detail": "Cannot block yourself."}, status=status.HTTP_400_BAD_REQUEST)
        
        if user_to_block not in current_user.blocked_users:
            current_user.blocked_users.append(user_to_block)
            current_user.save()
        
        return Response(
            {"detail": f"The user {user_to_block.first_name} {user_to_block.last_name} has been blocked successfully."},
            status=status.HTTP_200_OK
        )


class UnblockUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        current_user = request.user
        user_to_unblock = User.objects(id=user_id).first()
        if not user_to_unblock:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        
        if user_to_unblock in current_user.blocked_users:
            current_user.blocked_users.remove(user_to_unblock)
            current_user.save()
        
        return Response(
            {"detail": f"The user {user_to_unblock.first_name} {user_to_unblock.last_name} has been unblocked successfully."},
            status=status.HTTP_200_OK
        )

initialize_firebase()


class CustomTokenObtainPairView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password").encode("utf-8")

        # Verify user credentials
        user = User.objects(email=email).first()
        if not user or not user.password or not bcrypt.checkpw(password, user.password.encode("utf-8")):
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        # Token generator helper
        def generate_token(payload, exp_delta):
            payload.update({
                "exp": datetime.utcnow() + exp_delta,
                "iat": datetime.utcnow()
            })
            return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

        # Access token (60 minutes)
        access_token = generate_token({
            "user_id": str(user.id),
            "email": user.email,
            "role": user.role,
            "jti": f"{user.id}_access",
            "token_type": "access"
        }, timedelta(minutes=60))

        # Refresh token (7 days)
        refresh_token = generate_token({
            "user_id": str(user.id),
            "role": user.role,
            "jti": f"{user.id}_refresh",
            "token_type": "refresh"
        }, timedelta(days=7))

        # Check if 2FA is enabled for this user
        from api.models.user_model.two_factor_auth import TwoFactorAuth
        two_factor = TwoFactorAuth.objects(user=user).first()
        
        if two_factor and two_factor.is_enabled:
            # 2FA is enabled, return partial login data
            return Response({
                "requires_2fa": True,
                "enabled_methods": two_factor.enabled_methods,
                "primary_method": two_factor.primary_method,
                "message": "Two-factor authentication required"
            }, status=status.HTTP_200_OK)
        
        # Firebase custom token (only if 2FA is not enabled)
        firebase_token = firebase_auth.create_custom_token(str(user.id)).decode("utf-8")

        # Save user session with deduplication and cleanup
        def record_session(user, request):
            device = request.META.get("HTTP_USER_AGENT", "Unknown device")
            ip_address = request.META.get("REMOTE_ADDR")
            device_truncated = device[:100]

            # Cleanup old sessions (older than 30 days)
            from datetime import timedelta
            cutoff_date = datetime.utcnow() - timedelta(days=30)
            UserSession.objects(user=user, created_at__lt=cutoff_date).delete()

            # Limit sessions per user (keep only 10 most recent)
            user_sessions = UserSession.objects(user=user).order_by("-created_at")
            if user_sessions.count() > 10:
                sessions_to_delete = user_sessions[10:]
                for session in sessions_to_delete:
                    session.delete()

            # Check if session with same device already exists
            existing_session = UserSession.objects(
                user=user, 
                device=device_truncated,
                is_current=False
            ).first()

            # Mark all previous sessions inactive
            UserSession.objects(user=user, is_current=True).update(is_current=False)

            if existing_session:
                # Update existing session instead of creating new one
                existing_session.is_current = True
                existing_session.ip_address = ip_address
                existing_session.created_at = datetime.utcnow()
                existing_session.save()
                return existing_session
            else:
                # Create new session only if no existing session with same device
                session = UserSession(
                    user=user,
                    device=device_truncated,
                    ip_address=ip_address,
                    user_agent=device,
                    is_current=True,
                )
                session.save()
                return session

        record_session(user, request)

        return Response({
            "access_token": access_token,
            "refresh_token": refresh_token,
            "firebase_token": firebase_token,
            "user_id": str(user.id),
            "email": user.email,
            "role": user.role,
            "user_status": user.user_status,
            "scheduled_for_deletion": user.scheduled_for_deletion.isoformat() if user.scheduled_for_deletion else None
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
            decoded_refresh = jwt.decode(
                refresh_token,
                settings.SECRET_KEY,
                algorithms=["HS256"],
                options={"verify_exp": True}
            )

            # Retrieve user
            user = User.objects(id=decoded_refresh["user_id"]).first()
            if not user:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

            def generate_token(payload, exp_delta):
                payload.update({
                    "exp": datetime.utcnow() + exp_delta,
                    "iat": datetime.utcnow()
                })
                return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

            # Issue new access token (60 minutes)
            access_token = generate_token({
                "user_id": str(user.id),
                "email": user.email,
                "jti": f"{user.id}_access",
                "token_type": "access"
            }, timedelta(minutes=60))

            # Rotate refresh token (7 days)
            new_refresh_token = generate_token({
                "user_id": str(user.id),
                "jti": f"{user.id}_refresh",
                "token_type": "refresh"
            }, timedelta(days=7))

            return Response({
                "access_token": access_token,
                "refresh_token": new_refresh_token,
                "user_id": str(user.id),
                "email": user.email
            }, status=status.HTTP_200_OK)

        except jwt.ExpiredSignatureError:
            return Response({"error": "Refresh token has expired"}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return Response({"error": "Invalid refresh token"}, status=status.HTTP_400_BAD_REQUEST)



class SessionListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        sessions = UserSession.objects(user=request.user).order_by("-created_at")
        return Response([
            {
                "id": str(s.id),
                "device": s.device,
                "date": s.created_at.isoformat(),
                "isCurrentSession": s.is_current,
            }
            for s in sessions
        ])

class SessionDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, session_id):
        session = UserSession.objects(id=session_id, user=request.user).first()
        if not session:
            return Response({"error": "Session not found"}, status=status.HTTP_404_NOT_FOUND)

        session.delete()
        return Response({"message": "Session removed"}, status=status.HTTP_204_NO_CONTENT)

class ClearAllSessionsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request):
        try:
            # Delete all sessions for the user except the current session
            deleted_count = UserSession.objects(
                user=request.user,
                is_current=False
            ).delete()
            
            return Response({
                "message": f"Cleared {deleted_count} sessions successfully",
                "deleted_count": deleted_count
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "error": "Failed to clear sessions",
                "details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
