from django.urls import path
from api.views.artwork_views.artwork_views import HideArtworkView,ArtCreateView, ArtListView,ArtworksByArtistView, ArtDetailView, ArtUpdateView, ArtListByArtistView,ArtDeleteView,ArtListViewOwner

artwork_urlpatterns = [
    path("art/create/", ArtCreateView.as_view(), name="art-create"),
    path('art/list/', ArtListView.as_view(), name='list_art'),
     path('art/list/artist/<str:artist_id>/', ArtworksByArtistView.as_view(), name='my_list_art'),
    path('art/list/created-by-me/', ArtListViewOwner.as_view(), name='list_art_owner'),
    path('art/by-artist/<str:artist_id>/', ArtListByArtistView.as_view(), name='list_art_by_artist'),
    path('art/<str:pk>/', ArtDetailView.as_view(), name='detail_art'),
    path('art/<str:pk>/update/', ArtUpdateView.as_view(), name='update_art'),
    path('art/<str:pk>/delete/', ArtDeleteView.as_view(), name='delete_art'),
    path('art/<str:pk>/hide/',HideArtworkView.as_view(), name='hide_art'),
]
