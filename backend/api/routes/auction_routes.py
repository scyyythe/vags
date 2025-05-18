from django.urls import path
from api.views.artwork_views.bid_views import AuctionListViewOwner,AuctionListViewSpecificUser,AuctionCreateView,AuctionListView, ActiveAuctionsView, CloseAuctionView,AuctionDetailView,MyAuctionListView


auction_urlpatterns = [
    path('auction/create/', AuctionCreateView.as_view(), name='create_auction'),
    path('auction/', AuctionListView.as_view(), name='auction_list'),  
    path('auction/my/', MyAuctionListView.as_view(), name='auction_my_list'),  
    path('auction/<str:auction_id>/', AuctionDetailView.as_view(), name='auction_detail'),
    path('auction/active/', ActiveAuctionsView.as_view(), name='active_auctions'),
    path('auction/close/<str:artwork_id>/', CloseAuctionView.as_view(), name='close_auction'),
    
    path('auction/list/created-by-me/', AuctionListViewOwner.as_view(), name='list_art_owner'),
    path('auction/list/specific-user/', AuctionListViewSpecificUser.as_view(), name='specific-user'),
    
]
