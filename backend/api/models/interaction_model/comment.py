

from datetime import datetime
from api.models.artwork_model.artwork import Art
from api.models.user_model.users import User

from mongoengine import (
    Document, StringField, DateTimeField, ReferenceField,
    IntField, ListField, MapField
)
from django.utils import timezone
class Comment(Document):
    user = ReferenceField(User, required=True)
    text = StringField(required=True, max_length=2000)
    likes = IntField(default=0)
    liked_by = ListField(ReferenceField(User), default=list)

    emoji_reactions = MapField(field=IntField(), default=dict)
    content_type = StringField(choices=["artwork", "auction", "exhibit"], required=True)
    object_id = StringField(required=True)  

    parent = ReferenceField('self', null=True)  
    replies = ListField(ReferenceField('self'))

    created_at = DateTimeField(default=timezone.now)

    meta = {"collection": "comments"}
