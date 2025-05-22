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
        
        if artwork.artist==bidder:
            raise serializers.ValidationError({"error": "You cannot bid on your own artwork."})
        
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
              
                raise serializers.ValidationError(
                    {"error": "You are currently the highest bidder."}
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
    viewers = serializers.SerializerMethodField()
    def get_viewers(self, obj):
        return [user.username for user in obj.viewed_by]
    def to_representation(self, instance):
        data = super().to_representation(instance)
        user = self.context.get("request").user

        # Existing serializations
        data['artwork'] = ArtSerializer(instance.artwork).data
        data['highest_bid'] = (
            BidSerializer(instance.highest_bid).data if instance.highest_bid else None
        )
        data['bid_history'] = BidSerializer(instance.bid_history, many=True).data

        if user and not user.is_anonymous:
            user_id = str(user.id)

            # Did user join?
            data['joinedByCurrentUser'] = any(
                str(bid.bidder.id) == user_id for bid in instance.bid_history
            )

            # Is user the highest bidder?
            data['isHighestBidder'] = (
                instance.highest_bid and str(instance.highest_bid.bidder.id) == user_id
            )

            # Did user lose the auction?
            data['isLost'] = (
                instance.status == AuctionStatus.CLOSED.value and
                data['joinedByCurrentUser'] and
                not data['isHighestBidder']
            )
        else:
            data['joinedByCurrentUser'] = False
            data['isHighestBidder'] = False
            data['isLost'] = False

        return data



