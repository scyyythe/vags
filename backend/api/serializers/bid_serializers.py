from rest_framework import serializers
from api.models.bid import Bid, Auction
from datetime import datetime

class BidSerializer(serializers.Serializer):
    bidder_username = serializers.CharField(source='bidder.username', read_only=True)
    bidder_full_name = serializers.SerializerMethodField()
    artwork = serializers.CharField()
    amount = serializers.FloatField()
    timestamp = serializers.DateTimeField(read_only=True)

    def get_bidder_full_name(self, obj):
        return f"{obj.bidder.first_name} {obj.bidder.last_name}".strip()

    def create(self, validated_data):
        bidder = self.context['request'].user  
        artwork_id = validated_data.pop('artwork')

        try:
            auction = Auction.objects.get(artwork=artwork_id, status=True)
        except Auction.DoesNotExist:
            raise serializers.ValidationError({"error": "Auction not found or closed."})

        # Check if the auction is expired
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
    artwork = serializers.CharField(source='artwork.title', read_only=True)
    start_time = serializers.DateTimeField()
    end_time = serializers.DateTimeField()
    highest_bid = BidSerializer(read_only=True)
    status = serializers.BooleanField()
