
from rest_framework import serializers
from api.models.purchase_model.order import PurchasedArtwork
from api.models.artwork_model.artwork import Art

class ArtworkMiniSerializer(serializers.Serializer):
    id = serializers.CharField()
    title = serializers.CharField()
    image_url = serializers.ListField(child=serializers.URLField())
    price = serializers.FloatField()
    artist_name = serializers.SerializerMethodField()

    def get_artist_name(self, obj):
        return f"{obj.artist.first_name} {obj.artist.last_name}" if obj.artist else "Unknown"


class ShippingSnapshotViewSerializer(serializers.Serializer):
    name = serializers.CharField()
    address = serializers.CharField()
    city = serializers.CharField()
    state = serializers.CharField()
    country = serializers.CharField()
    postal_code = serializers.CharField()
    phone = serializers.CharField()

class PurchasedArtworkListSerializer(serializers.Serializer):
    id = serializers.CharField()
    artwork = ArtworkMiniSerializer()
    shipping_address = ShippingSnapshotViewSerializer()
    payment_method = serializers.CharField()
    is_paid = serializers.BooleanField()
    quantity = serializers.IntegerField()
    total_price = serializers.FloatField()
    status = serializers.CharField()
    created_at = serializers.DateTimeField()
