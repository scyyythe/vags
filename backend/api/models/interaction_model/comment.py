

from datetime import datetime
from api.models.artwork_model.artwork import Art
from api.models.user_model.users import User

from mongoengine import (
    Document, StringField, DateTimeField, ReferenceField,
    IntField, ListField,MapField
)
from datetime import datetime
from django.utils.timezone import now
class Comment(Document):
    user = ReferenceField(User, required=True)
    text = StringField(required=True, max_length=2000)
    likes = IntField(default=0)

    emoji_reactions = MapField(field=IntField(), default=dict)
    content_type = StringField(choices=["artwork", "auction", "exhibit"], required=True)
    object_id = StringField(required=True)  

    parent = ReferenceField('self', null=True)  
    replies = ListField(ReferenceField('self'))

    created_at = DateTimeField(default=now)

    meta = {"collection": "comments"}
