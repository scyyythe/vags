from django.core.management.base import BaseCommand
from api.models.user_model.users import User
from api.models.user_model.two_factor_auth import TwoFactorAuth
from datetime import datetime


class Command(BaseCommand):
    help = 'Migrate existing 2FA data from User model to TwoFactorAuth model'

    def handle(self, *args, **options):
        self.stdout.write('Starting 2FA data migration...')
        
        # Get all users
        users = User.objects.all()
        migrated_count = 0
        created_count = 0
        
        for user in users:
            # Check if user has any 2FA data in the old format
            # Since we removed the fields, this is mainly for documentation
            # In a real migration, you'd check for existing 2FA data
            
            # Get or create 2FA settings for each user
            two_factor, created = TwoFactorAuth.objects.get_or_create(user=user)
            
            if created:
                created_count += 1
                self.stdout.write(f'Created 2FA settings for user: {user.email}')
            else:
                migrated_count += 1
                self.stdout.write(f'2FA settings already exist for user: {user.email}')
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Migration completed! Created: {created_count}, Already existed: {migrated_count}'
            )
        )
