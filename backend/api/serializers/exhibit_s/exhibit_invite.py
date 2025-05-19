from rest_framework import serializers
from api.models.exhibit_model.exhibit_invitation import ExhibitInvitation
from api.models.user_model.users import User
from api.models.exhibit_model.exhibit import Exhibit

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
        return {
            "id": str(instance.id),
            "exhibit": str(instance.exhibit.id),
            "inviter": str(instance.inviter.id),
            "invitee": str(instance.invitee.id),
            "status": instance.status,
            "sent_at": instance.sent_at,
            "expires_at": instance.expires_at
        }
