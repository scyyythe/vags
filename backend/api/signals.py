# api/signals.py
from allauth.account.signals import user_logged_in
from allauth.socialaccount.models import SocialAccount
from django.dispatch import receiver
from api.models.user_model.users import User 
import random
import string
@receiver(user_logged_in)
def populate_mongo_user(sender, request, user, **kwargs):
    try:
        social_account = SocialAccount.objects.get(user=user)
        email = social_account.extra_data.get("email")
        first_name = social_account.extra_data.get("given_name", "")
        last_name = social_account.extra_data.get("family_name", "")
        username = email.split('@')[0]

       
        mongo_user = User.objects(email=email).first()

        if not mongo_user:
            mongo_user = User(
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name,
                role="User",
                user_status="Active"
            )
            mongo_user.set_password("OAuthUser_" + ''.join(random.choices(string.ascii_letters, k=8)))  # Set dummy password
            mongo_user.save()

    except Exception as e:
        print("Error creating user in MongoDB:", e)
