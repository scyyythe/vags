from mongoengine import Document, StringField, ReferenceField, IntField, DateTimeField
from datetime import datetime
from ..user_model.users import User
from ..artwork_model.artwork import Art
from ..exhibit_model.exhibit import Exhibit
from ..artwork_model.bid import Auction

class Comment(Document):
    content = StringField()
    user = ReferenceField(User)  
    art = ReferenceField(Art) 
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    meta = {'collection': 'comments'}


class Like(Document):
    user = ReferenceField(User)  
    art = ReferenceField(Art, required=False, null=True) 
    auction = ReferenceField(Auction, required=False, null=True)
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {'collection': 'likes'}
    
class LikeExhibit(Document):
    user = ReferenceField(User)  
    exhibit = ReferenceField(Exhibit) 
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {'collection': 'exhibit_likes'}
    
class Saved(Document):
    user = ReferenceField(User, required=True)
    art = ReferenceField(Art, required=True)
    created_at = DateTimeField(default=lambda: datetime.utcnow())
    updated_at = DateTimeField(default=lambda: datetime.utcnow())

    meta = {
        'collection': 'saved',
        'indexes': [
            {'fields': ('user', 'art'), 'unique': True},
        ]
    }

    def save(self, *args, **kwargs):
        self.updated_at = datetime.utcnow()  
        return super().save(*args, **kwargs)
    
    
class CartItem(Document):
    user = ReferenceField(User, required=True)  
    art = ReferenceField(Art, required=True) 
    quantity = IntField(default=1)
    added_at = DateTimeField(default=datetime.utcnow)  

    meta = {'collection': 'cart_items'}
