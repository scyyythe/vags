from datetime import datetime
from api.models.user_model.users import User
from api.models.artwork_model.artwork import Art
from api.models.artwork_model.bid import Bid
from api.models.artwork_model.bid import Auction
from mongoengine import (
    Document, StringField, ReferenceField, DateTimeField, ValidationError
)

class Report(Document):
    user = ReferenceField(User, required=True)
    art = ReferenceField(Art, required=False)
    auction = ReferenceField(Auction, required=False)
    reported_user = ReferenceField(User, required=False)
    category = StringField(required=True)
    option = StringField()
    issue_details = StringField(required=False)  
    description = StringField(required=False)  
    additional_info = StringField(required=False)  

    status = StringField(
        choices=["Pending", "In Progress", "Resolved", "Investigating", "Dismissed"],
        default="Pending"
    )
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {"collection": "reports"}

    def clean(self):
        if not any([self.art, self.auction, self.reported_user]):
            raise ValidationError(
                "At least one of 'art', 'auction', or 'reported_user' must be provided."
            )

