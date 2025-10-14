from django.core.management.base import BaseCommand
from datetime import datetime, timedelta
from api.models.user_model.session import UserSession

class Command(BaseCommand):
    help = 'Clean up old user sessions'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=30,
            help='Delete sessions older than this many days (default: 30)'
        )
        parser.add_argument(
            '--limit',
            type=int,
            default=10,
            help='Keep only this many recent sessions per user (default: 10)'
        )

    def handle(self, *args, **options):
        days = options['days']
        limit = options['limit']
        
        # Clean up old sessions
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        old_sessions = UserSession.objects(created_at__lt=cutoff_date)
        old_count = old_sessions.count()
        
        if old_count > 0:
            old_sessions.delete()
            self.stdout.write(
                self.style.SUCCESS(f'Deleted {old_count} sessions older than {days} days')
            )
        
        # Limit sessions per user
        from api.models.user_model.users import User
        users = User.objects()
        total_deleted = 0
        
        for user in users:
            user_sessions = UserSession.objects(user=user).order_by("-created_at")
            if user_sessions.count() > limit:
                sessions_to_delete = user_sessions[limit:]
                deleted_count = sessions_to_delete.count()
                for session in sessions_to_delete:
                    session.delete()
                total_deleted += deleted_count
        
        if total_deleted > 0:
            self.stdout.write(
                self.style.SUCCESS(f'Deleted {total_deleted} excess sessions (keeping {limit} per user)')
            )
        
        # Show current stats
        total_sessions = UserSession.objects().count()
        self.stdout.write(
            self.style.SUCCESS(f'Total sessions remaining: {total_sessions}')
        )
