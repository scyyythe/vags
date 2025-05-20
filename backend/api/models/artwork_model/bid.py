from mongoengine import Document, ReferenceField, FloatField, DateTimeField, BooleanField, ListField,StringField
from datetime import datetime
from api.models.user_model.users import User
from api.models.artwork_model.artwork import Art
from enum import Enum
from datetime import datetime
from django.utils.timesince import timesince
from mongoengine import DoesNotExist
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
    RE_AUCTIONED="reauctioned"
class Auction(Document):
    artwork = ReferenceField(Art, required=True)
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
        from api.models.interaction_model.notification import Notification
        if self.status in [AuctionStatus.SOLD.value, AuctionStatus.CLOSED.value, AuctionStatus.NO_BIDDER.value]:
            return  

        now = datetime.utcnow()

        try:
            artwork = self.artwork  
        except DoesNotExist:
            return  

        if self.bid_history:
            highest = max(self.bid_history, key=lambda bid: bid.amount)
            self.highest_bid = highest
            self.status = AuctionStatus.SOLD.value
            self.save()

          
            artwork.art_status = "Sold"
            artwork.save()

            time_elapsed = timesince(now).split(',')[0] + " ago"

            Notification.objects.create(
                user=highest.bidder,
                message=f" Congratulations! You won the auction for '{artwork.title}' with a bid of ${highest.amount:.2f}.",
                art=artwork,
                name=highest.bidder.username,
                action="won the auction",
                icon="🏆",
                date=now,
                money=True,
                amount=str(highest.amount),
            )

            Notification.objects.create(
                user=artwork.artist,
                message=f"Your artwork '{artwork.title}' was sold to {highest.bidder.username} for ${highest.amount:.2f}.",
                art=artwork,
                name=artwork.artist.username,
                action="sold your artwork",
                icon="💰",
                date=now,
                money=True,
                amount=str(highest.amount),
            )
        else:
            self.status = AuctionStatus.CLOSED.value
            self.save()
           
            artwork.art_status = "Active"
            artwork.save()




    @classmethod
    def create_auction(cls, artwork_id, start_time, end_time, start_bid_amount):
        
        auction = cls(
            artwork=Art.objects.get(id=artwork_id),
            start_bid_amount=start_bid_amount,
            start_time=start_time,
            end_time=end_time,
            status=AuctionStatus.ON_GOING.value
        )
        auction.save()
        return auction
