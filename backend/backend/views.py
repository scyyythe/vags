import requests
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from api.models.user_model.users import User  # your MongoEngine User model
import random
from datetime import datetime

@api_view(["POST"])
def google_register(request):
    token = request.data.get("token")
    if not token:
        return Response({"error": "Token is required"}, status=status.HTTP_400_BAD_REQUEST)

    # Validate token with Google
    google_response = requests.get(
        f"https://www.googleapis.com/oauth2/v1/userinfo?access_token={token}"
    )

    if google_response.status_code != 200:
        return Response({"error": "Invalid Google token"}, status=status.HTTP_400_BAD_REQUEST)

    user_info = google_response.json()
    email = user_info.get("email")
    first_name = user_info.get("given_name", "")
    last_name = user_info.get("family_name", "")
    username = email.split("@")[0]

    # Check if user already exists
    existing_user = User.objects(email=email).first()
    if existing_user:
        return Response({"message": "User already exists"}, status=status.HTTP_200_OK)

    # Create new user
    new_user = User(
        username=username,
        email=email,
        first_name=first_name,
        last_name=last_name,
        password=str(random.randint(100000, 999999)),  # Optional: generate random password
        created_at=datetime.utcnow()
    )
    new_user.save()

    return Response({"message": "User registered via Google"}, status=status.HTTP_201_CREATED)
