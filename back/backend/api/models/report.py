from mongoengine import Document, StringField, ReferenceField, DateTimeField
from datetime import datetime
from api.models.users import User

class Report(Document):
    user = ReferenceField(User, required=True)  
    issue_details = StringField(required=True) 
    status = StringField(choices=["Pending", "In Progress", "Resolved"], default="Pending")
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {"collection": "reports"}
