from mongoengine import Document, ReferenceField, DateTimeField, StringField
from datetime import datetime

class Suspension(Document):
    user = ReferenceField('User', required=True, reverse_delete_rule=2)  
    start_date = DateTimeField(default=datetime.utcnow, required=True)
    end_date = DateTimeField(required=True) 
    reason = StringField(max_length=500, required=False)  
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {
        'indexes': [
            'user',
            'end_date'
        ]
    }
