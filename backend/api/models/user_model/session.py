from mongoengine import Document, ReferenceField, StringField, DateTimeField, BooleanField
from datetime import datetime
from api.models.user_model.users import User

class UserSession(Document):
    user = ReferenceField(User, required=True)
    device = StringField(required=True)
    ip_address = StringField()
    user_agent = StringField()
    is_current = BooleanField(default=False)
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'user_sessions',
        'indexes': [
            'user',
            'is_current',
            'created_at',
            ('user', 'device'),
            ('user', 'created_at'),
        ]
    }