from django.urls import path
from api.views.interaction_views.interaction import CommentCreateView, LikeCreateView, CartItemCreateView, CartItemDeleteView, CartRetrieveView

interaction_urlpatterns = [
    path('comments/', CommentCreateView.as_view(), name='comment-create'),
    path('likes/', LikeCreateView.as_view(), name='like-create'),
    path('artworks/cart/', CartItemCreateView.as_view(), name='cart_item_create'),
    path('artworks/cart/remove/', CartItemDeleteView.as_view(), name='cart_item_remove'),
    path('artworks/cart/owned/', CartRetrieveView.as_view(), name='retrieve_cart'),
]
