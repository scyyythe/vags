from rest_framework import serializers
from api.models.exhibit_model.exhibit_contribution import ExhibitContribution
from api.models.user_model.users import User
from api.models.exhibit_model.exhibit import Exhibit
from api.serializers.user_s.users_serializers import UserSerializer
from api.serializers.artwork_s.artwork_serializers import ArtSerializer

class ArtworkEntrySerializer(serializers.Serializer):
    artwork = serializers.SerializerMethodField()
    slot_number = serializers.IntegerField()
    contributed_at = serializers.DateTimeField()

    def get_artwork(self, obj):
        return ArtSerializer(obj.artwork).data

class ExhibitContributionSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    exhibit = serializers.SerializerMethodField()
    contributor = serializers.SerializerMethodField()
    artworks = serializers.SerializerMethodField()

    def get_exhibit(self, instance):
        return {
            "id": str(instance.exhibit.id),
            "title": instance.exhibit.title
        }

    def get_contributor(self, instance):
        return UserSerializer(instance.contributor).data

    def get_artworks(self, instance):
        return ArtworkEntrySerializer(instance.artworks, many=True).data
