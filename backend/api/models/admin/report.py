from mongoengine import Document, StringField, ReferenceField, DateTimeField
from datetime import datetime
from api.models.user_model.users import User
from api.models.artwork_model.artwork import Art

class Report(Document):
    user = ReferenceField(User, required=True)
    art = ReferenceField(Art, required=True)
    issue_details = StringField(required=True) 
    status = StringField(choices=["Pending", "In Progress", "Resolved"], default="Pending")
    created_at = DateTimeField(default=datetime.utcnow)
    
    meta = {"collection": "reports"}
