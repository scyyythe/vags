
from rest_framework import serializers
from api.models.wishlist_model import Wishlist
from api.serializers.artwork_s.art_detail_serializer import ArtDetailSerializer

class WishlistSerializer(serializers.ModelSerializer):
    art = ArtDetailSerializer(read_only=True)

    class Meta:
        model = Wishlist
        fields = ['id', 'art', 'added_at']
