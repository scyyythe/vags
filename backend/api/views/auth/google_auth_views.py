import requests
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from api.models.user_model.users import User
from rest_framework_simplejwt.tokens import RefreshToken
import random
import string
from datetime import datetime, timedelta
import bcrypt
from django.conf import settings
import jwt


class GoogleRegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        google_token = request.data.get("google_token")
        
        if not google_token:
            return Response({"error": "Google token is required"}, status=400)

        
        response = requests.get(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            headers={'Authorization': f'Bearer {google_token}'}
        )

        if response.status_code != 200:
            return Response({"error": "Invalid Google token"}, status=401)

        user_data = response.json()
        email = user_data.get("email")
        first_name = user_data.get("given_name")
        last_name = user_data.get("family_name")
        
        if not email:
            return Response({"error": "Google account does not contain email"}, status=400)

       
        user = User.objects(email=email).first()
        if user is None:
            username = self.generate_username(first_name, last_name)

            
            user = User(
                email=email,
                username=username,
                first_name=first_name,
                last_name=last_name,
                is_oauth_user=True,
                registered_via="google"
            )
            user.save()

        
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token

        return Response({
            "message": "Registration successful",
            "user": {
                "id": str(user.id),
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "username": user.username,
            },
            "access_token": str(access_token),
            "refresh_token": str(refresh),
        }, status=200)

    def generate_username(self, first_name, last_name):
        """ Generate a unique username based on first and last name """
        base_username = f"{first_name.lower()}{last_name.lower()}"
        username = base_username
        counter = 1

        while User.objects(username=username).first():
            username = f"{base_username}{random.randint(1000, 9999)}"
            counter += 1

        return username
class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        google_token = request.data.get("google_token")
        
        if not google_token:
            return Response({"error": "Google token is required"}, status=400)

        # Get user info from Google
        response = requests.get(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            headers={'Authorization': f'Bearer {google_token}'}
        )

        if response.status_code != 200:
            return Response({"error": "Invalid Google token"}, status=401)

        user_data = response.json()
        email = user_data.get("email")
        first_name = user_data.get("given_name")
        last_name = user_data.get("family_name")

        if not email:
            return Response({"error": "Google account does not contain email"}, status=400)

        user = User.objects(email=email).first()

        # Auto-register user if not found
        if user is None:
            # Generate a random username
            username = f"{first_name.lower()}{last_name.lower()}{random.randint(1000, 9999)}"

            # Create the user
            user = User(
                email=email,
                first_name=first_name,
                last_name=last_name,
                username=username,
            )
            user.save()

        # Token generation
        def generate_token(payload, exp_delta):
            payload.update({
                "exp": datetime.utcnow() + exp_delta,
                "iat": datetime.utcnow()
            })
            return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

        access_token = generate_token({
            "user_id": str(user.id),
            "email": user.email,
            "jti": f"{user.id}_access",
            "token_type": "access"
        }, timedelta(hours=1))

        refresh_token = generate_token({
            "user_id": str(user.id),
            "jti": f"{user.id}_refresh",
            "token_type": "refresh"
        }, timedelta(days=7))

        user.access_token = access_token
        user.refresh_token = refresh_token
        user.save()

        return Response({
            "message": "Login successful",
            "user": {
                "id": str(user.id),
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "username": user.username,
            },
            "access_token": access_token,
            "refresh_token": refresh_token,
        }, status=200)
        
        
        # REGISTER FIRST THEN LOGIN
# class GoogleLoginView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         google_token = request.data.get("google_token")
        
#         if not google_token:
#             return Response({"error": "Google token is required"}, status=400)

#         # Get user info from Google
#         response = requests.get(
#             'https://www.googleapis.com/oauth2/v3/userinfo',
#             headers={'Authorization': f'Bearer {google_token}'}
#         )

#         if response.status_code != 200:
#             return Response({"error": "Invalid Google token"}, status=401)

#         user_data = response.json()
#         email = user_data.get("email")
#         first_name = user_data.get("given_name")
#         last_name = user_data.get("family_name")

#         if not email:
#             return Response({"error": "Google account does not contain email"}, status=400)

#         user = User.objects(email=email).first()

#         if user is None:
#             return Response({"error": "User not found. Please register first."}, status=404)

        
#         def generate_token(payload, exp_delta):
#             payload.update({"exp": datetime.utcnow() + exp_delta, "iat": datetime.utcnow()})
#             return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

     
#         access_token = generate_token({
#             "user_id": str(user.id),
#             "email": user.email,
#             "jti": f"{user.id}_access",
#             "token_type": "access"
#         }, timedelta(hours=1))

        
#         refresh_token = generate_token({
#             "user_id": str(user.id),
#             "jti": f"{user.id}_refresh",
#             "token_type": "refresh"
#         }, timedelta(days=7))

        
#         user.access_token = access_token
#         user.refresh_token = refresh_token
#         user.save()

#         return Response({
#             "message": "Login successful",
#             "user": {
#                 "id": str(user.id),
#                 "email": user.email,
#                 "first_name": user.first_name,
#                 "last_name": user.last_name,
#                 "username": user.username,
#             },
#             "access_token": access_token, 
#             "refresh_token": refresh_token,
#         }, status=200)
