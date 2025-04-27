from mongoengine import (
    Document, StringField, ReferenceField, ListField,
    DateTimeField, BooleanField, FileField, ValidationError
)
from datetime import datetime
from ..user_model.users import User
from ..artwork_model.artwork import Art  

ALLOWED_IMAGE_TYPES = ('image/jpeg', 'image/png', 'image/jpg')


class Exhibit(Document):
    title = StringField(max_length=100, required=True)
    description = StringField(max_length=2000)
    tags = ListField(StringField(), required=False)
    images = ListField(FileField(content_type=ALLOWED_IMAGE_TYPES), required=True)
    
    owner = ReferenceField(User, required=True)
    collaborators = ListField(ReferenceField(User), default=[])

    
    artworks = ListField(ReferenceField(Art), required=False)

    visibility = StringField(choices=['public', 'private'], default='private')
    is_published = BooleanField(default=False)
    preview_mode = BooleanField(default=True)
    scheduled_at = DateTimeField(required=False)
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'exhibits',
        'indexes': ['owner', 'visibility', 'scheduled_at']
    }

    def clean(self):
        for img in self.images:
            if img.content_type not in ALLOWED_IMAGE_TYPES:
                raise ValidationError("Unsupported file format.")
            if img.length > 25 * 1024 * 1024:
                raise ValidationError("Image exceeds 25MB limit.")

       
        valid_contributors = {str(self.owner.id)} | {str(collab.id) for collab in self.collaborators}
        for art in self.artworks:
            if str(art.artist.id) not in valid_contributors:
                raise ValidationError(f"Artwork '{art.title}' is not owned by the exhibit owner or collaborators.")
