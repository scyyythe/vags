from django.urls import path
from api.views.exhibit_views.exhibit import (
    ExhibitCreateView, ExhibitListView, ExhibitCardDetailView, ExhibitCardListView,MyExhibitCardListView
)
from api.views.exhibit_views.exhibit_invite import (
    ExhibitInvitationCreateView, ExhibitInvitationListView
)
from api.views.exhibit_views.exhibit_contribution import (
    ExhibitContributionCreateView, ExhibitContributionListView
)

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
]
