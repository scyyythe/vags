from mongoengine import Document, ReferenceField, DateTimeField
from datetime import datetime
from ..user_model.users import User
from ..artwork_model.artwork import Art
from ..exhibit_model.exhibit import Exhibit

class ExhibitContribution(Document):
    exhibit = ReferenceField(Exhibit, required=True)
    contributor = ReferenceField(User, required=True)
    artwork = ReferenceField(Art, required=True)
    contributed_at = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'exhibit_contributions',
        'indexes': [
            ('exhibit', 'contributor'),
            ('exhibit', 'artwork')
        ],
        'unique_with': ['exhibit', 'artwork']
    }
