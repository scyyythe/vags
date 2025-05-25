from django.urls import path
from api.views.admin.report_view import BulkReportStatus,ReportStatus,ReportCreateView,AuctionReportStatus, UserReportsView, ReportDeleteView, ReportUpdateView,AuctionReportCreateView
from api.views.admin.admin_report import AdminUpdateReportStatusView

report_urlpatterns = [
    path('reports/create/', ReportCreateView.as_view(), name='report_create'),
    path('reports/user/', UserReportsView.as_view(), name='user_reports'),
    path('reports/pending/', AdminUpdateReportStatusView.as_view(), name='admin_pending_reports'),
    path('reports/<str:pk>/delete/', ReportDeleteView.as_view(), name='report_delete'),
    path('reports/<str:pk>/update/', ReportUpdateView.as_view(), name='report_update'),
    path('artworks/report-status/', BulkReportStatus.as_view(), name='report-status'),


    path("auction-reports/create/", AuctionReportCreateView.as_view(), name="create-bid-report"),
    path('auction/<str:pk>/report-status/', AuctionReportStatus.as_view(), name='report-status'),
]
