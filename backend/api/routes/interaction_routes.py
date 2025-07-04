from django.urls import path
from api.views.interaction_views.interaction import ArtworkBulkStatusView,SavedArtworksListView,CommentCreateView,LikeStatusView,ArtworkStatusView,LikeCreateView,SavedStatusView, CartItemCreateView, CartItemDeleteView, CartRetrieveView,SavedCreateView,LikeListView, SavedListView,CommentListView
from api.views.interaction_views.follow import RemoveFollowerView,FollowedArtworksView,FollowingListView,FollowCreateView,UnfollowView,FollowerListView,FollowStatsView,CheckFollowStatusView,FollowCountsView
from api.views.interaction_views.notifications import NotificationDeleteView,NotificationListView, NotificationDetailView,NotificationDeleteAllView
from api.views.interaction_views.comment_views import CommentListCreateView,CommentRepliesView
interaction_urlpatterns = [
    path('comments/', CommentCreateView.as_view(), name='comment-create'),
    path('likes/<str:art_id>/', LikeCreateView.as_view(), name='like-create'),
    path('auction-likes/<str:auction_id>/', LikeCreateView.as_view(), name='like-create-auction'),
    path('exhibit-likes/<str:exhibit_id>/', LikeCreateView.as_view(), name="exhibit-create-like"),

    path('saved/<str:art_id>/status/', SavedStatusView.as_view()),
    path('saved/<str:art_id>/', SavedCreateView.as_view(), name='saved-art'),
    path('saved/', SavedArtworksListView.as_view(), name='saved-artwork'),
    path('likes/<str:art_id>/count/', LikeListView.as_view(), name='like-list'),
    path('likes/<str:art_id>/status/', LikeStatusView.as_view()),
    
    path('artworks/<str:art_id>/status/', ArtworkStatusView.as_view(), name='artwork-status'),
    path("artworks/statuses/", ArtworkBulkStatusView.as_view(), name="artwork-bulk-status"),

    path('comments/<str:art_id>/', CommentListView.as_view(), name='comment-list-for-art'),
    path('artworks/<str:artwork_id>/comments/', CommentListCreateView.as_view(), name='artwork-comments'),
    path('comments/<str:comment_id>/replies/', CommentRepliesView.as_view(), name='comment-replies'),


    path('saved/<str:art_id>/view/', SavedListView.as_view(), name='like-list'),
    path('artworks/cart/', CartItemCreateView.as_view(), name='cart_item_create'),
    path('artworks/cart/remove/', CartItemDeleteView.as_view(), name='cart_item_remove'),
    path('artworks/cart/owned/', CartRetrieveView.as_view(), name='retrieve_cart'),
    
    path('follow/', FollowCreateView.as_view(), name='follow-create'), 
    path('unfollow/', UnfollowView.as_view(), name='unfollow'),
    path('followers/', FollowerListView.as_view(), name='follower-list'),
    path('following/', FollowingListView.as_view(), name='following-list'),
    path('followers/remove/', RemoveFollowerView.as_view(), name='remove-follower'),
    
    path('follow/stats/', FollowStatsView.as_view(), name='follow-stats'),
    path('check-follow-status/', CheckFollowStatusView.as_view(), name='check-follow-status'),
    path('follow-counts/<str:pk>/', FollowCountsView.as_view(), name='follow-counts'),
    path('artworks/following/', FollowedArtworksView.as_view(), name='followed-artworks'),

    path('notifications/', NotificationListView.as_view(), name='notification-list'),  
    path('notifications/<int:pk>/', NotificationDetailView.as_view(), name='notification-detail'),
    path('notifications/<str:pk>/delete/', NotificationDeleteView.as_view(), name='notification-delete'),
    path('notifications/delete-all/', NotificationDeleteAllView.as_view(), name='notifications-delete-all')
]
