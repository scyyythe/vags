from django.urls import path
from api.views.artwork_views.artwork_views import (ArtCardListView,SellArtworkView,UpdateArtworkView,DeleteArtworkImageView,UserArtCardListView,
UpdateArtworkVisibilityView,MyArtCardListView,BulkArtDetailView,PopularLightweightArtView,ArtBulkListView,
DeletePermanentArtwork,UnArchivedArtwork,ArchivedArtwork,RestoreArtwork,DeleteArtwork,ArtListViewSpecificUser,
UnHideArtworkView,HideArtworkView,BulkUnhideArtworksView,UserArtworksWithHiddenView,ArtCreateView, ArtListView,ArtworksByArtistView, ArtDetailView, ArtUpdateView, 
ArtListByArtistView,ArtDeleteView,ArtListViewOwner)
from api.views.artwork_views.artwork_detail_view import MarketplaceArtDetailView
from api.views.artwork_views.wishlist_view import ToggleWishlistView,WishlistArtView,WishlistIDListView,MyWishlistView
from api.views.artwork_views.artwork_trending_view import TrendingArtworksView
artwork_urlpatterns = [
     # sell
    path("art/sell/",  SellArtworkView.as_view(), name="art-sell"),
    path("art/update/<str:pk>/", UpdateArtworkView.as_view(), name="art-update"),
    path('art/<str:pk>/images/<int:image_index>/', DeleteArtworkImageView.as_view(), name='delete-art-image'),
       
    path("art/cards/", ArtCardListView.as_view(), name="art-card-list"),
    path("art/cards/my/", MyArtCardListView.as_view(), name="my-art-cards"),
    path("art/cards/user/<str:user_id>/", UserArtCardListView.as_view(), name="user-art-cards"),
    path("art/marketplace/<str:pk>/", MarketplaceArtDetailView.as_view(), name="marketplace-art-detail"),
    path("trending-artworks/", TrendingArtworksView.as_view(), name="trending-artworks"),
    
    path("wishlist/toggle/<str:art_id>/", ToggleWishlistView.as_view(), name="toggle-wishlist"),
    path("wishlist/my-ids/", WishlistIDListView.as_view(), name="wishlist-my-ids"),
    path("art/wishlist/", WishlistArtView.as_view(), name="wishlist-art"),
    path('wishlist/my/', MyWishlistView.as_view(), name='my-wishlist-artworks'),

    path("art/create/", ArtCreateView.as_view(), name="art-create"),
    path('art/list/', ArtListView.as_view(), name='list_art'),
    path("art/popular/light/", PopularLightweightArtView.as_view(), name="popular_art_light"),
    path('art/list/bulk/', ArtBulkListView.as_view(), name='list_ar_bulk'),
     
    path('art/list/artist/<str:artist_id>/', ArtworksByArtistView.as_view(), name='my_list_art'),
    path('art/list/created-by-me/', ArtListViewOwner.as_view(), name='list_art_owner'),
    path('art/list/specific-user/', ArtListViewSpecificUser.as_view(), name='specific-user'),
    path('art/list/user-with-hidden/', UserArtworksWithHiddenView.as_view(), name='art-list-user-with-hidden'),
    path('art/by-artist/<str:artist_id>/', ArtListByArtistView.as_view(), name='list_art_by_artist'),
    
    path('art/bulk/', BulkArtDetailView.as_view(), name='bulk_art_detail'),
    # Bulk operations should come before parameterized routes to avoid conflicts
    path('art/bulk-unhide/', BulkUnhideArtworksView.as_view(), name='bulk_unhide_artworks'),
    path('art/<str:pk>/', ArtDetailView.as_view(), name='detail_art'),
   

    path('art/<str:pk>/update/', ArtUpdateView.as_view(), name='update_art'),

    path('art/<str:pk>/hide/',HideArtworkView.as_view(), name='hide_art'),
    path('art/<str:pk>/unhide/',UnHideArtworkView.as_view(), name='unhide_art'),
    
    path('art/<str:pk>/update-visibility/', UpdateArtworkVisibilityView.as_view(), name='update_art_visibility'),
    
    path('art/<str:pk>/delete-art/',DeleteArtwork.as_view(), name='deleting_art'),
    path('art/<str:pk>/restore/',RestoreArtwork.as_view(), name='restore'),
    path('art/<str:pk>/delete/', DeletePermanentArtwork.as_view(), name='delete-permanent-artwork'),
    
    path('art/<str:pk>/archived/',ArchivedArtwork.as_view(), name='archived_art'),
    path('art/<str:pk>/unarchived/',UnArchivedArtwork.as_view(), name='archived_art'),
    
   
]
