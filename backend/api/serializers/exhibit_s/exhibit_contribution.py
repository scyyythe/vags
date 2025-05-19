from rest_framework import serializers
from api.models.exhibit_model.exhibit_contribution import ExhibitContribution
from api.models.user_model.users import User
from api.models.exhibit_model.exhibit import Exhibit
from api.models.artwork_model.artwork import Art

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
        return {
            "id": str(instance.id),
            "exhibit": str(instance.exhibit.id),
            "contributor": str(instance.contributor.id),
            "artwork": str(instance.artwork.id),
            "contributed_at": instance.contributed_at
        }
