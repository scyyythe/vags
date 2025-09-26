from mongoengine import Document, ReferenceField, StringField, URLField, DateTimeField, CASCADE
from datetime import datetime
from api.models.user_model.users import User


class Social(Document):
    user = ReferenceField(User, reverse_delete_rule=CASCADE, required=True)
    platform = StringField(
        required=True,
        choices=["facebook", "twitter", "instagram", "linkedin", "youtube", "tiktok", "github", "other"]
    )
    url = URLField(required=True)
    added_at = DateTimeField(default=datetime.utcnow)

    meta = {"indexes": ["user", "platform"]}
