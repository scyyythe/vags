from mongoengine import (
    Document, ReferenceField, StringField, IntField,
    ListField, DateTimeField
)
from datetime import datetime
from api.models.user_model.users import User
from api.models.artwork_model.artwork import Art
from api.models.purchase_model.order import PurchasedArtwork 


class Review(Document):
    reviewer = ReferenceField(User, required=True)
    artwork = ReferenceField(Art, required=True)
    purchase = ReferenceField(PurchasedArtwork, required=True)
    
    rating = IntField(min_value=1, max_value=5, required=True)
    comment = StringField()
    photos = ListField(StringField())  # store image URLs
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    meta = {"collection": "artwork_reviews"}

    def save(self, *args, **kwargs):
        self.updated_at = datetime.utcnow()
        return super(Review, self).save(*args, **kwargs)
