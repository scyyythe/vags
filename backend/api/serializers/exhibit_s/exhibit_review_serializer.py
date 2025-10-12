from rest_framework import serializers
from api.models.exhibit_model.exhibit import Exhibit
from api.models.exhibit_model.exhibit_contribution import ExhibitContribution
from api.serializers.user_s.users_serializers import UserSerializer
from api.serializers.artwork_s.artwork_serializers import ArtSerializer


class CollaboratorStatusSerializer(serializers.Serializer):
    id = serializers.CharField()
    name = serializers.CharField()
    profile_picture = serializers.CharField()
    slotsToFill = serializers.IntegerField()
    slotsFilled = serializers.IntegerField()
    inProgress = serializers.BooleanField()


class ExhibitReviewSerializer(serializers.Serializer):
    id = serializers.CharField()
    title = serializers.CharField()
    category = serializers.CharField()
    type = serializers.CharField(source='exhibit_type')
    startDate = serializers.DateTimeField(source='start_time')
    endDate = serializers.DateTimeField(source='end_time')
    description = serializers.CharField()
    banner = serializers.CharField()
    collaborators = serializers.SerializerMethodField()
    chosen_env = serializers.IntegerField() 
    slots = serializers.SerializerMethodField()

    def get_collaborators(self, obj):
        collaborators = []
        
        # Add owner first
        collaborators.append({
            "id": str(obj.owner.id),
            "name": f"{obj.owner.first_name} {obj.owner.last_name}".strip(),
            "profile_picture": obj.owner.profile_picture if getattr(obj.owner, "profile_picture", None) else ""
        })
        
        # Add collaborators
        for user in obj.collaborators:
            collaborators.append({
                "id": str(user.id),
                "name": f"{user.first_name} {user.last_name}".strip(),
                "profile_picture": user.profile_picture if getattr(user, "profile_picture", None) else ""
            })
        return collaborators

    def get_slots(self, obj):
        slots = []
        
        # Add owner's artworks first
        if hasattr(obj, 'artworks') and obj.artworks:
            for i, artwork in enumerate(obj.artworks):
                if artwork:  # Check if artwork exists
                    try:
                        artwork_data = ArtSerializer(artwork, context=self.context).data
                        slots.append({
                            "contributor": {
                                "id": str(obj.owner.id),
                                "name": f"{obj.owner.first_name} {obj.owner.last_name}".strip(),
                                "profile_picture": obj.owner.profile_picture if getattr(obj.owner, "profile_picture", None) else ""
                            },
                            "artwork": artwork_data,
                            "slot_number": i + 1,  # Owner's slots start from 1
                            "contributed_at": obj.created_at
                        })
                    except Exception as e:
                        # Skip this artwork if it can't be serialized
                        continue
        
        # Add collaborators' contributions
        contributions = ExhibitContribution.objects(exhibit=obj)
        for contribution in contributions:
            contributor = contribution.contributor
            for artwork_entry in contribution.artworks:
                try:
                    artwork_data = ArtSerializer(artwork_entry.artwork, context=self.context).data
                    slots.append({
                        "contributor": {
                            "id": str(contributor.id),
                            "name": f"{contributor.first_name} {contributor.last_name}".strip(),
                            "profile_picture": contributor.profile_picture if getattr(contributor, "profile_picture", None) else ""
                        },
                        "artwork": artwork_data,
                        "slot_number": artwork_entry.slot_number,
                        "contributed_at": artwork_entry.contributed_at
                    })
                except Exception as e:
                    # Skip this artwork if it can't be serialized
                    continue
        return slots


