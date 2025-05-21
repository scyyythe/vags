from rest_framework import serializers
from api.models.exhibit_model.exhibit_invitation import ExhibitInvitation
from api.models.user_model.users import User
from api.models.exhibit_model.exhibit import Exhibit
from api.serializers.user_s.users_serializers import UserSerializer

class ExhibitInvitationSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    exhibit = serializers.CharField()
    inviter = serializers.CharField()
    invitee = serializers.CharField()
    status = serializers.ChoiceField(choices=['pending', 'accepted', 'declined', 'expired'], default='pending')
    sent_at = serializers.DateTimeField(read_only=True)
    expires_at = serializers.DateTimeField(read_only=True)

    def create(self, validated_data):
        validated_data['exhibit'] = Exhibit.objects.get(id=validated_data['exhibit'])
        validated_data['inviter'] = User.objects.get(id=validated_data['inviter'])
        validated_data['invitee'] = User.objects.get(id=validated_data['invitee'])
        return ExhibitInvitation.objects.create(**validated_data)

    def to_representation(self, instance):
        inviter_data = UserSerializer(instance.inviter).data
        invitee_data = UserSerializer(instance.invitee).data
        return {
            "id": str(instance.id),
            "exhibit": {
                "id": str(instance.exhibit.id),
                "title": instance.exhibit.title,
            },
            "inviter": inviter_data,
            "invitee": invitee_data,
            "status": instance.status,
            "sent_at": instance.sent_at,
            "expires_at": instance.expires_at,
        }
