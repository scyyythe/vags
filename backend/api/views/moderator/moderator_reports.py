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
from api.models.exhibit_model.exhibit import Exhibit


class ModeratorReportsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Ensure only moderators and admins can access
        try:
            user_role = getattr(request.user, "role", None)
            if user_role not in ["Admin", "Moderator"]:
                return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

            # Get status filter from query params
            status_filter = request.query_params.get('status', 'all')
            
            # Build query based on status filter
            try:
                # Start with a simple query first
                reports_query = Report.objects.all()
                
                # Apply status filter if needed
                if status_filter == 'pending':
                    reports_query = reports_query.filter(status="Pending")
                elif status_filter == 'investigating':
                    reports_query = reports_query.filter(status="In Progress")
                elif status_filter == 'resolved':
                    reports_query = reports_query.filter(status__in=["Resolved", "Dismissed"])

                # Order by creation date (newest first) and limit results
                reports_query = reports_query.order_by("-created_at")[:50]
            except Exception as query_error:
                return Response({"detail": f"Query error: {str(query_error)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Convert to frontend format
            reports_data = []
            for report in reports_query:
                try:
                    
                    # Map backend status to frontend status
                    status_mapping = {
                        "Pending": "pending",
                        "In Progress": "investigating", 
                        "Investigating": "investigating",
                        "Resolved": "resolved",
                        "Dismissed": "dismissed"
                    }
                    
                    # Determine reported type and ID
                    reported_type = "artwork"  # Default to artwork
                    reported_id = "unknown"
                    
                    if report.art:
                        reported_type = "artwork"
                        reported_id = str(report.art.id)
                    elif report.comment:
                        reported_type = "comment"
                        reported_id = str(report.comment.id)
                    elif report.reported_user:
                        reported_type = "user"
                        reported_id = str(report.reported_user.id)
                    elif report.auction:
                        reported_type = "bid"
                        reported_id = str(report.auction.id)
                    elif report.exhibit:
                        reported_type = "artwork"  # Map exhibit to artwork for frontend compatibility
                        reported_id = str(report.exhibit.id)

                    # Map category to frontend reportType
                    category_mapping = {
                        "inappropriate": "offensive",
                        "harassment": "offensive", 
                        "hate_speech": "offensive",
                        "copyright": "plagiarism",
                        "plagiarism": "plagiarism",
                        "fraud": "fraud",
                        "spam": "spam",
                        "fake": "fraud",
                        "scam": "fraud"
                    }
                    
                    report_type = category_mapping.get(report.category.lower() if report.category else "", "other")

                    # Format date
                    date_reported = report.created_at.strftime("%Y-%m-%d") if report.created_at else "Unknown"
                    
                    report_data = {
                        "id": str(report.id),
                        "reportType": report_type,
                        "reportedId": reported_id,
                        "reportedType": reported_type,
                        "reportedBy": str(report.user.id) if report.user else "unknown",
                        "status": status_mapping.get(report.status, "pending"),
                        "dateReported": date_reported,
                        "description": report.description or "No description provided",
                        "additional_info": report.additional_info,
                        "issue_details": report.issue_details
                    }
                    reports_data.append(report_data)
                except Exception as report_error:
                    # Skip this report and continue with the next one
                    continue

            return Response(
                {
                    "reports": reports_data,
                    "total": len(reports_data)
                },
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ModeratorReportUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, report_id):
        # Ensure only moderators and admins can access
        try:
            user_role = getattr(request.user, "role", None)
            if user_role not in ["Admin", "Moderator"]:
                return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

            # Get the report
            try:
                report = Report.objects.get(id=report_id)
            except Report.DoesNotExist:
                return Response({"detail": "Report not found"}, status=status.HTTP_404_NOT_FOUND)

            # Get new status from request
            new_status = request.data.get('status')
            if not new_status:
                return Response({"detail": "Status is required"}, status=status.HTTP_400_BAD_REQUEST)

            # Map frontend status to backend status
            status_mapping = {
                "pending": "Pending",
                "investigating": "In Progress",
                "resolved": "Resolved",
                "dismissed": "Dismissed"
            }

            backend_status = status_mapping.get(new_status)
            if not backend_status:
                return Response({"detail": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)

            # Update the report
            report.status = backend_status
            report.save()

            return Response(
                {
                    "message": "Report status updated successfully",
                    "report_id": str(report.id),
                    "new_status": new_status
                },
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
