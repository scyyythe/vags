from mongoengine import Document, StringField, ReferenceField, DateTimeField, BooleanField
from datetime import datetime
from api.models.user_model.users import User
from api.models.artwork_model.artwork import Art
from api.models.artwork_model.bid import Auction
from api.models.exhibit_model.exhibit import Exhibit
class Notification(Document):
    # Existing fields
    user = ReferenceField(User, required=True)
    actor = ReferenceField(User) 

    message = StringField(required=False)
    art = ReferenceField(Art, required=False)
    auction = ReferenceField(Auction, required=False)
    exhibit=ReferenceField(Exhibit,required=False)
    created_at = DateTimeField(default=datetime.utcnow)
    is_read = BooleanField(default=False)

    
    time = StringField(required=False)  
    date = DateTimeField(required=False) 

    avatar = StringField(required=False)
    name = StringField(required=False)
    action = StringField(required=False)
    target = StringField(required=False)
    icon = StringField(required=False)
    amount = StringField(required=False)
    forAmount = StringField(required=False)
    token = StringField(required=False)
    link = StringField(required=False)
    donation = StringField(required=False)
    money = BooleanField(default=False)
    check = BooleanField(default=False) 

    meta = {'collection': 'notifications'}
    