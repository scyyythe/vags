from rest_framework import serializers
from api.models.artwork_model.bid import Bid, Auction
from datetime import datetime, timezone
from api.models.artwork_model.artwork import Art
from mongoengine.errors import DoesNotExist
from api.serializers.artwork_s.artwork_serializers import ArtSerializer

class BidSerializer(serializers.Serializer):
    bidderFullName = serializers.SerializerMethodField()
    artwork_id = serializers.CharField(write_only=True)
    amount = serializers.FloatField()
    timestamp = serializers.DateTimeField(read_only=True)
    identity_type = serializers.ChoiceField(choices=["anonymous", "username", "fullName"], required=True)

    def get_bidderFullName(self, obj):
        return f"{obj.bidder.first_name} {obj.bidder.last_name}".strip()

    def create(self, validated_data):
        bidder = self.context['request'].user
        artwork_id = validated_data.pop('artwork_id')

        try:
            artwork = Art.objects.get(id=artwork_id)
        except DoesNotExist:
            raise serializers.ValidationError({"error": "Artwork not found."})

        try:
            auction = Auction.objects.get(artwork=artwork, status=True)
        except DoesNotExist:
            raise serializers.ValidationError({"error": "Auction not found or has ended."})

        auction_end = auction.end_time
        if auction_end.tzinfo is None or auction_end.tzinfo.utcoffset(auction_end) is None:
            auction_end = auction_end.replace(tzinfo=timezone.utc)

        now_utc = datetime.now(timezone.utc)

        if auction_end < now_utc:
            auction.close_auction()
            raise serializers.ValidationError({"error": "This auction has ended."})

        current_highest_bid = auction.highest_bid
        new_bid_amount = validated_data['amount']

        if current_highest_bid:
            is_current_bidder_highest = current_highest_bid.bidder == bidder
            if is_current_bidder_highest:
                # Bidder is already highest, so new bid must be strictly higher than their current highest bid
                if new_bid_amount <= current_highest_bid.amount:
                    raise serializers.ValidationError(
                        {"error": "Your new bid must be higher than your current highest bid."}
                    )
            else:
                # Bidder is NOT highest, so bid must be higher than the current highest bid
                if new_bid_amount <= current_highest_bid.amount:
                    raise serializers.ValidationError(
                        {"error": "Bid must be higher than the current highest bid."}
                    )

        # Create the bid
        bid = Bid.objects.create(
            bidder=bidder,
            artwork=auction.artwork,
            amount=new_bid_amount,
            identity_type=validated_data['identity_type']
        )
        auction.highest_bid = bid
        auction.bid_history.append(bid)
        auction.save()

        return bid





class AuctionSerializer(serializers.Serializer):
    id = serializers.CharField()
    artwork = ArtSerializer(read_only=True)
    artwork_id = serializers.CharField(write_only=True)
    start_bid_amount = serializers.FloatField()
    start_time = serializers.DateTimeField()
    end_time = serializers.DateTimeField()
    highest_bid = BidSerializer(read_only=True)
    bid_history = BidSerializer(read_only=True, many=True)  
    status = serializers.BooleanField(read_only=True)



