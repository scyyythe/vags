from datetime import datetime, timedelta
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


class RecentlyResolvedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user_role = getattr(request.user, "role", None)
            if user_role not in ["Admin", "Moderator"]:
                return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

            now = datetime.now()
            # Get reports resolved in the last 7 days
            seven_days_ago = now - timedelta(days=7)
            
            resolved_reports = Report.objects(
                status="Resolved",
                created_at__gte=seven_days_ago
            ).order_by("-created_at")[:10]  # Get last 10 resolved reports

            recently_resolved = []
            
            for report in resolved_reports:
                try:
                    # Determine the type of content that was resolved
                    content_type = "Unknown"
                    content_title = "Unknown Content"
                    content_id = "Unknown"
                    
                    if report.art:
                        content_type = "artwork"
                        content_title = f"Artwork: \"{report.art.title}\""
                        content_id = str(report.art.id)
                    elif report.comment:
                        content_type = "comment"
                        content_title = "Comment"
                        content_id = str(report.comment.id)
                    elif report.reported_user:
                        content_type = "user"
                        content_title = f"User: @{report.reported_user.username}"
                        content_id = str(report.reported_user.id)
                    elif report.auction:
                        content_type = "auction"
                        content_title = f"Auction: \"{report.auction.artwork.title}\"" if report.auction.artwork else "Auction"
                        content_id = str(report.auction.id)
                    elif report.exhibit:
                        content_type = "exhibit"
                        content_title = f"Exhibit: \"{report.exhibit.title}\""
                        content_id = str(report.exhibit.id)

                    # Calculate time ago
                    time_diff = now - report.created_at
                    if time_diff.total_seconds() < 3600:  # Less than 1 hour
                        time_ago = f"{int(time_diff.total_seconds() / 60)} minutes ago"
                    elif time_diff.total_seconds() < 86400:  # Less than 1 day
                        time_ago = f"{int(time_diff.total_seconds() / 3600)} hours ago"
                    else:
                        time_ago = f"{int(time_diff.total_seconds() / 86400)} days ago"

                    # Determine action taken based on category and content type
                    action_taken = "Issue resolved"
                    if report.category.lower() in ["inappropriate", "harassment", "hate_speech"]:
                        if content_type == "artwork":
                            action_taken = "Content removed for terms of service violation"
                        elif content_type == "comment":
                            action_taken = "Comment removed for inappropriate content"
                        elif content_type == "user":
                            action_taken = "User warned for inappropriate behavior"
                    elif report.category.lower() in ["copyright", "plagiarism"]:
                        action_taken = "Content removed for copyright violation"
                    elif report.category.lower() in ["fraud", "fake", "scam"]:
                        if content_type == "user":
                            action_taken = "User account suspended for fraudulent activity"
                        else:
                            action_taken = "Content removed for fraudulent activity"
                    elif report.category.lower() in ["spam"]:
                        action_taken = "Spam content removed"
                    else:
                        action_taken = "Issue resolved and content reviewed"

                    recently_resolved.append({
                        "id": str(report.id),
                        "content_type": content_type,
                        "content_title": content_title,
                        "content_id": content_id,
                        "action_taken": action_taken,
                        "time_ago": time_ago,
                        "category": report.category,
                        "resolved_at": report.created_at.isoformat() if report.created_at else None
                    })
                    
                except Exception as e:
                    # Skip this report if there's an error processing it
                    continue

            return Response({"recentlyResolved": recently_resolved}, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
