from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from api.models.user_model.users import User
from api.serializers.user_s.users_serializers import UserSerializer
from bson import ObjectId
from datetime import datetime, timedelta
import traceback


class SoftDeleteAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, user_id):
        try:
            user = User.objects.get(id=ObjectId(user_id))
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        if str(request.user.id) != user_id:
            return Response(
                {"error": "You do not have permission to modify this user's account."},
                status=status.HTTP_403_FORBIDDEN
            )

        action = request.data.get('action')  # 'schedule_deletion' or 'cancel_deletion'

        if action == 'schedule_deletion':
            # Schedule account for deletion in 60 days
            deletion_date = datetime.utcnow() + timedelta(days=60)
            user.user_status = "scheduled_for_deletion"
            user.scheduled_for_deletion = deletion_date
            user.updated_at = datetime.utcnow()
            user.save()

            serializer = UserSerializer(user)
            return Response({
                "message": "Account scheduled for deletion in 60 days.",
                "deletion_date": deletion_date.isoformat(),
                "user": serializer.data
            }, status=status.HTTP_200_OK)

        elif action == 'cancel_deletion':
            # Cancel scheduled deletion
            user.user_status = "active"
            user.scheduled_for_deletion = None
            user.updated_at = datetime.utcnow()
            user.save()

            serializer = UserSerializer(user)
            return Response({
                "message": "Account deletion cancelled. Account is now active.",
                "user": serializer.data
            }, status=status.HTTP_200_OK)

        else:
            return Response(
                {"error": "Invalid action. Must be 'schedule_deletion' or 'cancel_deletion'."},
                status=status.HTTP_400_BAD_REQUEST
            )


class PermanentlyDeleteAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, user_id):
        try:
            user = User.objects.get(id=ObjectId(user_id))
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        if str(request.user.id) != user_id:
            return Response(
                {"error": "You do not have permission to modify this user's account."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Check if account is scheduled for deletion and 60 days have passed
        if user.user_status == "scheduled_for_deletion" and user.scheduled_for_deletion:
            if datetime.utcnow() >= user.scheduled_for_deletion:
                # Permanently delete the account
                user.delete()
                return Response({
                    "message": "Account permanently deleted."
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    "error": "Account is scheduled for deletion but 60-day grace period has not expired yet."
                }, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({
                "error": "Account is not scheduled for deletion."
            }, status=status.HTTP_400_BAD_REQUEST)
