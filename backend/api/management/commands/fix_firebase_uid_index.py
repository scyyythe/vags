from django.core.management.base import BaseCommand
from mongoengine import connect
from api.models.user_model.users import User
import os


class Command(BaseCommand):
    help = 'Fix firebase_uid unique index to be sparse'

    def handle(self, *args, **options):
        # Connect to MongoDB
        connect(
            db=os.getenv("MONGO_DB_NAME"),
            host=os.getenv("MONGO_DB_URI"),
            alias="default"
        )
        
        try:
            # Get the collection
            collection = User._get_collection()
            
            # Drop the existing unique index
            self.stdout.write("Dropping existing firebase_uid index...")
            try:
                collection.drop_index("firebase_uid_1")
                self.stdout.write(self.style.SUCCESS("Successfully dropped firebase_uid_1 index"))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f"Index firebase_uid_1 not found or already dropped: {e}"))
            
            # Create a new sparse unique index
            self.stdout.write("Creating new sparse unique index for firebase_uid...")
            collection.create_index("firebase_uid", unique=True, sparse=True)
            self.stdout.write(self.style.SUCCESS("Successfully created sparse unique index for firebase_uid"))
            
            # Verify the index
            indexes = collection.list_indexes()
            for index in indexes:
                if 'firebase_uid' in index.get('key', {}):
                    self.stdout.write(f"Index: {index}")
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error: {e}"))
            raise
