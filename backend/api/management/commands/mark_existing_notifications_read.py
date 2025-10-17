from django.core.management.base import BaseCommand
from api.models.interaction_model.notification import Notification


class Command(BaseCommand):
    help = 'Mark all existing notifications as read'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be updated without actually updating',
        )

    def handle(self, *args, **options):
        # Get all unread notifications
        unread_notifications = Notification.objects.filter(is_read=False)
        count = unread_notifications.count()
        
        if count == 0:
            self.stdout.write(
                self.style.SUCCESS('No unread notifications found.')
            )
            return

        if options['dry_run']:
            self.stdout.write(
                self.style.WARNING(f'DRY RUN: Would mark {count} notifications as read')
            )
            return

        # Mark all existing notifications as read
        updated_count = unread_notifications.update(is_read=True)
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully marked {updated_count} notifications as read.'
            )
        )
