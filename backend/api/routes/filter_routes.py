from django.urls import path
from api.views.querries.filter import ArtSearchAndFilterView

filter_urlpatterns = [
    path('artworks/search/', ArtSearchAndFilterView.as_view(), name='artwork_search_filter'),
]
