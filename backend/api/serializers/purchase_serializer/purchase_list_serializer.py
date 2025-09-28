
from rest_framework import serializers
from api.models.purchase_model.order import PurchasedArtwork
from api.models.artwork_model.artwork import Art
from api.models.payment_model.payment_accounts import PaymentAccount

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
    artist_name = serializers.SerializerMethodField()
    default_paypal_email = serializers.SerializerMethodField() 
    
    def get_default_paypal_email(self, obj):
        """
        Returns the default PayPal account email for the artist, if exists
        """
        if not obj.artist:
            return None
        try:
            account = PaymentAccount.objects.get(
                user=obj.artist,
                type="paypal",
                is_default=True
            )
            return account.account_info
        except PaymentAccount.DoesNotExist:
            return None
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
    
