from django.urls import path
from api.views.admin.admin_report import AdminUpdateReportStatusView, AdminReportsListView

admin_urlpatterns = [

    path('admin/reports/', AdminReportsListView.as_view(), name='admin_reports_list'),
    path('admin/reports/<str:pk>/update/', AdminUpdateReportStatusView.as_view(), name='admin_update_report_status'),
]
