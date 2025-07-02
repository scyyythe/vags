
from mongoengine import Document, ReferenceField, StringField, DateTimeField, IntField, ListField
from datetime import datetime
from api.models.artwork_model.artwork import Art
from api.models.user_model.users import User

class Comment(Document):
    artwork = ReferenceField(Art, required=True)
    user = ReferenceField(User, required=True)
    text = StringField(required=True)
    likes = IntField(default=0)
    parent = ReferenceField('self', null=True)
    timestamp = DateTimeField(default=datetime.utcnow)

    meta = {
        'ordering': ['-timestamp']
    }
