from rest_framework import generics
from api.models.artwork_model.artwork import Art
from api.models.review_model.review import Review 
from api.serializers.artwork_s.artwork_serializers import ArtCardSerializer

class TrendingArtworksView(generics.ListAPIView):
    serializer_class = ArtCardSerializer

    def get_queryset(self):
        trending_ids = []
        trending_artworks = []

        for art in Art.objects.filter(art_status="onSale"):
            reviews = Review.objects(artwork=art)
            if not reviews:
                continue

            avg_rating = sum([r.rating for r in reviews]) / len(reviews)
            if 3 <= avg_rating <= 5:
                trending_ids.append(art.id)
                trending_artworks.append((art, avg_rating))


        trending_artworks.sort(key=lambda tup: tup[1], reverse=True)

     
        return [art for art, avg in trending_artworks]
