from rest_framework import serializers
from api.models.exhibit_model.exhibit import Exhibit
from api.models.exhibit_model.exhibit_contribution import ExhibitContribution
from api.serializers.artwork_s.artwork_serializers import ArtSerializer
from api.serializers.user_s.users_serializers import UserSerializer
from collections import defaultdict

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

    def _get_environment_slot_counts(self):
        """Cache environment slot counts to avoid repeated dictionary lookups"""
        return {1: 4, 2: 6, 3: 10}

    def _distribute_slots_fairly(self, total_slots, users):
        """Optimized slot distribution algorithm"""
        if not users or total_slots == 0:
            return {}
            
        slot_map = {}
        per_user = total_slots // len(users)
        remainder = total_slots % len(users)
        
        current_slot = 1
        for idx, user in enumerate(users):
            user_slot_count = per_user + (1 if idx < remainder else 0)
            for _ in range(user_slot_count):
                if current_slot <= total_slots:
                    slot_map[current_slot] = str(user.id)
                    current_slot += 1
        
        return slot_map

    def get_slotOwnerMap(self, obj):
        ENVIRONMENT_SLOT_COUNTS = self._get_environment_slot_counts()
        total_slots = ENVIRONMENT_SLOT_COUNTS.get(obj.chosen_env, 0)

        if obj.exhibit_type == "Solo":
            return {i: str(obj.owner.id) for i in range(1, total_slots + 1)}

        # Use optimized fair distribution for collaborative exhibits
        all_users = [obj.owner] + list(obj.collaborators)
        return self._distribute_slots_fairly(total_slots, all_users)

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
            
            # Show ALL unique artworks in owner's assigned slots
            for i, artwork in enumerate(unique_artworks):
                if artwork and i < len(owner_slots):  # Check if artwork exists and we have a slot for it
                    try:
                        # Create a safe artwork data structure
                        artwork_data = {
                            "id": str(artwork.id) if hasattr(artwork, 'id') and artwork.id else "unknown",
                            "title": getattr(artwork, 'title', 'Untitled') or 'Untitled',
                            "artist_id": str(artwork.artist.id) if hasattr(artwork, 'artist') and artwork.artist else str(obj.owner.id),
                            "profile_picture": getattr(artwork.artist, 'profile_picture', '') if hasattr(artwork, 'artist') and artwork.artist else obj.owner.profile_picture,
                            "artist": f"{artwork.artist.first_name} {artwork.artist.last_name}".strip() if hasattr(artwork, 'artist') and artwork.artist else f"{obj.owner.first_name} {obj.owner.last_name}".strip(),
                            "category": getattr(artwork, 'category', ''),
                            "medium": getattr(artwork, 'medium', ''),
                            "art_status": getattr(artwork, 'art_status', 'Active'),
                            "price": getattr(artwork, 'price', 0),
                            "discounted_price": getattr(artwork, 'discounted_price', None),
                            "size": getattr(artwork, 'size', ''),
                            "description": getattr(artwork, 'description', ''),
                            "visibility": getattr(artwork, 'visibility', 'Public'),
                            "created_at": str(getattr(artwork, 'created_at', obj.created_at)),
                            "updated_at": str(getattr(artwork, 'updated_at', obj.created_at)),
                            "image_url": getattr(artwork, 'image_url', ''),
                            "artworkImage": self._get_artwork_image(artwork),
                            "likes_count": getattr(artwork, 'likes_count', 0),
                            "edition": getattr(artwork, 'edition', None),
                            "year_created": getattr(artwork, 'year_created', None),
                            "default_paypal_email": getattr(artwork, 'default_paypal_email', None)
                        }
                        
                        slot_data = {
                            "contributor": {
                                "id": str(obj.owner.id),
                                "name": f"{obj.owner.first_name} {obj.owner.last_name}".strip(),
                                "profile_picture": obj.owner.profile_picture if getattr(obj.owner, "profile_picture", None) else ""
                            },
                            "artwork": artwork_data,
                            "slot_number": owner_slots[i],  # Use actual slot number from slot calculation
                            "contributed_at": obj.created_at
                        }
                        slots.append(slot_data)
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

    def _get_artwork_image(self, artwork):
        """Helper method to extract artwork image"""
        image_url = getattr(artwork, 'image_url', '')
        
        if image_url:
            if isinstance(image_url, list) and len(image_url) > 0:
                return image_url[0]
            elif isinstance(image_url, str):
                return image_url
            else:
                return ''
        else:
            return ''



