from mongoengine import Document, ReferenceField, DateTimeField, StringField, BooleanField
from datetime import datetime

class Ban(Document):
    user = ReferenceField('User', required=True, reverse_delete_rule=2) 
    banned_by = ReferenceField('User', required=False) 
    reason = StringField(max_length=500, required=False)
    is_permanent = BooleanField(default=True)
    start_date = DateTimeField(default=datetime.utcnow)
    end_date = DateTimeField(required=False) 
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {
        'indexes': ['user', 'start_date', 'end_date']
    }
