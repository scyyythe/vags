from mongoengine import (
    Document, StringField, ReferenceField, BooleanField, DateTimeField
)
from datetime import datetime

class Address(Document):
    user = ReferenceField("User", required=True, reverse_delete_rule=2) 
    name = StringField(required=True)  
    address = StringField(required=True)  
    city = StringField(required=True)
    state = StringField(required=True)
    country = StringField(default="Philippines")
    postal_code = StringField(required=True)
    phone = StringField(required=True)
    is_default = BooleanField(default=False)

    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    def save(self, *args, **kwargs):
        self.updated_at = datetime.utcnow()
        return super(Address, self).save(*args, **kwargs)
