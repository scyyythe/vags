from rest_framework import generics
from api.models.artwork_model.artwork import Art, ArtReview
from api.serializers.artwork_s.artwork_serializers import ArtCardSerializer

class TrendingArtworksView(generics.ListAPIView):
    serializer_class = ArtCardSerializer

    def get_queryset(self):
        trending_artworks = []

      
        for art in Art.objects.filter(art_status="onSale"):
            reviews = ArtReview.objects(art=art)
            review_count = len(reviews)

            
            avg_rating = sum([r.score for r in reviews]) / review_count if review_count > 0 else 0

          
            trending_artworks.append((art, avg_rating, review_count))

      
        trending_artworks.sort(key=lambda tup: (tup[1], tup[2]), reverse=True)

      
        top_n = 10
        return [art for art, avg, count in trending_artworks[:top_n]]
