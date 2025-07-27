from mongoengine import (
    Document, ReferenceField, StringField, IntField, FloatField,
    BooleanField, DateTimeField, EmbeddedDocument, EmbeddedDocumentField
)
from datetime import datetime
from api.models.user_model.users import User
from api.models.artwork_model.artwork import Art


class ShippingSnapshot(EmbeddedDocument):
    name = StringField()
    address = StringField()
    city = StringField()
    state = StringField()
    country = StringField()
    postal_code = StringField()
    phone = StringField()


class PurchasedArtwork(Document):
    buyer = ReferenceField(User, required=True)
    artwork = ReferenceField(Art, required=True)
    shipping_address = EmbeddedDocumentField(ShippingSnapshot, required=True)
    payment_method = StringField(choices=["PayPal", "GCash", "Credit Card", "Stripe"], required=True)
    is_paid = BooleanField(default=False)
    quantity = IntField(default=1)
    total_price = FloatField(required=True)
    status = StringField(choices=["Pending", "Paid", "Shipped", "Reviewed"], default="Pending")
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    meta = {"collection": "purchased_artworks"}

    def save(self, *args, **kwargs):
        self.updated_at = datetime.utcnow()
        return super(PurchasedArtwork, self).save(*args, **kwargs)
