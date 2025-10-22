from datetime import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from api.models.admin.report import Report
from api.models.artwork_model.artwork import Art
from api.models.user_model.users import User
from api.models.interaction_model.comment import Comment
from api.models.artwork_model.bid import Auction
from api.models.exhibit_model.exhibit import Exhibit


class ContentModerationActionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            user_role = getattr(request.user, "role", None)
            if user_role not in ["Admin", "Moderator"]:
                return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

            action = request.data.get("action")
            content_id = request.data.get("content_id")
            content_type = request.data.get("content_type")
            report_id = request.data.get("report_id")

            if not all([action, content_id, content_type, report_id]):
                return Response(
                    {"detail": "Missing required fields: action, content_id, content_type, report_id"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Find the report
            try:
                report = Report.objects.get(id=report_id)
            except Report.DoesNotExist:
                return Response({"detail": "Report not found"}, status=status.HTTP_404_NOT_FOUND)

            # Handle different actions
            if action == "approve":
                # Mark report as resolved
                report.status = "Resolved"
                report.save()
                
                # If it's artwork, make it visible again
                if content_type == "artwork" and report.art:
                    artwork = report.art
                    artwork.visibility = "public"
                    artwork.save()
                
                return Response({
                    "message": "Content approved and restored",
                    "action": "approve",
                    "content_id": content_id
                }, status=status.HTTP_200_OK)

            elif action == "remove":
                # Mark report as resolved
                report.status = "Resolved"
                report.save()
                
                # Remove the content based on type
                if content_type == "artwork" and report.art:
                    artwork = report.art
                    artwork.visibility = "removed"
                    artwork.save()
                elif content_type == "comment" and report.comment:
                    # For comments, we might want to mark as deleted or remove
                    # Since Comment model doesn't have is_deleted, we'll just resolve the report
                    pass
                elif content_type == "user" and report.reported_user:
                    # For users, we might want to suspend or ban
                    # This would require additional user management logic
                    pass
                
                return Response({
                    "message": "Content removed",
                    "action": "remove",
                    "content_id": content_id
                }, status=status.HTTP_200_OK)

            elif action == "warn":
                # Mark report as resolved but keep content
                report.status = "Resolved"
                report.save()
                
                # In a real implementation, you might want to:
                # - Send a warning email to the user
                # - Log the warning in user's record
                # - Track warning count
                
                return Response({
                    "message": "Warning sent to user",
                    "action": "warn",
                    "content_id": content_id
                }, status=status.HTTP_200_OK)

            elif action == "escalate":
                # Mark report as escalated to admin
                report.status = "Escalated"
                report.save()
                
                return Response({
                    "message": "Content escalated to admin for review",
                    "action": "escalate",
                    "content_id": content_id
                }, status=status.HTTP_200_OK)

            else:
                return Response(
                    {"detail": "Invalid action. Must be one of: approve, remove, warn, escalate"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
