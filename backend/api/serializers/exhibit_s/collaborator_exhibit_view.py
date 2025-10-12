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
    slots = serializers.SerializerMethodField()

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

        # Calculate slot distribution, but ensure owner gets enough slots for their artworks
        slot_map = {}
        all_users = [obj.owner] + list(obj.collaborators)
        
        # Count owner's artworks to ensure they get enough slots
        owner_artwork_count = len(obj.artworks) if hasattr(obj, 'artworks') and obj.artworks else 0
        
        # Calculate base distribution
        per_user = total_slots // len(all_users) if all_users else 0
        remainder = total_slots % len(all_users)
        
        # Ensure owner gets at least as many slots as they have artworks
        owner_min_slots = max(per_user + (1 if 0 < remainder else 0), owner_artwork_count)

        # Distribute slots with owner getting priority for their artworks
        current_slot = 1
        
        # Give owner their required slots first
        for i in range(owner_min_slots):
            if current_slot <= total_slots:
                slot_map[current_slot] = str(obj.owner.id)
                current_slot += 1
        
        # Distribute remaining slots to other users
        remaining_users = all_users[1:]  # Exclude owner
        remaining_slots = total_slots - owner_min_slots
        
        if remaining_slots > 0 and remaining_users:
            per_other_user = remaining_slots // len(remaining_users)
            other_remainder = remaining_slots % len(remaining_users)
            
            for idx, user in enumerate(remaining_users):
                user_slot_count = per_other_user + (1 if idx < other_remainder else 0)
                for _ in range(user_slot_count):
                    if current_slot <= total_slots:
                        slot_map[current_slot] = str(user.id)
                        current_slot += 1

        return slot_map

    def get_slotArtworkMap(self, obj):
        result = {}
        
        # Add owner's artworks to slot artwork map (only unique artworks)
        slot_owner_map = self.get_slotOwnerMap(obj)
        owner_slots = [int(slot_id) for slot_id, owner_id in slot_owner_map.items() if owner_id == str(obj.owner.id)]
        owner_slots.sort()
        
        if hasattr(obj, 'artworks') and obj.artworks:
            seen_artwork_ids = set()
            unique_artworks = []
            
            # Filter out duplicate artworks by ID
            for artwork in obj.artworks:
                if artwork and artwork.id not in seen_artwork_ids:
                    seen_artwork_ids.add(artwork.id)
                    unique_artworks.append(artwork)
            
            for i, artwork in enumerate(unique_artworks):
                if artwork and i < len(owner_slots):
                    result[owner_slots[i]] = str(artwork.id)
        
        # Add collaborators' contributions
        contributions = ExhibitContribution.objects(exhibit=obj)
        for contribution in contributions:
            for entry in getattr(contribution, "artworks", []):
                if entry.slot_number and entry.artwork:
                    result[entry.slot_number] = str(entry.artwork.id)

        return result

    def get_slots(self, obj):
        slots = []
        
        # Get slot owner map to find which slots belong to owner
        slot_owner_map = self.get_slotOwnerMap(obj)
        owner_slots = [int(slot_id) for slot_id, owner_id in slot_owner_map.items() if owner_id == str(obj.owner.id)]
        owner_slots.sort()
        
        # Add owner's artworks first (limit to only show unique artworks, no duplicates)
        if hasattr(obj, 'artworks') and obj.artworks:
            seen_artwork_ids = set()
            unique_artworks = []
            
            # Filter out duplicate artworks by ID
            for artwork in obj.artworks:
                if artwork and artwork.id not in seen_artwork_ids:
                    seen_artwork_ids.add(artwork.id)
                    unique_artworks.append(artwork)
            
            # Only show unique artworks that fit in assigned slots
            for i, artwork in enumerate(unique_artworks):
                if artwork and i < len(owner_slots):  # Check if artwork exists and we have a slot for it
                    try:
                        artwork_data = ArtSerializer(artwork, context=self.context).data
                        slots.append({
                            "contributor": {
                                "id": str(obj.owner.id),
                                "name": f"{obj.owner.first_name} {obj.owner.last_name}".strip(),
                                "profile_picture": obj.owner.profile_picture if getattr(obj.owner, "profile_picture", None) else ""
                            },
                            "artwork": artwork_data,
                            "slot_number": owner_slots[i],  # Use actual slot number from slot calculation
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



