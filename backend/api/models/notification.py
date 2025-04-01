from mongoengine import Document, StringField, ReferenceField, DateTimeField, BooleanField
from datetime import datetime
from api.models.users import User
from api.models.artwork import Art

class Notification(Document):
    user = ReferenceField(User, required=True) 
    message = StringField(required=True)  
    art = ReferenceField(Art, required=False)  
    created_at = DateTimeField(default=datetime.utcnow)
    is_read = BooleanField(default=False)  

    meta = {'collection': 'notifications'}
