from mongoengine import Document, ReferenceField, DateTimeField
from datetime import datetime
from api.models.user_model.users import User
from api.models.artwork_model.artwork import Art

class Wishlist(Document):
    user = ReferenceField(User, required=True)
    art = ReferenceField(Art, required=True)
    added_at = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'wishlist',
        'indexes': [
            {'fields': ['user', 'art'], 'unique': True},  
        ]
    }
