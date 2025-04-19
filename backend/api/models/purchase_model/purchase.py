from mongoengine import Document, ReferenceField, DateTimeField, FloatField, BooleanField
from datetime import datetime
from ..user_model.users import User
from ..artwork_model.artwork import Art


class Purchase(Document):
    buyer = ReferenceField(User, required=True)   # The user who bought the artwork
    art = ReferenceField(Art, required=True)      # The artwork purchased
    price = FloatField(required=True)             # Final price at purchase
    purchased_at = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'purchases',
        'indexes': [
            ('buyer', 'art')
        ]
    }
    


