from django.urls import path
from api.views.interaction_views.interaction import CommentCreateView,LikeStatusView,ArtworkStatusView,LikeCreateView,SavedStatusView, CartItemCreateView, CartItemDeleteView, CartRetrieveView,SavedCreateView,LikeListView, SavedListView,CommentListView
from api.views.interaction_views.follow import FollowCreateView,UnfollowView,FollowerListView,FollowStatsView,CheckFollowStatusView
from api.views.interaction_views.notifications import NotificationDeleteView,NotificationListView, NotificationDetailView,NotificationDeleteAllView
interaction_urlpatterns = [
    path('comments/', CommentCreateView.as_view(), name='comment-create'),
    path('likes/<str:art_id>/', LikeCreateView.as_view(), name='like-create'),
    path('saved/<str:art_id>/status/', SavedStatusView.as_view()),
    path('saved/<str:art_id>/', SavedCreateView.as_view(), name='saved-art'),
    path('likes/<str:art_id>/count/', LikeListView.as_view(), name='like-list'),
    path('likes/<str:art_id>/status/', LikeStatusView.as_view()),
    path('artworks/<str:art_id>/status/', ArtworkStatusView.as_view(), name='artwork-status'),
    path('comments/<str:art_id>/', CommentListView.as_view(), name='comment-list-for-art'),
    path('saved/<str:art_id>/view/', SavedListView.as_view(), name='like-list'),
    path('artworks/cart/', CartItemCreateView.as_view(), name='cart_item_create'),
    path('artworks/cart/remove/', CartItemDeleteView.as_view(), name='cart_item_remove'),
    path('artworks/cart/owned/', CartRetrieveView.as_view(), name='retrieve_cart'),
    
    path('follow/', FollowCreateView.as_view(), name='follow-create'), 
    path('unfollow/', UnfollowView.as_view(), name='unfollow'),
    path('followers/', FollowerListView.as_view(), name='follower-list'),
    path('follow/stats/', FollowStatsView.as_view(), name='follow-stats'),
    path('check-follow-status/', CheckFollowStatusView.as_view(), name='check-follow-status'),
    
    path('notifications/', NotificationListView.as_view(), name='notification-list'),  
    path('notifications/<int:pk>/', NotificationDetailView.as_view(), name='notification-detail'),
    path('notifications/<str:pk>/delete/', NotificationDeleteView.as_view(), name='notification-delete'),
    path('notifications/delete-all/', NotificationDeleteAllView.as_view(), name='notifications-delete-all')
]
