from django.urls import path
from api.views.admin.admin_report import AdminUpdateReportStatusView, AdminReportsListView
from api.views.admin.admin_overview import AdminOverviewView
from api.views.admin.admin_transactions import AdminTransactionsView
from api.views.moderator.moderator_overview import ModeratorOverviewView
from api.views.moderator.flagged_content import FlaggedContentView
from api.views.moderator.moderator_reports import ModeratorReportsView, ModeratorReportUpdateView
from api.views.moderator.recently_resolved import RecentlyResolvedView
from api.views.moderator.content_moderation import ContentModerationActionView
from api.views.admin.actions import PromoteUserView,DemoteUserView,SuspendUserView,BanUserView,UnbanUserView,ReinstateUserView
from api.views.admin_views.create_user_view import AdminCreateUserView

admin_urlpatterns = [

    path('admin/reports/', AdminReportsListView.as_view(), name='admin_reports_list'),
    path('admin/reports/<str:pk>/update/', AdminUpdateReportStatusView.as_view(), name='admin_update_report_status'),
    
    # create user (admin only)
    path('admin/users/create/', AdminCreateUserView.as_view(), name='admin-create-user'),
    
    # promote and demote user
    path('user/<str:user_id>/promote/', PromoteUserView.as_view(), name='promote-user'),
    path('user/<str:user_id>/demote/', DemoteUserView.as_view(), name='demote-user'),
    
    # suspend user
    path('user/<str:user_id>/suspend/', SuspendUserView.as_view(), name='demote-user'),
    path('user/<str:user_id>/reinstate/', ReinstateUserView.as_view(), name='reinstate-user'),
    
    # ban user
    path('user/<str:user_id>/ban/', BanUserView.as_view(), name='ban-user'),
    path('user/<str:user_id>/unban/', UnbanUserView.as_view(), name='unban-user'),
    
    # admin overview metrics
    path('admin/overview/', AdminOverviewView.as_view(), name='admin-overview'),
    # moderator overview metrics
    path('moderator/overview/', ModeratorOverviewView.as_view(), name='moderator-overview'),
    # moderator flagged content
    path('moderator/flagged-content/', FlaggedContentView.as_view(), name='moderator-flagged-content'),
    # moderator reports
    path('moderator/reports/', ModeratorReportsView.as_view(), name='moderator-reports'),
    path('moderator/reports/<str:report_id>/update/', ModeratorReportUpdateView.as_view(), name='moderator-report-update'),
    # moderator recently resolved
    path('moderator/recently-resolved/', RecentlyResolvedView.as_view(), name='moderator-recently-resolved'),
    # moderator content moderation actions
    path('moderator/content-moderation/', ContentModerationActionView.as_view(), name='moderator-content-moderation'),
    # admin transactions
    path('admin/transactions/', AdminTransactionsView.as_view(), name='admin-transactions'),
]
