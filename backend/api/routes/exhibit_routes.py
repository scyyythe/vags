from django.urls import path
from api.views.exhibit_views.exhibit import (
    ExhibitCreateView, ExhibitListView, ExhibitCardDetailView,
    ToggleHideExhibitView,ToggleVisibilityExhibitView,ExhibitCardListView,MyExhibitCardListView,PublishExhibitView,DeleteExhibitView
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

    path('exhibits/', ExhibitListView.as_view(), name='exhibit-list'),
    path('exhibits/create/', ExhibitCreateView.as_view(), name='exhibit-create'),
    path('exhibits/cards/', ExhibitCardListView.as_view(), name='exhibit-card-list'),
    path('exhibits/my/', MyExhibitCardListView.as_view(), name='my-exhibit-card-list'),
    path('exhibits/<str:exhibit_id>/', ExhibitCardDetailView.as_view(), name='exhibit-card'),
  

    path('exhibit-contributions/', ExhibitContributionListView.as_view(), name='exhibit-contribution-list'),
    path('exhibit-contributions/create/', ExhibitContributionCreateView.as_view(), name='exhibit-contribution-create'),

    path('exhibit-invitations/', ExhibitInvitationListView.as_view(), name='exhibit-invitation-list'),
    path('exhibit-invitations/create/', ExhibitInvitationCreateView.as_view(), name='exhibit-invitation-create'),
    
    path("exhibit/my-pending-requests/", MyPendingExhibitRequestView.as_view(), name="my-pending-requests"),
    path("exhibits/<str:exhibit_id>/review/", ExhibitReviewView.as_view(), name="exhibit-review"),
    
    path("exhibits/<str:exhibit_id>/collaborator-view/", CollaboratorExhibitView.as_view(), name="collaborator-exhibit-view"),

    path("exhibits/<str:exhibit_id>/contribute/", SubmitCollaboratorContributionView.as_view(), name="submit-collaborator-contributions"),

    path("exhibits/<str:exhibit_id>/publish/", PublishExhibitView.as_view(), name="publish-exhibit"),
    path("exhibits/<str:exhibit_id>/toggle-visibility/", ToggleVisibilityExhibitView.as_view(), name="toggle-visibility-exhibit"),
    path("exhibits/<str:exhibit_id>/toggle-hide/", ToggleHideExhibitView.as_view(), name="toggle-hide-exhibit"),
    path("exhibits/<str:exhibit_id>/delete/", DeleteExhibitView.as_view(), name="delete-exhibit"),

]
