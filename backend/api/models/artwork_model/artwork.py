from mongoengine import Document, StringField, IntField, DateTimeField, ReferenceField, URLField
from datetime import datetime
from ..user_model.users import User  

class Art(Document):
    title = StringField(max_length=100)
    artist = ReferenceField(User) 
    category = StringField(max_length=100)
    medium = StringField(max_length=100)
    art_status = StringField(max_length=100)
    price = IntField()
    size = StringField(max_length=100, required=False)
    description = StringField(required=False)
    visibility = StringField(choices=['Public', 'Private', 'Hidden','Unlisted'], default='Public') 
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    image_url = URLField(required=False)  

    meta = {'collection': 'art'}

    def save(self, *args, **kwargs):
        print("DEBUG: Saving Art Object =", self.to_json()) 
        super().save(*args, **kwargs)
        print("DEBUG: Art Saved Successfully")
