from mongoengine import Document, ReferenceField, DateTimeField, StringField
from datetime import datetime
from api.models.user_model.users import User

class HiddenContent(Document):
    user = ReferenceField(User, required=True)
    content_type = StringField(required=True, choices=['artwork', 'exhibit', 'auction'])
    content_id = StringField(required=True)  # Store the ID as string for flexibility
    hidden_at = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'hidden_content',
        'indexes': [
            {'fields': ['user', 'content_type', 'content_id'], 'unique': True},  
        ]
    }
