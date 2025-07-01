from django.urls import path
from api.views.artwork_views.artwork_views import  ArtCardListView,SellArtworkView,BulkArtDetailView,PopularLightweightArtView,ArtBulkListView,DeletePermanentArtwork,UnArchivedArtwork,ArchivedArtwork,RestoreArtwork,DeleteArtwork,ArtListViewSpecificUser,UnHideArtworkView,HideArtworkView,ArtCreateView, ArtListView,ArtworksByArtistView, ArtDetailView, ArtUpdateView, ArtListByArtistView,ArtDeleteView,ArtListViewOwner
from api.views.artwork_views.artwork_detail_view import MarketplaceArtDetailView

artwork_urlpatterns = [
     # sell
    path("art/sell/",  SellArtworkView.as_view(), name="art-sell"),
    path("art/cards/", ArtCardListView.as_view(), name="art-card-list"),
    path("art/marketplace/<str:pk>/", MarketplaceArtDetailView.as_view(), name="marketplace-art-detail"),

    path("art/create/", ArtCreateView.as_view(), name="art-create"),
    path('art/list/', ArtListView.as_view(), name='list_art'),
    path("art/popular/light/", PopularLightweightArtView.as_view(), name="popular_art_light"),
    path('art/list/bulk/', ArtBulkListView.as_view(), name='list_ar_bulk'),
     
    path('art/list/artist/<str:artist_id>/', ArtworksByArtistView.as_view(), name='my_list_art'),
    path('art/list/created-by-me/', ArtListViewOwner.as_view(), name='list_art_owner'),
    path('art/list/specific-user/', ArtListViewSpecificUser.as_view(), name='specific-user'),
    path('art/by-artist/<str:artist_id>/', ArtListByArtistView.as_view(), name='list_art_by_artist'),
    
    path('art/bulk/', BulkArtDetailView.as_view(), name='bulk_art_detail'),
    path('art/<str:pk>/', ArtDetailView.as_view(), name='detail_art'),
   

    path('art/<str:pk>/update/', ArtUpdateView.as_view(), name='update_art'),
    
    path('art/<str:pk>/hide/',HideArtworkView.as_view(), name='hide_art'),
    path('art/<str:pk>/unhide/',UnHideArtworkView.as_view(), name='unhide_art'),
    
    path('art/<str:pk>/delete-art/',DeleteArtwork.as_view(), name='deleting_art'),
    path('art/<str:pk>/restore/',RestoreArtwork.as_view(), name='restore'),
    path('art/<str:pk>/delete/', DeletePermanentArtwork.as_view(), name='delete-permanent-artwork'),
    
    path('art/<str:pk>/archived/',ArchivedArtwork.as_view(), name='archived_art'),
    path('art/<str:pk>/unarchived/',UnArchivedArtwork.as_view(), name='archived_art'),
    
   
]
