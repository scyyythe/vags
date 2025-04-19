from mongoengine import Document, ReferenceField, DateTimeField
from datetime import datetime
from ..user_model.users import User


class Follower(Document):
    follower = ReferenceField(User, required=True) 
    following = ReferenceField(User, required=True)  
    followed_at = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'followers',
        'indexes': [
            {'fields': ('follower', 'following'), 'unique': True}, 
        ]
    }
