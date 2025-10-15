from django.core.management.base import BaseCommand
from api.models.interaction_model.interaction import Like
from api.models.exhibit_model.exhibit import Exhibit
from api.models.interaction_model.hidden_content import HiddenContent
from api.models.user_model.users import User
from mongoengine import connection
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Create database indexes for performance optimization'

    def handle(self, *args, **options):
        self.stdout.write('Creating database indexes...')
        
        try:
            # Get the database connection
            db = connection.get_db()
            
            # Create indexes for Like model
            self.stdout.write('Creating indexes for Like model...')
            like_collection = db.likes
            like_indexes = [
                ('user', 1),
                ('art', 1),
                ('exhibit', 1),
                ('auction', 1),
                [('user', 1), ('art', 1)],
                [('user', 1), ('exhibit', 1)],
                [('user', 1), ('auction', 1)],
                [('exhibit', 1), ('user', 1)],
                [('art', 1), ('user', 1)],
            ]
            
            for index in like_indexes:
                try:
                    if isinstance(index, list):
                        like_collection.create_index(index)
                    else:
                        like_collection.create_index(index)
                    self.stdout.write(f'  ✓ Created index: {index}')
                except Exception as e:
                    self.stdout.write(f'  ⚠ Index {index} already exists or error: {e}')
            
            # Create indexes for Exhibit model (if not already created)
            self.stdout.write('Creating indexes for Exhibit model...')
            exhibit_collection = db.exhibits
            exhibit_indexes = [
                ('owner', 1),
                ('visibility', 1),
                ('start_time', 1),
                ('exhibit_type', 1),
                ('chosen_env', 1),
                ('created_at', -1),
                [('owner', 1), ('visibility', 1)],
                [('visibility', 1), ('start_time', 1)],
                [('exhibit_type', 1), ('visibility', 1)],
                [('collaborators', 1), ('visibility', 1)],
                [('owner', 1), ('visibility', 1), ('start_time', 1)],
            ]
            
            for index in exhibit_indexes:
                try:
                    if isinstance(index, list):
                        exhibit_collection.create_index(index)
                    else:
                        exhibit_collection.create_index(index)
                    self.stdout.write(f'  ✓ Created index: {index}')
                except Exception as e:
                    self.stdout.write(f'  ⚠ Index {index} already exists or error: {e}')
            
            # Create indexes for User model
            self.stdout.write('Creating indexes for User model...')
            user_collection = db.users
            user_indexes = [
                ('user_status', 1),
                ('email', 1),
                ('username', 1),
            ]
            
            for index in user_indexes:
                try:
                    if isinstance(index, list):
                        user_collection.create_index(index)
                    else:
                        user_collection.create_index(index)
                    self.stdout.write(f'  ✓ Created index: {index}')
                except Exception as e:
                    self.stdout.write(f'  ⚠ Index {index} already exists or error: {e}')
            
            self.stdout.write(
                self.style.SUCCESS('Successfully created database indexes!')
            )
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating indexes: {e}')
            )
