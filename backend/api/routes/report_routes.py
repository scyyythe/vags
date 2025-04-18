from django.urls import path
from api.views.admin.report_view import ReportCreateView, ReportStatusView, UserReportsView, ReportDeleteView, ReportUpdateView
from api.views.admin.admin_report import AdminUpdateReportStatusView

report_urlpatterns = [
    path('reports/create/', ReportCreateView.as_view(), name='report_create'),
    path('reports/user/', UserReportsView.as_view(), name='user_reports'),
    path('reports/pending/', AdminUpdateReportStatusView.as_view(), name='admin_pending_reports'),
    path('reports/<str:pk>/', ReportStatusView.as_view(), name='report_status'),
    path('reports/<str:pk>/delete/', ReportDeleteView.as_view(), name='report_delete'),
    path('reports/<str:pk>/update/', ReportUpdateView.as_view(), name='report_update'),

]
