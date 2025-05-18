from rest_framework import serializers
from api.models.artwork_model.bid import Bid, Auction
from api.models.artwork_model.bid import AuctionStatus
from datetime import datetime, timezone
from api.models.artwork_model.artwork import Art
from mongoengine.errors import DoesNotExist
from api.serializers.artwork_s.artwork_serializers import ArtSerializer
from api.serializers.user_s.users_serializers import UserSerializer
class BidSerializer(serializers.Serializer):
    user = UserSerializer(source="bidder", read_only=True) 
    bidderFullName = serializers.SerializerMethodField()
    artwork_id = serializers.CharField(write_only=True, required=False)
    amount = serializers.FloatField()
    timestamp = serializers.DateTimeField(read_only=True)
    identity_type = serializers.ChoiceField(choices=["anonymous", "username", "fullName"], required=True)

    def get_bidderFullName(self, obj):
        identity = obj.identity_type
        if identity == "anonymous":
            return "Anonymous"
        elif identity == "username":
            return getattr(obj.bidder, "username", "Unknown User")
        elif identity == "fullName":
            full_name = f"{getattr(obj.bidder, 'first_name', '')} {getattr(obj.bidder, 'last_name', '')}".strip()
            return full_name if full_name else getattr(obj.bidder, "username", "Unknown User")
        else:
            return "Unknown"

    def create(self, validated_data):
        bidder = self.context['request'].user
        artwork_id = validated_data.pop('artwork_id')

        try:
            artwork = Art.objects.get(id=artwork_id)
        except DoesNotExist:
            raise serializers.ValidationError({"error": "Artwork not found."})

        try:
           auction = Auction.objects.get(artwork=artwork, status=AuctionStatus.ON_GOING.value)
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
                
                if new_bid_amount <= current_highest_bid.amount:
                    raise serializers.ValidationError(
                        {"error": "Your new bid must be higher than your current highest bid."}
                    )
            else:
                
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
    start_bid_amount = serializers.FloatField()
    start_time = serializers.DateTimeField()
    end_time = serializers.DateTimeField()
    highest_bid = BidSerializer(read_only=True)
    bid_history = BidSerializer(read_only=True, many=True)
    status = serializers.CharField(read_only=True)

    def to_representation(self, instance):
        data = super().to_representation(instance)

        
        data['artwork'] = ArtSerializer(instance.artwork).data

        
        if instance.highest_bid:
            data['highest_bid'] = BidSerializer(instance.highest_bid).data
        else:
            data['highest_bid'] = None

        
        data['bid_history'] = BidSerializer(instance.bid_history, many=True).data

        return data


