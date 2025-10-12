from django.urls import path
from api.views.artwork_views.bid_views import (
    PopularAuctionListView,
    AuctionListViewSpecificUser,
    FollowedAuctionsView,
    AuctionListViewParticipated,
    AuctionListViewOwner,
    AuctionCreateView,
    AuctionListView,
    ActiveAuctionsView,
    CloseAuctionView,
    AuctionDetailView,
    MyAuctionListView,
    ToggleHideAuctionView,
)
from api.views.artwork_views.auction_views import LightweightAuctionListView ,DeleteAuctionView,CloseAuctionViewNew

auction_urlpatterns = [
    path('auction/create/', AuctionCreateView.as_view(), name='create_auction'),
    path('auction/', AuctionListView.as_view(), name='auction_list'),  
    path("auction/popular/", PopularAuctionListView.as_view(), name="popular-auctions"),
    path('auction/my/', MyAuctionListView.as_view(), name='auction_my_list'),  
    path('auction/<str:auction_id>/', AuctionDetailView.as_view(), name='auction_detail'),
    path('auction/active/', ActiveAuctionsView.as_view(), name='active_auctions'),
    path('auction/close/<str:artwork_id>/', CloseAuctionView.as_view(), name='close_auction'),
    
    path('auction/list/created-by-me/', AuctionListViewOwner.as_view(), name='list_art_owner'),
    path('auction/list/specific-user/', AuctionListViewSpecificUser.as_view(), name='specific-user'),
    path('auction/list/participated/', AuctionListViewParticipated.as_view(), name='list_participated'),

    path("auctions/following", FollowedAuctionsView.as_view(), name="followed-auctions"),

    path("auction/light-cards/", LightweightAuctionListView.as_view(), name="light-auctions"), 
    
    path('auction/close_new/<str:auction_id>/', CloseAuctionViewNew.as_view(), name='close_auction'),
    path('auction/delete/<str:auction_id>/', DeleteAuctionView.as_view(), name='delete_auction'),
    path('auction/<str:auction_id>/toggle-hide/', ToggleHideAuctionView.as_view(), name='toggle-hide-auction'),
]
