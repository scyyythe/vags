from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from api.models.user_model.users import User
from api.serializers.user_s.users_serializers import UserSerializer
from api.auth.permissions import IsAdminUser
from datetime import datetime
import random
import string


class AdminCreateUserView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request):
        try:
            data = request.data.copy()  # Create a copy to avoid modifying the original
            
            # Generate a random username if not provided
            if not data.get('username'):
                email_prefix = data.get('email', '').split('@')[0]
                # Ensure username is unique
                base_username = email_prefix
                username = base_username
                counter = 1
                while User.objects(username=username).first():
                    username = f"{base_username}_{counter}"
                    counter += 1
                data['username'] = username
            
            # Generate a random password for admin-created users (always generate one)
            data['password'] = ''.join(random.choices(string.ascii_letters + string.digits, k=12))
            
            # Set default values
            data['user_status'] = data.get('user_status', 'Active')
            data['role'] = data.get('role', 'User')  # Ensure role is set
            # Remove datetime fields as they are handled by the model defaults
            data.pop('created_at', None)
            data.pop('updated_at', None)
            
            # Create user using the existing serializer
            serializer = UserSerializer(data=data)
            
            if serializer.is_valid():
                user = serializer.save()
                
                # Return user data without password
                user_data = {
                    'id': str(user.id),
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'role': user.role,
                    'user_status': user.user_status,
                    'created_at': user.created_at.isoformat(),
                    'updated_at': user.updated_at.isoformat(),
                    'gender': user.gender,
                    'bio': user.bio,
                    'contact_number': user.contact_number,
                    'address': user.address,
                    'profile_picture': user.profile_picture,
                    'cover_photo': user.cover_photo,
                }
                
                return Response({
                    'message': 'User created successfully',
                    'user': user_data
                }, status=status.HTTP_201_CREATED)
            else:
                # Handle specific validation errors
                if 'email' in serializer.errors:
                    email_error = serializer.errors['email'][0]
                    if 'already registered' in str(email_error):
                        return Response({
                            'error': 'Email already exists',
                            'message': f'The email {data.get("email")} is already registered in the system.'
                        }, status=status.HTTP_400_BAD_REQUEST)
                
                return Response({
                    'error': 'Invalid data',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                'error': 'Failed to create user',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
