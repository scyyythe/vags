from mongoengine import Document, ReferenceField, DateTimeField, FloatField, BooleanField
from datetime import datetime
from ..user_model.users import User
from ..artwork_model.artwork import Art


class Listing(Document):
    seller = ReferenceField(User, required=True)   # The user selling the artwork
    art = ReferenceField(Art, required=True)       # The artwork being listed
    listed_price = FloatField(required=True)
    listed_at = DateTimeField(default=datetime.utcnow)
    is_sold = BooleanField(default=False)
    sold_at = DateTimeField(null=True)

    meta = {
        'collection': 'listings',
        'indexes': [
            ('seller', 'art')
        ]
    }