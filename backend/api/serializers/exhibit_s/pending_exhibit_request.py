
from rest_framework import serializers

class PendingExhibitRequestSerializer(serializers.Serializer):
    id = serializers.CharField()
    exhibitTitle = serializers.CharField()
    status = serializers.CharField()
    exhibitId = serializers.CharField()
    isOwner = serializers.BooleanField()
    type = serializers.ChoiceField(choices=["pending", "ready", "published", "contributed"])
    collaboratorsSubmitted = serializers.IntegerField(required=False)
    totalCollaborators = serializers.IntegerField(required=False)
    hasUserSubmitted = serializers.BooleanField(required=False)
