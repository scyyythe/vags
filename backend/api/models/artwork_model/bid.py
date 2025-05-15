from mongoengine import Document, ReferenceField, FloatField, DateTimeField, BooleanField, ListField,StringField
from datetime import datetime
from api.models.user_model.users import User
from api.models.artwork_model.artwork import Art
from enum import Enum
class Bid(Document):
    bidder = ReferenceField(User, required=True, reverse_delete_rule=2)
    artwork = ReferenceField(Art, required=True, reverse_delete_rule=2)
    amount = FloatField(required=True, min_value=0.1)
    timestamp = DateTimeField(default=datetime.utcnow)
    
    identity_type = StringField(
        required=True,
        choices=("anonymous", "username", "fullName")
    )

class AuctionStatus(Enum):
    ON_GOING = "on_going"
    SOLD = "sold"
    CLOSED = "closed"
    NO_BIDDER = "no_bidder"

class Auction(Document):
    artwork = ReferenceField(Art, required=True, unique=True)
    start_bid_amount = FloatField(required=True, min_value=0.1)
    start_time = DateTimeField(required=True)
    end_time = DateTimeField(required=True)
    highest_bid = ReferenceField(Bid, required=False)
    
    
    status = StringField(
        choices=[status.value for status in AuctionStatus],
        default=AuctionStatus.ON_GOING.value
    )
    
    bid_history = ListField(ReferenceField(Bid))

    def close_auction(self):
        """Close the auction and determine final status."""
        if self.bid_history:
            self.status = AuctionStatus.SOLD.value
        else:
            self.status = AuctionStatus.NO_BIDDER.value
        self.save()

    @classmethod
    def create_auction(cls, artwork_id, start_time, end_time, start_bid_amount):
        """Create a new auction with default status 'on_going'."""
        auction = cls(
            artwork=Art.objects.get(id=artwork_id),
            start_bid_amount=start_bid_amount,
            start_time=start_time,
            end_time=end_time,
            status=AuctionStatus.ON_GOING.value
        )
        auction.save()
        return auction
