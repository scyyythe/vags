from rest_framework import serializers
from api.models.user_model.users import User
from api.models.exhibit_model.exhibit import Exhibit
from api.models.interaction_model.interaction import Like
from api.serializers.artwork_s.artwork_serializers import ArtSerializer
from collections import defaultdict

class ExhibitCardSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    title = serializers.CharField()
    description = serializers.CharField()
    image = serializers.SerializerMethodField()
    category = serializers.CharField()
    likes = serializers.SerializerMethodField()
    views = serializers.SerializerMethodField()
    isSolo = serializers.SerializerMethodField()
    visibility = serializers.SerializerMethodField()
    isShared = serializers.SerializerMethodField()
    collaborators = serializers.SerializerMethodField()
    owner = serializers.SerializerMethodField()
    startDate = serializers.SerializerMethodField()
    endDate = serializers.SerializerMethodField()
    exhibit_likes_count = serializers.SerializerMethodField()
    user_has_liked_exhibit = serializers.SerializerMethodField()
    artworks = serializers.SerializerMethodField()
    slotArtworkMap = serializers.SerializerMethodField()
    ownerId = serializers.SerializerMethodField()
    userRole = serializers.SerializerMethodField()
    targetUserRole = serializers.SerializerMethodField()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Cache for likes to avoid N+1 queries
        self._likes_cache = {}
        self._user_likes_cache = {}

    def get_ownerId(self, obj):
        return str(obj.owner.id) if obj.owner else None

    def get_userRole(self, obj):
        request = self.context.get("request", None)
        user = getattr(request, "user", None)
        if not user or user.is_anonymous:
            return None
        
        # Check if user is the owner
        if obj.owner and str(obj.owner.id) == str(user.id):
            return "owner"
        
        # Check if user is a collaborator
        if obj.collaborators and any(str(collab.id) == str(user.id) for collab in obj.collaborators):
            return "collaborator"
        
        return None

    def get_targetUserRole(self, obj):
        # Get target user ID from context (for profile viewing)
        target_user_id = self.context.get("target_user_id")
        if not target_user_id:
            return None
        
        # Check if target user is the owner
        if obj.owner and str(obj.owner.id) == str(target_user_id):
            return "owner"
        
        # Check if target user is a collaborator
        if obj.collaborators and any(str(collab.id) == str(target_user_id) for collab in obj.collaborators):
            return "collaborator"
        
        return None

    def get_artworks(self, obj):
        
        all_artworks = self.context.get("all_artworks", [])
        return ArtSerializer(all_artworks, many=True, context=self.context).data

    def get_slotArtworkMap(self, obj):
       
        return self.context.get("slot_artwork_map", {})

    def get_exhibit_likes_count(self, obj):
        # Use prefetched data to avoid N+1 queries
        exhibit_id = str(obj.id)
        likes_data = self.context.get('likes_data', {})
        
        if exhibit_id in likes_data:
            return likes_data[exhibit_id]
        
        # Fallback to cache if not in prefetched data
        if exhibit_id not in self._likes_cache:
            self._likes_cache[exhibit_id] = Like.objects(exhibit=obj).count()
        return self._likes_cache[exhibit_id]

    def get_user_has_liked_exhibit(self, obj):
        # Use prefetched data to avoid N+1 queries
        exhibit_id = str(obj.id)
        user_likes_data = self.context.get('user_likes_data', {})
        
        if exhibit_id in user_likes_data:
            return True
        
        # Fallback to cache if not in prefetched data
        request = self.context.get("request", None)
        user = getattr(request, "user", None)
        if user and not user.is_anonymous:
            cache_key = f"{user.id}_{obj.id}"
            if cache_key not in self._user_likes_cache:
                self._user_likes_cache[cache_key] = Like.objects(user=user, exhibit=obj).first() is not None
            return self._user_likes_cache[cache_key]
        return False

    def get_image(self, obj):
        return obj.banner or ""

    def get_likes(self, obj):
        return 1
    
    def get_visibility(self, obj):
        return getattr(obj, "visibility", None)

    def get_views(self, obj):
        return len(obj.viewed_by or [])

    def get_startDate(self, obj):
        return obj.start_time.isoformat() if obj.start_time else None

    def get_endDate(self, obj):
        return obj.end_time.isoformat() if obj.end_time else None

    def get_isSolo(self, obj):
        return obj.exhibit_type == 'Solo'

    def get_isShared(self, obj):
        return obj.exhibit_type == 'Collaborative'

    def get_collaborators(self, obj):
        collaborators = []
        for user in obj.collaborators:
            try:
                if isinstance(user, str):
                    user = User.objects.get(id=user)

                full_name = f"{user.first_name} {user.last_name}".strip()
                collaborators.append({
                    "id": str(user.id),
                    "name": full_name,
                    "avatar": getattr(user, 'profile_picture', "")
                })
            except Exception as e:
                print(f"⚠️ Error retrieving collaborator user: {e}")
                continue
        return collaborators

    def get_owner(self, obj):
        owner = obj.owner
        if not owner:
            return None

        return {
            "id": str(owner.id),
            "name": f"{owner.first_name} {owner.last_name}".strip(),
            "avatar": getattr(owner, 'profile_picture', "")
        }
