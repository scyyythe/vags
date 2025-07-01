from mongoengine import Document, StringField, IntField, DateTimeField, ReferenceField, URLField,ListField
from datetime import datetime
from ..user_model.users import User  

class Art(Document):
    title = StringField(max_length=100)
    artist = ReferenceField(User, required=True)
    category = StringField(max_length=100)
    medium = StringField(max_length=100)
    art_status = StringField(max_length=100)
    
    # New fields for selling
    price = IntField(required=True)
    edition = StringField(max_length=50,required=False)  # e.g., "1 of 10", "Original"
    year_created = StringField(max_length=10, required=False)  # Optional: can be "2023", "2021", etc.
    
    # Optional fields
    size = StringField(max_length=100)
    description = StringField()
    
    # Now allow multiple images
    image_url = ListField(URLField(), required=False)
    quantity=IntField(required=False)
    # Visibility control
    visibility = StringField(
        choices=['Public', 'Private', 'Hidden', 'Unlisted', 'Deleted', 'Archived'],
        default='Public'
    )

    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    meta = {'collection': 'art'}

    def save(self, *args, **kwargs):
        print("DEBUG: Saving Art Object =", self.to_json()) 
        super().save(*args, **kwargs)
        print("DEBUG: Art Saved Successfully")