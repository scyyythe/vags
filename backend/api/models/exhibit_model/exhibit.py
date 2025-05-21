from mongoengine import (
    Document, StringField, ReferenceField, ListField,
    DateTimeField, BooleanField, FileField, ValidationError,CASCADE,URLField
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
    visibility = StringField(choices=['Public', 'Private', 'Pending'], default='Pending')
    start_time = DateTimeField(required=True)
    end_time = DateTimeField(required=True)
    chosen_env=StringField(choices=['4 Slots', '6 Slots', '9 Slots'])
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    viewed_by = ListField(ReferenceField(User, reverse_delete_rule=CASCADE), default=[])

    meta = {
        'collection': 'exhibits',
        'indexes': ['owner', 'visibility', 'start_time']
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
