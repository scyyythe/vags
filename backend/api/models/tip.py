from mongoengine import Document, ReferenceField, FloatField, DateTimeField
from datetime import datetime
from .users import User

class Tip(Document):
    sender = ReferenceField(User, required=True, reverse_delete_rule=2)  
    receiver = ReferenceField(User, required=True, reverse_delete_rule=2)  
    amount = FloatField(required=True, min_value=0.1)  
    timestamp = DateTimeField(default=datetime.utcnow) 

    meta = {'collection': 'donations'} 
