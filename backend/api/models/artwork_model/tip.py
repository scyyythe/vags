from mongoengine import Document,ReferenceField,FloatField,DateTimeField,StringField
from datetime import datetime
from ..user_model.users import User

class Tip(Document):
    sender = ReferenceField(User, required=True, reverse_delete_rule=2)
    receiver = ReferenceField(User, required=True, reverse_delete_rule=2)
    amount = FloatField(required=True, min_value=0.1)
    currency = StringField(default="PHP")  
    payment_method = StringField(required=True, choices=["PayPal", "Stripe", "GCash"])
    payment_status = StringField(default="Pending", choices=["Pending", "Completed", "Failed"])
    transaction_id = StringField()  
    timestamp = DateTimeField(default=datetime.utcnow)

    meta = {'collection': 'donations'}
