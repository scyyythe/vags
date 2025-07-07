from rest_framework import serializers
from api.models.exhibit_model.exhibit import Exhibit
from api.models.exhibit_model.exhibit_contribution import ExhibitContribution
from api.serializers.artwork_s.artwork_serializers import ArtSerializer
from api.serializers.user_s.users_serializers import UserSerializer

class CollaboratorExhibitViewSerializer(serializers.Serializer):
    id = serializers.CharField()
    title = serializers.CharField()
    description = serializers.CharField()
    bannerImage = serializers.CharField(source="banner")
    startDate = serializers.DateTimeField(source="start_time")
    endDate = serializers.DateTimeField(source="end_time")
    environment = serializers.IntegerField(source="chosen_env")

    owner = serializers.SerializerMethodField()
    collaborators = serializers.SerializerMethodField()
    slotOwnerMap = serializers.SerializerMethodField()
    slotArtworkMap = serializers.SerializerMethodField()

    def get_owner(self, obj):
        return {
            "id": str(obj.owner.id),
            "name": f"{obj.owner.first_name} {obj.owner.last_name}".strip(),
            "avatar": getattr(obj.owner, "profile_picture", ""),
        }

    def get_collaborators(self, obj):
        collaborators = []
        for user in obj.collaborators:
            collaborators.append({
                "id": str(user.id),
                "name": f"{user.first_name} {user.last_name}".strip(),
                "avatar": getattr(user, "profile_picture", "")
            })
        return collaborators

    def get_slotOwnerMap(self, obj):
        ENVIRONMENT_SLOT_COUNTS = {
            1: 4,
            2: 6,
            3: 10,
            # Add more environments as needed
        }

        total_slots = ENVIRONMENT_SLOT_COUNTS.get(obj.chosen_env, 0)

        if obj.exhibit_type == "solo":  # Add this if you have a solo/collab flag
            return {i: str(obj.owner.id) for i in range(1, total_slots + 1)}

        slot_map = {}
        all_users = [obj.owner] + list(obj.collaborators)
        per_user = total_slots // len(all_users) if all_users else 0
        remainder = total_slots % len(all_users)

        current_slot = 1
        for idx, user in enumerate(all_users):
            user_slot_count = per_user + (1 if idx < remainder else 0)
            for _ in range(user_slot_count):
                if current_slot <= total_slots:
                    slot_map[current_slot] = str(user.id)
                    current_slot += 1

        return slot_map

    def get_slotArtworkMap(self, obj):
        result = {}
        contributions = ExhibitContribution.objects(exhibit=obj)

        for contribution in contributions:
            if contribution.slot_number:
                result[contribution.slot_number] = str(contribution.artwork.id)

        return result


