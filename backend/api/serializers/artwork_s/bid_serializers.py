from rest_framework import serializers
from api.models.artwork_model.bid import Bid, Auction
from datetime import datetime
from api.serializers.artwork_s.artwork_serializers import ArtSerializer
class BidSerializer(serializers.Serializer):
    bidderFullName = serializers.SerializerMethodField()
    artwork_id = serializers.CharField(write_only=True)
    amount = serializers.FloatField()
    timestamp = serializers.DateTimeField(read_only=True)

    def get_bidderFullName(self, obj):
        return f"{obj.bidder.first_name} {obj.bidder.last_name}".strip()

    def create(self, validated_data):
        bidder = self.context['request'].user
        artwork_id = validated_data.pop('artwork_id')  

        try:
            auction = Auction.objects.get(artwork=artwork_id, status=True)
        except Auction.DoesNotExist:
            raise serializers.ValidationError({"error": "Auction not found or has ended."})

        if auction.end_time < datetime.utcnow():
            auction.close_auction()
            raise serializers.ValidationError({"error": "This auction has ended."})

        if auction.highest_bid and validated_data['amount'] <= auction.highest_bid.amount:
            raise serializers.ValidationError({"error": "Bid must be higher than the current highest bid."})

        bid = Bid.objects.create(bidder=bidder, artwork=auction.artwork, amount=validated_data['amount'])
        auction.highest_bid = bid
        auction.bid_history.append(bid)
        auction.save()

        return bid


class AuctionSerializer(serializers.Serializer):
    id = serializers.CharField()
    artwork = ArtSerializer(read_only=True)  
    artwork_id = serializers.CharField(write_only=True)
    start_bid_amount = serializers.FloatField(write_only=True)
    start_time = serializers.DateTimeField()
    end_time = serializers.DateTimeField()
    highest_bid = BidSerializer(read_only=True)
    status = serializers.BooleanField(read_only=True)
    


