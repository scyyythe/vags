from mongoengine import Document, ReferenceField, FloatField, DateTimeField, BooleanField, ListField,StringField,CASCADE
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
    viewed_by = ListField(ReferenceField(User, reverse_delete_rule=CASCADE), default=[])

    def close_auction(self):
        from api.models.interaction_model.notification import Notification
        from django.utils.timezone import now as dj_now

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

           
            host = request.get_host()
            protocol = "http" if "localhost" in host else "https"
            link = f"/bid/{str(auction.id)}/"

           
            Notification.objects.create(
                user=highest.bidder, 
                actor=artwork.artist,
                message=f" Congratulations! You won the auction for '{artwork.title}' with a bid of ${highest.amount:.2f}.",
                art=artwork,
                name=f"{artwork.artist.first_name} {artwork.artist.last_name}",
                action="won the auction",
                target=artwork.title,
                icon="🏆",
                amount=str(highest.amount),
                money=True,
                donation="Auction",
                link=link,
                created_at=dj_now(),
            )

           
            Notification.objects.create(
                user=artwork.artist,  
                actor=highest.bidder,
                message=f"Your artwork '{artwork.title}' was sold to {highest.bidder.username} for ${highest.amount:.2f}.",
                art=artwork,
                name=f"{highest.bidder.first_name} {highest.bidder.last_name}",
                action="bought your artwork",
                target=artwork.title,
                icon="🖼️",
                amount=str(highest.amount),
                money=True,
                donation="Auction",
                link=link,
                created_at=dj_now(),
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
