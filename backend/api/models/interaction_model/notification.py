from mongoengine import Document, StringField, ReferenceField, DateTimeField, BooleanField
from datetime import datetime
from api.models.user_model.users import User
from api.models.artwork_model.artwork import Art

class Notification(Document):
    # Existing fields
    user = ReferenceField(User, required=True)
    message = StringField(required=True)
    art = ReferenceField(Art, required=False)
    created_at = DateTimeField(default=datetime.utcnow)
    is_read = BooleanField(default=False)

    # New fields to store time and date dynamically
    time = StringField(required=False)  # To store the elapsed time (e.g., "1m ago")
    date = DateTimeField(required=False)  # To store the exact timestamp (e.g., when the notification was created)

    # Optional extended fields to align with custom structure
    avatar = StringField(required=False)
    name = StringField(required=False)
    action = StringField(required=False)
    target = StringField(required=False)
    icon = StringField(required=False)
    amount = StringField(required=False)
    forAmount = StringField(required=False)
    token = StringField(required=False)
    link = StringField(required=False)
    donation = StringField(required=False)
    money = BooleanField(default=False)
    check = BooleanField(default=False) 

    meta = {'collection': 'notifications'}
