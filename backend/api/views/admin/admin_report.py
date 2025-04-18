from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from api.models.admin.report import Report
from api.models.interaction_model.notification import Notification
from api.serializers.admin.report_serializers import ReportSerializer
from api.serializers.admin.admin_report_update_serializer import AdminReportUpdateSerializer
from api.auth.permissions import IsAdminOrOwner


class AdminReportsListView(generics.ListAPIView):
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated, IsAdminOrOwner]

    def get_queryset(self):
  
        return list(Report.objects.filter(status="Pending"))

class AdminUpdateReportStatusView(generics.UpdateAPIView):
    serializer_class = AdminReportUpdateSerializer
    permission_classes = [IsAdminOrOwner]

    def get_queryset(self):
        return Report.objects.all()

    def perform_update(self, serializer):
        report = serializer.save()
      
        Notification(
            user=report.user,
            message=f"The status of your report has been updated to {report.status}."
        ).save()
