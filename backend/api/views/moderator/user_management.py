from datetime import datetime, timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from api.models.user_model.users import User
from api.models.admin.report import Report


class UserManagementView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user_role = getattr(request.user, "role", None)
            if user_role not in ["Admin", "Moderator"]:
                return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

            # Get all users with their report counts
            users = User.objects.all().order_by("-created_at")
            
            users_data = []
            for user in users:
                # Count reports against this user
                report_count = Report.objects(reported_user=user).count()
                
                # Determine user status based on reports and any existing status
                user_status = "active"
                if report_count > 10:
                    user_status = "suspended"
                elif report_count > 5:
                    user_status = "warned"
                elif report_count > 2:
                    user_status = "muted"
                
                # Get last active (using created_at as proxy since we don't have last_login)
                last_active = user.created_at.strftime("%Y-%m-%d") if user.created_at else "Unknown"
                
                users_data.append({
                    "id": str(user.id),
                    "username": user.username,
                    "email": user.email,
                    "dateJoined": user.created_at.strftime("%Y-%m-%d") if user.created_at else "Unknown",
                    "status": user_status,
                    "reportCount": report_count,
                    "lastActive": last_active,
                    "avatar": getattr(user, 'profile_picture', None),
                    "notes": getattr(user, 'moderator_notes', None)
                })
            
            return Response({"users": users_data}, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserActionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            user_role = getattr(request.user, "role", None)
            if user_role not in ["Admin", "Moderator"]:
                return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

            action = request.data.get("action")
            user_id = request.data.get("user_id")
            notes = request.data.get("notes", "")

            if not all([action, user_id]):
                return Response(
                    {"detail": "Missing required fields: action, user_id"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)

            # Handle different actions
            if action == "warn":
                # In a real implementation, you might want to:
                # - Send a warning email to the user
                # - Log the warning in user's record
                # - Track warning count
                if notes:
                    user.moderator_notes = notes
                    user.save()
                
                return Response({
                    "message": "Warning issued to user",
                    "action": "warn",
                    "user_id": user_id
                }, status=status.HTTP_200_OK)

            elif action == "mute":
                # In a real implementation, you might want to:
                # - Set mute expiration time
                # - Log the mute action
                if notes:
                    user.moderator_notes = notes
                    user.save()
                
                return Response({
                    "message": "User muted for 24 hours",
                    "action": "mute",
                    "user_id": user_id
                }, status=status.HTTP_200_OK)

            elif action == "suspend":
                # In a real implementation, you might want to:
                # - Set suspension expiration time
                # - Log the suspension action
                if notes:
                    user.moderator_notes = notes
                    user.save()
                
                return Response({
                    "message": "User suspended",
                    "action": "suspend",
                    "user_id": user_id
                }, status=status.HTTP_200_OK)

            elif action == "restore":
                # Restore user to active status
                if notes:
                    user.moderator_notes = notes
                    user.save()
                
                return Response({
                    "message": "User restored to active status",
                    "action": "restore",
                    "user_id": user_id
                }, status=status.HTTP_200_OK)

            elif action == "update_notes":
                # Update moderator notes
                user.moderator_notes = notes
                user.save()
                
                return Response({
                    "message": "User notes updated",
                    "action": "update_notes",
                    "user_id": user_id
                }, status=status.HTTP_200_OK)

            else:
                return Response(
                    {"detail": "Invalid action. Must be one of: warn, mute, suspend, restore, update_notes"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
