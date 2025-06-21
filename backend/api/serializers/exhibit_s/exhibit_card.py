from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import serializers
from api.models.user_model.users import User
from api.models.exhibit_model.exhibit import Exhibit
from datetime import datetime
from api.models.interaction_model.interaction import Like
from api.serializers.artwork_s.artwork_serializers import ArtSerializer

class ExhibitCardSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    title = serializers.CharField()
    description = serializers.CharField()
    image = serializers.SerializerMethodField()
    category = serializers.CharField()
    likes = serializers.SerializerMethodField()
    views = serializers.SerializerMethodField()
    isSolo = serializers.SerializerMethodField()
    isShared = serializers.SerializerMethodField()
    collaborators = serializers.SerializerMethodField()
    owner = serializers.SerializerMethodField()
    startDate = serializers.SerializerMethodField()
    endDate = serializers.SerializerMethodField()
    exhibit_likes_count = serializers.SerializerMethodField()
    user_has_liked_exhibit = serializers.SerializerMethodField()
    artworks = serializers.SerializerMethodField()  
    slotArtworkMap = serializers.SerializerMethodField()

    def get_artworks(self, obj):
        from api.models.artwork_model.artwork import Art
        from api.serializers.artwork_s.artwork_serializers import ArtSerializer

        artworks = []
        for art in obj.artworks:
            try:
                # If it's a string ID, convert to object
                if isinstance(art, str):
                    art = Art.objects.get(id=art)
                artworks.append(art)
            except Exception as e:
                print(f"⚠️ Error retrieving artwork: {e}")
                continue

        return ArtSerializer(artworks, many=True, context=self.context).data

    def get_exhibit_likes_count(self, obj):
        return Like.objects(exhibit=obj).count()

    def get_user_has_liked_exhibit(self, obj):
        request = self.context.get("request", None)
        user = getattr(request, "user", None)
        if user and not user.is_anonymous:
            return Like.objects(user=user, exhibit=obj).first() is not None
        return False

    def get_image(self, obj):
        return obj.banner or ""

    def get_likes(self, obj):
        return 1

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
        return [
            {
                "id": str(user.id),
                "name": user.full_name,
                "avatar": getattr(user, 'avatar', "")
            }
            for user in obj.collaborators
        ]

    def get_owner(self, obj):
        owner = obj.owner
        return {
            "id": str(owner.id),
            "name": f"{owner.first_name} {owner.last_name}".strip(),
            "avatar": getattr(owner, 'avatar', "")
        } if owner else None
    def get_slotArtworkMap(self, obj):
        # Map first 10 artworks to slots 1–10
        return {str(i + 1): str(art.id) for i, art in enumerate(obj.artworks[:10])}