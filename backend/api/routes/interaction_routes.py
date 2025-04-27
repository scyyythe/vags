from django.urls import path
from api.views.interaction_views.interaction import CommentCreateView, LikeCreateView, CartItemCreateView, CartItemDeleteView, CartRetrieveView,SavedCreateView,LikeListView, SavedListView,CommentListView

interaction_urlpatterns = [
    path('comments/', CommentCreateView.as_view(), name='comment-create'),
    path('likes/', LikeCreateView.as_view(), name='like-create'),
    path('saved/', SavedCreateView.as_view(), name='saved-art'),
    path('likes/<str:art_id>/', LikeListView.as_view(), name='like-list'),
    path('comments/<str:art_id>/', CommentListView.as_view(), name='comment-list-for-art'),
    path('saved/<str:art_id>/', SavedListView.as_view(), name='like-list'),
    path('artworks/cart/', CartItemCreateView.as_view(), name='cart_item_create'),
    path('artworks/cart/remove/', CartItemDeleteView.as_view(), name='cart_item_remove'),
    path('artworks/cart/owned/', CartRetrieveView.as_view(), name='retrieve_cart'),
]
