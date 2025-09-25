from mongoengine import Document, StringField, BooleanField, DictField, ReferenceField, DateTimeField
from datetime import datetime

class PaymentAccount(Document):
    user = ReferenceField('User', required=True)
    type = StringField(required=True, choices=['paypal', 'bank', 'gcash', 'payoneer', 'stripe', 'card'])
    name = StringField(required=True) 
    account_info = StringField(required=True) 
    is_default = BooleanField(default=False)
    details = DictField() 
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
