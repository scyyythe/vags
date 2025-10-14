from mongoengine import (
    Document, StringField, ReferenceField, ListField,
    DateTimeField, BooleanField, FileField, ValidationError,CASCADE,URLField,IntField,DictField
)
from datetime import datetime
from api.models.user_model.users import User
from api.models.artwork_model.artwork import Art  

class Exhibit(Document):
    title = StringField(max_length=100, required=True)
    description = StringField(max_length=2000)
    tags = ListField(StringField(), required=False)
    banner=URLField(required=False)  
    owner = ReferenceField(User, required=True)
    exhibit_type=StringField(choices=['Solo', 'Collaborative'])
    collaborators = ListField(ReferenceField(User), default=[])
    artworks = ListField(ReferenceField(Art), required=False)
    category = StringField(max_length=100)
    visibility = StringField(choices=['Public', 'Private', 'Pending','Deleted','Archived','Hidden'], default='Pending')
    start_time = DateTimeField(required=True)
    end_time = DateTimeField(required=True)
    chosen_env = IntField(required=False, null=True)
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    viewed_by = ListField(ReferenceField(User, reverse_delete_rule=CASCADE), default=[])
    slot_owner_map = DictField(default={})
    slot_artwork_map = DictField(default={})

    meta = {
        'collection': 'exhibits',
        'indexes': [
            'owner',
            'visibility', 
            'start_time',
            'exhibit_type',
            'chosen_env',
            'created_at',
            ('owner', 'visibility'),  # Compound index for user's exhibits
            ('visibility', 'start_time'),  # For public exhibits sorted by time
            ('exhibit_type', 'visibility'),  # For filtering collaborative exhibits
            ('collaborators', 'visibility'),  # For collaborator queries
            ('owner', 'visibility', 'start_time'),  # Optimized for user exhibit lists
        ]
    }

