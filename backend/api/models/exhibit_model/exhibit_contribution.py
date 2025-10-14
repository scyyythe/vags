from mongoengine import Document, ReferenceField, DateTimeField, IntField, EmbeddedDocument, EmbeddedDocumentField, EmbeddedDocumentListField
from datetime import datetime
from ..user_model.users import User
from ..artwork_model.artwork import Art
from ..exhibit_model.exhibit import Exhibit

# New: embedded document for artwork data
class ArtworkEntry(EmbeddedDocument):
    artwork = ReferenceField(Art, required=True)
    slot_number = IntField(required=True)
    contributed_at = DateTimeField(default=datetime.utcnow)

# Main document — still named ExhibitContribution
class ExhibitContribution(Document):
    exhibit = ReferenceField(Exhibit, required=True)
    contributor = ReferenceField(User, required=True)
    artworks = EmbeddedDocumentListField(ArtworkEntry)

    meta = {
        'collection': 'exhibit_contributions',
        'indexes': [
            ('exhibit', 'contributor'),
            'exhibit',  # For exhibit-based queries
            'contributor',  # For contributor-based queries
            ('exhibit', 'artworks.slot_number'),  # For slot-based lookups
        ],
        'unique_with': ['exhibit', 'contributor']
    }
