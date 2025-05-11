from rest_framework import serializers
from api.models.user_model.users import User
from datetime import datetime
import cloudinary.uploader
from django.core.exceptions import ValidationError


class UserSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, required=False, allow_null=True)
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=100, required=False, allow_null=True, allow_blank=True)
    last_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    role = serializers.CharField(max_length=100, required=False, allow_blank=True)
    user_status = serializers.CharField(max_length=100, required=False, allow_blank=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    gender = serializers.ChoiceField(choices=["Male", "Female", "Other"], required=False, allow_null=True)
    date_of_birth = serializers.DateTimeField(required=False, allow_null=True)
    profile_picture = serializers.ImageField(required=False, allow_null=True)
    bio = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    contact_number = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    address = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    def validate_username(self, value):
        if self.instance and self.instance.username == value:
            return value
        
        if User.objects(username=value).first():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def validate_email(self, value):
        if self.instance and self.instance.email == value:
            return value
        
        if User.objects(email=value).first():
            raise serializers.ValidationError("This email is already registered.")
        
        return value

    def create(self, validated_data):
        role = validated_data.get("role", "User")
        user_status = validated_data.get("user_status", "Active")
        created_at = validated_data.get("created_at", datetime.utcnow())
        updated_at = validated_data.get("updated_at", datetime.utcnow())

        profile_picture = validated_data.pop('profile_picture', None)
        if profile_picture:
            result = cloudinary.uploader.upload(profile_picture)
            validated_data['profile_picture'] = result.get('secure_url', '')

        user = User(
            username=validated_data["username"],
            email=validated_data["email"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            role=role,
            user_status=user_status,
            created_at=created_at,
            updated_at=updated_at,
            gender=validated_data.get("gender"),
            date_of_birth=validated_data.get("date_of_birth"),
            bio=validated_data.get("bio"),
            contact_number=validated_data.get("contact_number"),
            address=validated_data.get("address"),
            profile_picture=validated_data.get("profile_picture", '')
        )
        user.set_password(validated_data["password"])
        user.save()
        return user

    def update(self, instance, validated_data):
        profile_picture = validated_data.pop('profile_picture', None)
        if profile_picture:
            try:
                result = cloudinary.uploader.upload(profile_picture)
                validated_data['profile_picture'] = result.get('secure_url', '')
            except cloudinary.exceptions.Error as e:
                raise serializers.ValidationError(f"Cloudinary upload error: {str(e)}")

        
        instance.username = validated_data.get("username", instance.username)
        instance.email = validated_data.get("email", instance.email)
        instance.first_name = validated_data.get("first_name", instance.first_name)
        instance.last_name = validated_data.get("last_name", instance.last_name)
        instance.role = validated_data.get("role", instance.role)
        instance.user_status = validated_data.get("user_status", instance.user_status)
        instance.gender = validated_data.get("gender", instance.gender)
        instance.date_of_birth = validated_data.get("date_of_birth", instance.date_of_birth)
        instance.profile_picture = validated_data.get("profile_picture", instance.profile_picture)
        instance.bio = validated_data.get("bio", instance.bio)
        instance.contact_number = validated_data.get("contact_number", instance.contact_number)
        instance.address = validated_data.get("address", instance.address)
        instance.updated_at = datetime.utcnow()

        if "password" in validated_data:
            instance.set_password(validated_data["password"])

        instance.save()
        return instance



    def to_representation(self, instance):
        return {
            "id": str(instance.id),
            "username": instance.username,
            "email": instance.email,
            "first_name": instance.first_name,
            "last_name": instance.last_name,
            "role": instance.role,
            "user_status": instance.user_status,
            "created_at": instance.created_at,
            "updated_at": instance.updated_at,
            "gender": instance.gender,
            "date_of_birth": instance.date_of_birth,
            "profile_picture": instance.profile_picture,
            "bio": instance.bio,
            "contact_number": instance.contact_number,
            "address": instance.address
        }


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True)
    confirm_password = serializers.CharField(write_only=True, required=True)
    
    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "New passwords must match."})
        return data
