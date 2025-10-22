from datetime import datetime, timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from api.models.admin.report import Report
from api.models.user_model.users import User
from api.models.artwork_model.artwork import Art
from api.models.interaction_model.comment import Comment
from api.models.artwork_model.bid import Auction


class FlaggedContentView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Ensure only moderators and admins can access
        try:
            user_role = getattr(request.user, "role", None)
            if user_role not in ["Admin", "Moderator"]:
                return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

            # Get flagged content from reports
            flagged_content = []
            
            # Get recent reports that are pending or investigating
            reports = Report.objects(
                status__in=["Pending", "In Progress", "Investigating"]
            ).order_by("-created_at")[:10]  # Limit to 10 most recent
            
            for report in reports:
                content_item = {
                    "id": str(report.id),
                    "type": self._get_content_type(report),
                    "title": self._get_content_title(report),
                    "description": self._get_content_description(report),
                    "flagged_reason": report.category,
                    "reported_by": str(report.user.id) if report.user else "Unknown",
                    "created_at": report.created_at.isoformat() if report.created_at else None,
                    "date_flagged": report.created_at.isoformat() if report.created_at else None,
                    "status": report.status,
                    "report_description": report.description or "No description provided",
                    "content_id": self._get_content_id(report),
                    "content_data": self._get_content_data(report)
                }
                flagged_content.append(content_item)
            
            return Response(
                {
                    "flaggedContent": flagged_content
                },
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _get_content_type(self, report):
        """Determine the type of content being reported"""
        if report.art:
            return "artwork"
        elif report.comment:
            return "comment"
        elif report.reported_user:
            return "user"
        elif report.auction:
            return "auction"
        elif report.exhibit:
            return "exhibit"
        else:
            return "unknown"
    
    def _get_content_title(self, report):
        """Get the title of the flagged content"""
        if report.art:
            return f"Flagged Artwork: \"{report.art.title}\""
        elif report.comment:
            return "Flagged Comment"
        elif report.reported_user:
            return f"Flagged User Profile"
        elif report.auction:
            return f"Flagged Auction: \"{report.auction.artwork.title if report.auction.artwork else 'Unknown'}\""
        elif report.exhibit:
            return f"Flagged Exhibit: \"{report.exhibit.title}\""
        else:
            return "Flagged Content"
    
    def _get_content_description(self, report):
        """Get additional description for the flagged content"""
        if report.art:
            return f"ID: {str(report.art.id)[:8]}..."
        elif report.comment:
            return f"On Artwork: \"{report.comment.object_id}\""
        elif report.reported_user:
            return f"Username: @{report.reported_user.username if hasattr(report.reported_user, 'username') else 'unknown'}"
        elif report.auction:
            return f"Auction ID: {str(report.auction.id)[:8]}..."
        elif report.exhibit:
            return f"Exhibit ID: {str(report.exhibit.id)[:8]}..."
        else:
            return "Content ID: Unknown"
    
    def _get_content_id(self, report):
        """Get the ID of the flagged content"""
        if report.art:
            return str(report.art.id)
        elif report.comment:
            return str(report.comment.id)
        elif report.reported_user:
            return str(report.reported_user.id)
        elif report.auction:
            return str(report.auction.id)
        elif report.exhibit:
            return str(report.exhibit.id)
        else:
            return "unknown"
    
    def _get_content_data(self, report):
        """Get additional data about the flagged content"""
        data = {}
        
        if report.art:
            data = {
                "title": report.art.title,
                "artist": report.art.artist.first_name + " " + report.art.artist.last_name if report.art.artist else "Unknown",
                "category": report.art.category,
                "description": report.art.description,
                "image_url": report.art.image_url[0] if report.art.image_url else None
            }
        elif report.comment:
            data = {
                "text": report.comment.text,
                "author": report.comment.user.first_name + " " + report.comment.user.last_name if report.comment.user else "Unknown",
                "created_at": report.comment.created_at.isoformat()
            }
        elif report.reported_user:
            data = {
                "username": getattr(report.reported_user, 'username', 'unknown'),
                "first_name": report.reported_user.first_name,
                "last_name": report.reported_user.last_name,
                "email": report.reported_user.email
            }
        elif report.auction:
            data = {
                "artwork_title": report.auction.artwork.title if report.auction.artwork else "Unknown",
                "start_bid": report.auction.start_bid_amount,
                "status": report.auction.status
            }
        elif report.exhibit:
            data = {
                "title": report.exhibit.title,
                "description": report.exhibit.description
            }
        
        return data
