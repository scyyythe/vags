from django.urls import path
from api.views.artwork_views.bid_views import PlaceBidView, BidHistoryView, HighestBidView,MyBidsAuctionListView
from api.views.artwork_views.claim_artwork import ClaimArtworkPaymentView
bid_urlpatterns = [
    path('bid/', PlaceBidView.as_view(), name='place_bid'),
    path('bid/history/<str:artwork_id>/', BidHistoryView.as_view(), name='bid_history'),
    path('auction/highest_bid/<str:artwork_id>/', HighestBidView.as_view(), name='highest_bid'),
    path('auction/my-bids/', MyBidsAuctionListView.as_view(), name='my_bids'),
    
    path("artwork/claim/", ClaimArtworkPaymentView.as_view(), name="claim_artwork_payment"),
]
