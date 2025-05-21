from rest_framework import serializers
from api.models.exhibit_model.exhibit_contribution import ExhibitContribution
from api.models.user_model.users import User
from api.models.exhibit_model.exhibit import Exhibit
from api.models.artwork_model.artwork import Art
from api.serializers.user_s.users_serializers import UserSerializer
from api.serializers.artwork_s.artwork_serializers import ArtSerializer

class ExhibitContributionSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    exhibit = serializers.CharField()
    contributor = serializers.CharField()
    artwork = serializers.CharField()
    contributed_at = serializers.DateTimeField(read_only=True)

    def create(self, validated_data):
        validated_data['exhibit'] = Exhibit.objects.get(id=validated_data['exhibit'])
        validated_data['contributor'] = User.objects.get(id=validated_data['contributor'])
        validated_data['artwork'] = Art.objects.get(id=validated_data['artwork'])

        return ExhibitContribution.objects.create(**validated_data)

    def to_representation(self, instance):
        artwork_serializer = ArtSerializer(instance.artwork)
        contributor_serializer = UserSerializer(instance.contributor)  
        return {
            "id": str(instance.id),
            "exhibit": {
                "id": str(instance.exhibit.id),
                "title": instance.exhibit.title,
            },
            "contributor": contributor_serializer.data,  
            "artwork": artwork_serializer.data,
            "contributed_at": instance.contributed_at
        }

