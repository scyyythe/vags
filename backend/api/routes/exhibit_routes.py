from django.urls import path
from api.views.exhibit_views.exhibit import (
    ExhibitCreateView, ExhibitUpdateView,ExhibitListView, ExhibitCardDetailView,
    ToggleHideExhibitView,ToggleVisibilityExhibitView,ExhibitCardListView,MyExhibitCardListView,PublishExhibitView,DeleteExhibitView,UserExhibitCardListView,BulkUnhideExhibitsView,RestoreExhibitView,RestoreAllExhibitsView
)
from api.views.exhibit_views.exhibit_invite import (
    ExhibitInvitationCreateView, ExhibitInvitationListView
)
from api.views.exhibit_views.exhibit_contribution import (
    ExhibitContributionCreateView, ExhibitContributionListView,SubmitCollaboratorContributionView
)
from api.views.exhibit_views.pending_exhibit_requests import MyPendingExhibitRequestView
from api.views.exhibit_views.exhibit_review_view import ExhibitReviewView
from api.views.exhibit_views.collaborator_exhibit_view import CollaboratorExhibitView
exhibit_urlpatterns = [
    # === EXHIBIT MANAGEMENT ===
    # List operations (most frequently accessed first)
    path('exhibits/cards/', ExhibitCardListView.as_view(), name='exhibit-card-list'),
    path('exhibits/my/', MyExhibitCardListView.as_view(), name='my-exhibit-card-list'),
    path('exhibits/user/<str:user_id>/', UserExhibitCardListView.as_view(), name='user-exhibit-card-list'),
    
    # Bulk operations (before parameterized routes)
    path('exhibits/bulk-unhide/', BulkUnhideExhibitsView.as_view(), name='bulk_unhide_exhibits'),
    path('exhibits/restore-all/', RestoreAllExhibitsView.as_view(), name='restore-all-exhibits'),
    
    # CRUD operations
    path('exhibits/', ExhibitListView.as_view(), name='exhibit-list'),
    path('exhibits/create/', ExhibitCreateView.as_view(), name='exhibit-create'),
    path('exhibits/<str:pk>/update/', ExhibitUpdateView.as_view(), name='exhibit-update'),
    path('exhibits/<str:exhibit_id>/', ExhibitCardDetailView.as_view(), name='exhibit-card'),
    
    # === EXHIBIT ACTIONS ===
    # State management
    path("exhibits/<str:exhibit_id>/publish/", PublishExhibitView.as_view(), name="publish-exhibit"),
    path("exhibits/<str:exhibit_id>/toggle-visibility/", ToggleVisibilityExhibitView.as_view(), name="toggle-visibility-exhibit"),
    path("exhibits/<str:exhibit_id>/toggle-hide/", ToggleHideExhibitView.as_view(), name="toggle-hide-exhibit"),
    path("exhibits/<str:exhibit_id>/delete/", DeleteExhibitView.as_view(), name="delete-exhibit"),
    path("exhibits/<str:exhibit_id>/restore/", RestoreExhibitView.as_view(), name="restore-exhibit"),
    
    # === COLLABORATION & CONTRIBUTIONS ===
    path("exhibit/my-pending-requests/", MyPendingExhibitRequestView.as_view(), name="my-pending-requests"),
    path("exhibits/<str:exhibit_id>/review/", ExhibitReviewView.as_view(), name="exhibit-review"),
    path("exhibits/<str:exhibit_id>/collaborator-view/", CollaboratorExhibitView.as_view(), name="collaborator-exhibit-view"),
    path("exhibits/<str:exhibit_id>/contribute/", SubmitCollaboratorContributionView.as_view(), name="submit-collaborator-contributions"),
    
    # === CONTRIBUTIONS MANAGEMENT ===
    path('exhibit-contributions/', ExhibitContributionListView.as_view(), name='exhibit-contribution-list'),
    path('exhibit-contributions/create/', ExhibitContributionCreateView.as_view(), name='exhibit-contribution-create'),
    
    # === INVITATIONS ===
    path('exhibit-invitations/', ExhibitInvitationListView.as_view(), name='exhibit-invitation-list'),
    path('exhibit-invitations/create/', ExhibitInvitationCreateView.as_view(), name='exhibit-invitation-create'),
]
