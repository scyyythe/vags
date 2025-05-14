from django.urls import path
from api.views.artwork_views.bid_views import AuctionCreateView,AuctionListView, ActiveAuctionsView, CloseAuctionView

auction_urlpatterns = [
    path('auction/', AuctionListView.as_view(), name='auction_list'),
    path('auction/create/', AuctionCreateView.as_view(), name='create_auction'),
    path('auction/active/', ActiveAuctionsView.as_view(), name='active_auctions'),
    path('auction/close/<str:artwork_id>/', CloseAuctionView.as_view(), name='close_auction'),
]
