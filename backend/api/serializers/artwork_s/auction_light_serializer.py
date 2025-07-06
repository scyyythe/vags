from rest_framework import serializers
from api.models.artwork_model.bid import AuctionStatus
from api.models.artwork_model.bid import Auction
from api.models.artwork_model.artwork import Art

class LightBidderSerializer(serializers.Serializer):
    bidderFullName = serializers.SerializerMethodField()
    amount = serializers.FloatField()
    timestamp = serializers.DateTimeField()

    def get_bidderFullName(self, obj):
        identity = getattr(obj, 'identity_type', 'anonymous')
        if identity == "anonymous":
            return "Anonymous"
        elif identity == "username":
            return getattr(obj.bidder, "username", "Unknown")
        elif identity == "fullName":
            first = getattr(obj.bidder, "first_name", "")
            last = getattr(obj.bidder, "last_name", "")
            return f"{first} {last}".strip() or getattr(obj.bidder, "username", "Unknown")
        return "Unknown"

class LightArtworkSerializer(serializers.Serializer):
    id = serializers.CharField()
    title = serializers.CharField()
    image_url = serializers.CharField()

class LightweightAuctionCardSerializer(serializers.Serializer):  # <-- renamed
    id = serializers.CharField()
    artwork = LightArtworkSerializer()
    start_bid_amount = serializers.FloatField()
    start_time = serializers.DateTimeField()
    end_time = serializers.DateTimeField()
    status = serializers.CharField()
    highest_bid = LightBidderSerializer(read_only=True)
