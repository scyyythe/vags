from mongoengine import Document, ReferenceField, DateTimeField, StringField
from datetime import datetime, timedelta
from ..user_model.users import User
from ..exhibit_model.exhibit import Exhibit

class ExhibitInvitation(Document):
    exhibit = ReferenceField(Exhibit, required=True)
    inviter = ReferenceField(User, required=True)
    invitee = ReferenceField(User, required=True)
    status = StringField(choices=['pending', 'accepted', 'declined', 'expired'], default='pending')
    sent_at = DateTimeField(default=datetime.utcnow)
    expires_at = DateTimeField(default=lambda: datetime.utcnow() + timedelta(days=7))

    meta = {
        'collection': 'exhibit_invitations',
        'indexes': ['invitee', 'status', 'expires_at'],
        'unique_with': ['exhibit', 'invitee']
    }
