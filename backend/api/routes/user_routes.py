# api/urls/user_urls.py
from django.urls import path
from api.views.user_views.user_views import (
    RetrieveUserView, UpdateUserDetailsView, UpdateUserView,
    DeleteUserView, ListAllUsersView, BlockUserView, UnblockUserView
)
from api.views.user_views.deactivate_view import DeactivateAccountView
from api.views.user_views.top_sellers_view import TopSellersAPIView,TopArtworksAPIView,PopularArtistsAPIView
from api.views.user_views.address_view import AddressViewSet,DefaultAddressView,SetDefaultAddressView
from api.views.user_views.user_views import SessionListView, SessionDeleteView
from api.views.user_views.social_views import  DeleteSocialView,SocialsView
user_urlpatterns = [
    path('top-sellers/', TopSellersAPIView.as_view(), name='top-sellers'),
    path("top-artworks/", TopArtworksAPIView.as_view(), name="top-artworks"),
    path("popular-artists/", PopularArtistsAPIView.as_view(), name="popular-artists"),


    path("sessions/", SessionListView.as_view(), name="sessions"),
    path("sessions/<str:session_id>/", SessionDeleteView.as_view(), name="session-delete"),
    
    path('user/<str:pk>/', RetrieveUserView.as_view(), name='retrieve_user'),
    path('user/<str:pk>/update/', UpdateUserView.as_view(), name='update_user'),
    path('user/<str:pk>/delete/', DeleteUserView.as_view(), name='delete_user'),
    path('users/<str:user_id>/update/', UpdateUserDetailsView.as_view(), name='update-user'),
    path('users/', ListAllUsersView.as_view(), name='list_users'),

    path('user/<str:user_id>/block/', BlockUserView.as_view(), name='block_user'),
    path('user/<str:user_id>/unblock/', UnblockUserView.as_view(), name='unblock_user'),
    path('users/<str:user_id>/deactivate/', DeactivateAccountView.as_view(), name='deactivate_user'),

    # Address routes
    path('address/', AddressViewSet.as_view({'get': 'list', 'post': 'create'}), name='address-list-create'),
    path('address/<str:pk>/', AddressViewSet.as_view({'get': 'retrieve', 'patch': 'partial_update', 'delete': 'destroy'}), name='address-detail'),
    path('address/<str:pk>/edit/', AddressViewSet.as_view({'patch': 'partial_update'}), name='address-edit'),
    path('address/<str:address_id>/set-default/', SetDefaultAddressView.as_view(), name='set-default-address'),
    path('address-default/', DefaultAddressView.as_view(), name='default-address'),
    
    # social routes 
    path("users/<str:user_id>/socials/", SocialsView.as_view(), name="socials"),
    path("socials/<str:social_id>/delete/", DeleteSocialView.as_view(), name="delete-social"),

]
