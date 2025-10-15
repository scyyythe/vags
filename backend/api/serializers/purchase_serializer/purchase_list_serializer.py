
from rest_framework import serializers
from api.models.purchase_model.order import PurchasedArtwork
from api.models.artwork_model.artwork import Art
from api.models.payment_model.payment_accounts import PaymentAccount
from api.models.user_model.users import User
from bson import ObjectId

class ArtworkDetailSerializer(serializers.Serializer):
    id = serializers.CharField()
    title = serializers.CharField()
    image_url = serializers.ListField(child=serializers.URLField())
    price = serializers.FloatField()
    size = serializers.CharField()
    medium = serializers.CharField()
    category = serializers.CharField()
    edition = serializers.CharField()
    year_created = serializers.CharField(required=False, allow_blank=True)
    quantity = serializers.IntegerField(required=False)
    artist_id = serializers.SerializerMethodField()
    artist_name = serializers.SerializerMethodField()
    default_paypal_email = serializers.SerializerMethodField()
    
    def __init__(self, *args, **kwargs):
        # Pre-fetch payment accounts to avoid N+1 queries
        self.payment_accounts = kwargs.pop('payment_accounts', {})
        super().__init__(*args, **kwargs)
    
    def get_default_paypal_email(self, obj):
        """
        Returns the default PayPal account email for the artist, if exists
        Uses pre-fetched payment accounts to avoid N+1 queries
        """
        if not obj.artist:
            return None
        
        artist_id = str(obj.artist.id)
        return self.payment_accounts.get(artist_id)
        
    def get_artist_id(self, obj):
        return str(obj.artist.id) if obj.artist else None
        
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
    artwork = ArtworkDetailSerializer() 
    shipping_address = ShippingSnapshotViewSerializer()
    payment_method = serializers.CharField()
    is_paid = serializers.BooleanField()
    quantity = serializers.IntegerField()
    total_price = serializers.FloatField()
    status = serializers.CharField()
    created_at = serializers.DateTimeField()
    updated_at = serializers.DateTimeField()

class SoldArtworkSerializer(serializers.Serializer):
    """
    Optimized serializer for sold artworks with pre-fetched related data
    """
    id = serializers.CharField()
    artwork_id = serializers.CharField()
    artwork_title = serializers.CharField()
    artwork_image = serializers.CharField()
    artist_id = serializers.CharField()
    price = serializers.FloatField()
    quantity = serializers.IntegerField()
    payment_method = serializers.CharField()
    is_paid = serializers.BooleanField()
    status = serializers.CharField()
    buyer_id = serializers.CharField()
    buyer_name = serializers.CharField()
    shipping_address = serializers.DictField()
    created_at = serializers.DateTimeField()
    updated_at = serializers.DateTimeField()
    artwork_size = serializers.CharField(required=False, allow_blank=True)
    artwork_medium = serializers.CharField(required=False, allow_blank=True)
    artwork_style = serializers.CharField(required=False, allow_blank=True)
    artwork_edition = serializers.CharField(required=False, allow_blank=True)
    artwork_year_created = serializers.CharField(required=False, allow_blank=True)
    review = serializers.DictField(required=False, allow_null=True)
