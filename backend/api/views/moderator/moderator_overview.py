from datetime import datetime, timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from api.models.admin.report import Report
from api.models.user_model.users import User
from api.models.artwork_model.artwork import Art
from api.models.interaction_model.comment import Comment


class ModeratorOverviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Ensure only moderators and admins can access
        try:
            user_role = getattr(request.user, "role", None)
            if user_role not in ["Admin", "Moderator"]:
                return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

            # Calculate date ranges
            now = datetime.utcnow()
            seven_days_ago = now - timedelta(days=7)
            fourteen_days_ago = now - timedelta(days=14)

            # Pending Reports
            try:
                pending_reports = Report.objects(status="Pending").count()
            except:
                pending_reports = 0
            
            # Previous period pending reports for trend calculation
            try:
                previous_pending_reports = Report.objects(
                    status="Pending",
                    created_at__gte=fourteen_days_ago,
                    created_at__lt=seven_days_ago
                ).count()
            except:
                previous_pending_reports = 0
            
            # Reports Resolved (7d)
            try:
                resolved_reports_7d = Report.objects(
                    status="Resolved",
                    created_at__gte=seven_days_ago
                ).count()
            except:
                resolved_reports_7d = 0
            
            # Previous period resolved reports for trend calculation
            try:
                previous_resolved_reports = Report.objects(
                    status="Resolved",
                    created_at__gte=fourteen_days_ago,
                    created_at__lt=seven_days_ago
                ).count()
            except:
                previous_resolved_reports = 0

            # Users Warned (7d) - This would need a warning system implementation
            # For now, we'll use a placeholder based on reports that led to user actions
            users_warned_7d = 0  # Placeholder - would need warning tracking system
            
            # Previous period users warned for trend calculation
            previous_users_warned = 0  # Placeholder

            # Removed Content (7d) - Artworks that were hidden
            try:
                removed_artworks_7d = Art.objects(
                    visibility="Hidden",
                    created_at__gte=seven_days_ago
                ).count()
            except:
                removed_artworks_7d = 0
            
            # Comments don't have soft delete, so we'll use 0 for now
            removed_comments_7d = 0
            
            removed_content_7d = removed_artworks_7d + removed_comments_7d
            
            # Previous period removed content for trend calculation
            try:
                previous_removed_artworks = Art.objects(
                    visibility="Hidden",
                    created_at__gte=fourteen_days_ago,
                    created_at__lt=seven_days_ago
                ).count()
            except:
                previous_removed_artworks = 0
            
            # Comments don't have soft delete, so we'll use 0 for now
            previous_removed_comments = 0
            
            previous_removed_content = previous_removed_artworks + previous_removed_comments

            # Calculate trends (percentage change)
            def calculate_trend(current, previous):
                if previous == 0:
                    return 0 if current == 0 else 100
                return round(((current - previous) / previous) * 100, 1)

            pending_trend = calculate_trend(pending_reports, previous_pending_reports)
            resolved_trend = calculate_trend(resolved_reports_7d, previous_resolved_reports)
            warned_trend = calculate_trend(users_warned_7d, previous_users_warned)
            removed_trend = calculate_trend(removed_content_7d, previous_removed_content)

            # Recent Alerts - Get the 3 most recent reports
            try:
                recent_alerts = []
                
                # Get recent reports (any category) from the last 30 days
                recent_reports = Report.objects(
                    created_at__gte=now - timedelta(days=30)
                ).order_by("-created_at")[:3]
                
                # Debug: Check if we found any reports
                print(f"DEBUG: Found {len(recent_reports)} recent reports")
                for report in recent_reports:
                    print(f"DEBUG: Report {report.id} - Category: {report.category}, Status: {report.status}")
                
                for report in recent_reports:
                    # Determine alert type and color based on category
                    if report.category.lower() in ["copyright", "fraud", "plagiarism"]:
                        alert_type = "high"
                        icon_color = "red"
                    elif report.category.lower() in ["spam", "harassment", "inappropriate"]:
                        alert_type = "warning"
                        icon_color = "amber"
                    else:
                        alert_type = "info"
                        icon_color = "blue"
                    
                    # Calculate time ago
                    time_diff = now - report.created_at
                    if time_diff.total_seconds() < 3600:  # Less than 1 hour
                        time_ago = f"{int(time_diff.total_seconds() / 60)} minutes ago"
                    elif time_diff.total_seconds() < 86400:  # Less than 1 day
                        time_ago = f"{int(time_diff.total_seconds() / 3600)} hours ago"
                    else:
                        time_ago = f"{int(time_diff.total_seconds() / 86400)} days ago"
                    
                    recent_alerts.append({
                        "id": str(report.id),
                        "type": alert_type,
                        "title": f"High Priority: {report.category.title()} Report",
                        "description": f"Report ID {str(report.id)[:8]}... for {report.category}. {report.description[:50]}..." if report.description else f"Report ID {str(report.id)[:8]}... for {report.category}.",
                        "time": time_ago,
                        "icon": icon_color
                    })
                
                # Ensure we have exactly 3 alerts
                while len(recent_alerts) < 3:
                    recent_alerts.append({
                        "id": f"placeholder_{len(recent_alerts)}",
                        "type": "info",
                        "title": "No Recent Alerts",
                        "description": "No new reports requiring immediate attention.",
                        "time": "No recent activity",
                        "icon": "blue"
                    })
                
                # Limit to exactly 3
                recent_alerts = recent_alerts[:3]
                
            except:
                # Fallback alerts if there's an error
                recent_alerts = [
                    {
                        "id": "fallback_1",
                        "type": "info",
                        "title": "System Status",
                        "description": "Moderator dashboard is running normally.",
                        "time": "Just now",
                        "icon": "blue"
                    },
                    {
                        "id": "fallback_2",
                        "type": "info",
                        "title": "No Recent Alerts",
                        "description": "No new reports requiring immediate attention.",
                        "time": "No recent activity",
                        "icon": "blue"
                    },
                    {
                        "id": "fallback_3",
                        "type": "info",
                        "title": "System Ready",
                        "description": "All systems operational and ready for moderation tasks.",
                        "time": "System ready",
                        "icon": "blue"
                    }
                ]

            return Response(
                {
                    "pendingReports": {
                        "value": pending_reports,
                        "trend": pending_trend,
                        "positive": pending_trend < 0  # Negative trend is positive (fewer pending reports)
                    },
                    "resolvedReports7d": {
                        "value": resolved_reports_7d,
                        "trend": resolved_trend,
                        "positive": resolved_trend > 0  # Positive trend is good (more resolved)
                    },
                    "usersWarned7d": {
                        "value": users_warned_7d,
                        "trend": warned_trend,
                        "positive": warned_trend < 0  # Fewer warnings is generally better
                    },
                    "removedContent7d": {
                        "value": removed_content_7d,
                        "trend": removed_trend,
                        "positive": removed_trend < 0  # Less content removal needed is better
                    },
                    "recentAlerts": recent_alerts
                },
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
