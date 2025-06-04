from django.urls import path
from api.views.admin.admin_report import AdminUpdateReportStatusView, AdminReportsListView
from api.views.admin.actions import PromoteUserView,DemoteUserView,SuspendUserView
admin_urlpatterns = [

    path('admin/reports/', AdminReportsListView.as_view(), name='admin_reports_list'),
    path('admin/reports/<str:pk>/update/', AdminUpdateReportStatusView.as_view(), name='admin_update_report_status'),
    
    # promote and demote user
    path('user/<str:user_id>/promote/', PromoteUserView.as_view(), name='promote-user'),
    path('user/<str:user_id>/demote/', DemoteUserView.as_view(), name='demote-user'),
    
    # suspend user
    path('user/<str:user_id>/suspend/', SuspendUserView.as_view(), name='demote-user'),
]
