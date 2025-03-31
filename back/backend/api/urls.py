from django.urls import path
from .views.artwork_views import ArtCreateView, ArtListView,ArtUpdateView, ArtDeleteView, ArtDetailView
from .views.user_views import RetrieveUserView, UpdateUserView, DeleteUserView
from .views.filter import ArtSearchAndFilterView
from api.views.interaction import CommentCreateView, LikeCreateView, CartItemCreateView, CartItemDeleteView,CartRetrieveView
from api.views.tip_views import TipCreateView, TipListView, TotalTipsView, TipReceivedListView
from api.views.report_view import ReportCreateView, ReportStatusView, UserReportsView, ReportDeleteView,ReportUpdateView
from api.views.admin_report import AdminUpdateReportStatusView, AdminReportsListView
from api.views.bid_views import PlaceBidView, BidHistoryView, AuctionListView, CloseAuctionView, ActiveAuctionsView, HighestBidView,CreateAuctionView
urlpatterns = [
    # user urls
    path('user/<str:pk>/', RetrieveUserView.as_view(), name='retrieve_user'),
    path('user/<str:pk>/update/', UpdateUserView.as_view(), name='update_user'),
    path('user/<str:pk>/delete/', DeleteUserView.as_view(), name='delete_user'),
    
    # artwork url
    path("art/create/", ArtCreateView.as_view(), name="art-create"),
    path('art/list/', ArtListView.as_view(), name='list_art'),
    path('art/<str:pk>/', ArtDetailView.as_view(), name='detail_art'),
    path('art/<str:pk>/update/', ArtUpdateView.as_view(), name='update_art'),
    path('art/<str:pk>/delete/', ArtDeleteView.as_view(), name='delete_art'),
    
    # interactions
    path('comments/', CommentCreateView.as_view(), name='comment-create'),
    path('likes/', LikeCreateView.as_view(), name='like-create'),
    
    # search/filter
    path('artworks/search/', ArtSearchAndFilterView.as_view(), name='artwork_search_filter'),
    
    # cart
    path('artworks/cart/', CartItemCreateView.as_view(), name='cart_item_create'),
    path('artworks/cart/owned/', CartRetrieveView.as_view(), name='retrieve_cart'),
    path('artworks/cart/remove/', CartItemDeleteView.as_view(), name='cart_item_remove'),
    
    # tips
    path('tips/', TipListView.as_view(), name='all-tips'),  
    path('tip/', TipCreateView.as_view(), name='create-tip'),  
    path('tips/received/<str:username>/', TipReceivedListView.as_view(), name='tips-received'), 
    path('tips/total/<str:username>/', TotalTipsView.as_view(), name='total-tips'),  
    
  # auctions
    path('auction/', AuctionListView.as_view(), name='auction_list'),
    path('auction/create/', CreateAuctionView.as_view(), name='create_auction'),
    path('auction/active/', ActiveAuctionsView.as_view(), name='active_auctions'),
    path('auction/close/<str:artwork_id>/', CloseAuctionView.as_view(), name='close_auction'),
    
    # bidding
    path('bid/', PlaceBidView.as_view(), name='place_bid'),
    path('bid/history/<str:artwork_id>/', BidHistoryView.as_view(), name='bid_history'),
    path('auction/highest_bid/<str:artwork_id>/', HighestBidView.as_view(), name='highest_bid'),
  
    # user report
    path('reports/create/', ReportCreateView.as_view(), name='report_create'),
    path('reports/user/', UserReportsView.as_view(), name='user_reports'),
    path('reports/pending/', AdminUpdateReportStatusView.as_view(), name='admin_pending_reports'),
    path('reports/<str:pk>/', ReportStatusView.as_view(), name='report_status'),
    path('reports/<str:pk>/delete/', ReportDeleteView.as_view(), name='report_delete'),
    path('reports/<str:pk>/update/', ReportUpdateView.as_view(), name='report_update'),
  # admin report
   path('admin/reports/', AdminReportsListView.as_view(), name='admin_reports_list'),
    path('admin/reports/<str:pk>/update/', AdminUpdateReportStatusView.as_view(), name='admin_update_report_status'),
    
]
