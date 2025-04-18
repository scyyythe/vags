from django.urls import path
from api.views.artwork_views.artwork_views import ArtCreateView, ArtListView, ArtDetailView, ArtUpdateView, ArtDeleteView

artwork_urlpatterns = [
    path("art/create/", ArtCreateView.as_view(), name="art-create"),
    path('art/list/', ArtListView.as_view(), name='list_art'),
    path('art/<str:pk>/', ArtDetailView.as_view(), name='detail_art'),
    path('art/<str:pk>/update/', ArtUpdateView.as_view(), name='update_art'),
    path('art/<str:pk>/delete/', ArtDeleteView.as_view(), name='delete_art'),
]
