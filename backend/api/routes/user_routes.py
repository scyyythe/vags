from django.urls import path
from api.views.user_views.user_views import (
    RetrieveUserView, UpdateUserDetailsView, UpdateUserView,
    DeleteUserView, ListAllUsersView, BlockUserView, UnblockUserView
)
from api.views.user_views.top_sellers_view import TopSellersAPIView
user_urlpatterns = [
     path('top-sellers/', TopSellersAPIView.as_view(), name='top-sellers'),

    path('user/<str:pk>/', RetrieveUserView.as_view(), name='retrieve_user'),
    path('user/<str:pk>/update/', UpdateUserView.as_view(), name='update_user'),
    path('user/<str:pk>/delete/', DeleteUserView.as_view(), name='delete_user'),
    path('users/<str:user_id>/update/', UpdateUserDetailsView.as_view(), name='update-user'),
    path('users/', ListAllUsersView.as_view(), name='list_users'),

    
    path('user/<str:user_id>/block/', BlockUserView.as_view(), name='block_user'),
    path('user/<str:user_id>/unblock/', UnblockUserView.as_view(), name='unblock_user'),


]
