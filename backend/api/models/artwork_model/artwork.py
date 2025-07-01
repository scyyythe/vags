from mongoengine import (
    Document, StringField, IntField, DateTimeField, ReferenceField,
    URLField, ListField, FloatField, DateTimeField
)
from datetime import datetime
from ..user_model.users import User  


class ArtReview(Document):
    art = ReferenceField('Art', required=True)
    user = ReferenceField(User, required=True)
    score = IntField(min_value=1, max_value=5)
    comment = StringField()
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {'collection': 'art_reviews'}

class Art(Document):
    title = StringField(max_length=100)
    artist = ReferenceField(User, required=True)
    category = StringField(max_length=100)
    medium = StringField(max_length=100)
    art_status = StringField(max_length=100)

    price = IntField(required=True)
    discounted_price = IntField(required=False, default=None)  

    edition = StringField(max_length=50, required=False)
    year_created = StringField(max_length=10, required=False)
    size = StringField(max_length=100)
    description = StringField()
    image_url = ListField(URLField(), required=False)
    quantity = IntField(required=False)

    visibility = StringField(
        choices=['Public', 'Private', 'Hidden', 'Unlisted', 'Deleted', 'Archived'],
        default='Public'
    )

    average_rating = FloatField(default=0.0)
    total_ratings = IntField(default=0)

    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    meta = {'collection': 'art'}

    def save(self, *args, **kwargs):
        print("DEBUG: Saving Art Object =", self.to_json())
        super().save(*args, **kwargs)
        print("DEBUG: Art Saved Successfully")

