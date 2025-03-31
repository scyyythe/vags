from mongoengine import Document, ReferenceField, FloatField, DateTimeField, BooleanField, ListField
from datetime import datetime
from api.models.users import User
from api.models.artwork import Art

class Bid(Document):
    bidder = ReferenceField(User, required=True, reverse_delete_rule=2)
    artwork = ReferenceField(Art, required=True, reverse_delete_rule=2)
    amount = FloatField(required=True, min_value=0.1)
    timestamp = DateTimeField(default=datetime.utcnow)

class Auction(Document):
    artwork = ReferenceField(Art, required=True, reverse_delete_rule=2, unique=True)
    start_time = DateTimeField(required=True)
    end_time = DateTimeField(required=True)
    highest_bid = ReferenceField(Bid, required=False, default=None)
    status = BooleanField(default=True)  
    bid_history = ListField(ReferenceField(Bid))

    def close_auction(self):
        self.status = False
        self.save()
