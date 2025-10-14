from rest_framework import serializers
from api.models.exhibit_model.exhibit import Exhibit
from api.models.user_model.users import User
from api.models.artwork_model.artwork import Art
import cloudinary.uploader
from datetime import datetime
from api.models.interaction_model.interaction import Like
from api.serializers.artwork_s.artwork_serializers import ArtSerializer
from api.models.interaction_model.notification import Notification
class ExhibitSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    title = serializers.CharField(max_length=100)
    description = serializers.CharField(required=False, allow_blank=True)
    tags = serializers.ListField(child=serializers.CharField(), required=False, default=[])
    banner = serializers.ImageField(required=False, allow_null=True)  
    owner = serializers.CharField()
    exhibit_type = serializers.ChoiceField(choices=['Solo', 'Collaborative'], required=False, allow_null=True)
    collaborators = serializers.ListField(child=serializers.CharField(), required=False, default=[])
    artworks = serializers.ListField(child=serializers.CharField(), required=False, default=[])
    category = serializers.CharField(max_length=100, required=False, allow_blank=True)
    visibility = serializers.ChoiceField(choices=['Public', 'Private', 'Pending'], default='Pending')
    start_time = serializers.DateTimeField()
    end_time = serializers.DateTimeField()
    chosen_env = serializers.IntegerField(required=False, allow_null=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    viewed_by = serializers.ListField(child=serializers.CharField(), required=False, default=[])
    

    exhibit_likes_count = serializers.SerializerMethodField()
    user_has_liked_exhibit = serializers.SerializerMethodField()
    collaborator_status = serializers.SerializerMethodField()
    overall_completion = serializers.SerializerMethodField()
    slot_owner_map = serializers.DictField(required=False, allow_null=True)
    slot_artwork_map = serializers.DictField(required=False, allow_null=True)

    def get_exhibit_likes_count(self, obj):
        return Like.objects(exhibit=obj).count()

    def get_user_has_liked_exhibit(self, obj):
        request = self.context.get("request", None)
        user = getattr(request, "user", None)
        if user and not user.is_anonymous:
            return Like.objects(user=user, exhibit=obj).first() is not None
        return False

    def get_collaborator_status(self, obj):
        """Calculate collaborator status based on slot assignments"""
        if obj.exhibit_type != "Collaborative":
            return []
        
        # Get slot owner map from request data or use empty dict
        slot_owner_map = getattr(obj, 'slot_owner_map', {})
        slot_artwork_map = getattr(obj, 'slot_artwork_map', {})
        
        if not slot_owner_map:
            return []
        
        # Calculate total slots based on environment
        env_slots = {1: 4, 2: 6, 3: 10}.get(obj.chosen_env, 0)
        
        # Apply specific distribution rules based on slot count and collaborator count
        collaborator_status = []
        
        # Calculate owner slots based on new distribution rules
        if env_slots == 4:
            # 4 slots: Owner gets 2, Collaborator gets 2
            owner_slots = 2
        elif env_slots == 6:
            # 6 slots: Distribute based on collaborator count
            if len(obj.collaborators) == 1:
                # 1 collaborator: 3-3 distribution
                owner_slots = 3
            else:
                # 2 collaborators: 2-2-2 distribution
                owner_slots = 2
        elif env_slots == 10:
            # 10 slots: Distribute based on collaborator count
            if len(obj.collaborators) == 1:
                # 1 collaborator: 5-5 distribution
                owner_slots = 5
            else:
                # 2 collaborators: 4-3-3 distribution (owner priority)
                owner_slots = 4
        else:
            owner_slots = 0
        
        # Calculate owner filled slots
        owner_filled = sum(1 for slot_id, artwork_id in slot_artwork_map.items() 
                          if slot_owner_map.get(str(slot_id)) == str(obj.owner.id))
        
        # Add owner status
        collaborator_status.append({
            "id": str(obj.owner.id),
            "name": f"{obj.owner.first_name} {obj.owner.last_name}",
            "profile_picture": obj.owner.profile_picture or "",
            "slotsToFill": owner_slots,
            "slotsFilled": owner_filled,
            "inProgress": owner_filled < owner_slots,
            "completionPercentage": round((owner_filled / owner_slots) * 100) if owner_slots > 0 else 0
        })
        
        # Add collaborators status based on new distribution rules
        for i, collaborator in enumerate(obj.collaborators):
            # Calculate collaborator slots based on new distribution rules
            if env_slots == 4:
                # 4 slots: Each collaborator gets 2
                collab_slots = 2
            elif env_slots == 6:
                # 6 slots: Distribute based on collaborator count
                if len(obj.collaborators) == 1:
                    # 1 collaborator: 3-3 distribution
                    collab_slots = 3
                else:
                    # 2 collaborators: 2-2-2 distribution
                    collab_slots = 2
            elif env_slots == 10:
                # 10 slots: Distribute based on collaborator count
                if len(obj.collaborators) == 1:
                    # 1 collaborator: 5-5 distribution
                    collab_slots = 5
                else:
                    # 2 collaborators: 4-3-3 distribution (owner priority)
                    collab_slots = 3
            else:
                collab_slots = 0
            
            collab_filled = sum(1 for slot_id, artwork_id in slot_artwork_map.items() 
                              if slot_owner_map.get(str(slot_id)) == str(collaborator.id))
            
            collaborator_status.append({
                "id": str(collaborator.id),
                "name": f"{collaborator.first_name} {collaborator.last_name}",
                "profile_picture": collaborator.profile_picture or "",
                "slotsToFill": collab_slots,
                "slotsFilled": collab_filled,
                "inProgress": collab_filled < collab_slots,
                "completionPercentage": round((collab_filled / collab_slots) * 100) if collab_slots > 0 else 0
            })
        
        return collaborator_status

    def get_overall_completion(self, obj):
        """Calculate overall completion percentage"""
        collaborator_status = self.get_collaborator_status(obj)
        
        if not collaborator_status:
            return {
                "totalSlots": 0,
                "filledSlots": 0,
                "completionPercentage": 0,
                "isReadyToPublish": False
            }
        
        total_slots = sum(collab["slotsToFill"] for collab in collaborator_status)
        filled_slots = sum(collab["slotsFilled"] for collab in collaborator_status)
        completion_percentage = round((filled_slots / total_slots) * 100) if total_slots > 0 else 0
        
        return {
            "totalSlots": total_slots,
            "filledSlots": filled_slots,
            "completionPercentage": completion_percentage,
            "isReadyToPublish": filled_slots == total_slots
        }

    def upload_banner(self, banner_file):
        if banner_file:
            upload_result = cloudinary.uploader.upload(banner_file)
            return upload_result.get("secure_url", "")
        return ""

    def create(self, validated_data):
        banner_file = validated_data.pop("banner", None)
        if banner_file:
            validated_data["banner"] = self.upload_banner(banner_file)
        else:
            validated_data["banner"] = ""

        owner_id = validated_data.pop("owner")
        collaborators_ids = validated_data.pop("collaborators", [])
        artworks_ids = validated_data.pop("artworks", [])
        viewed_by_ids = validated_data.pop("viewed_by", [])
        slot_owner_map = validated_data.pop("slot_owner_map", {})
        slot_artwork_map = validated_data.pop("slot_artwork_map", {})

        owner = User.objects.get(id=owner_id)
        collaborators = [User.objects.get(id=uid) for uid in collaborators_ids]
        artworks = [Art.objects.get(id=aid) for aid in artworks_ids]
        viewed_by = [User.objects.get(id=uid) for uid in viewed_by_ids]

        validated_data["owner"] = owner
        validated_data["collaborators"] = collaborators
        validated_data["artworks"] = artworks
        validated_data["viewed_by"] = viewed_by
        validated_data["slot_owner_map"] = slot_owner_map
        validated_data["slot_artwork_map"] = slot_artwork_map

       
        exhibit_type = validated_data.get("exhibit_type", "Solo")
        if exhibit_type == "Solo":
            validated_data["visibility"] = "Public"
        elif exhibit_type == "Collaborative":
            validated_data["visibility"] = "Pending"

      
        exhibit = Exhibit(**validated_data)
        exhibit.save()

       
        if exhibit_type == "Collaborative" and collaborators:
          
            for collaborator in collaborators:
                try:
                    notification = Notification.objects.create(
                        user=collaborator,
                        actor=owner,
                        message=f"invited you to collaborate on the exhibit '{exhibit.title}'",
                        exhibit=exhibit,
                        name=f"{owner.first_name} {owner.last_name}",
                        action="invited you to collaborate",
                        target=exhibit.title,
                        icon="invite",
                        link=f"/collaborator/exhibit/{exhibit.id}",
                        created_at=datetime.now(),
                    )
                    print(f"✅ Notification created for collaborator: {collaborator.first_name} {collaborator.last_name}")
                except Exception as e:
                    print(f"❌ Failed to create notification for {collaborator.first_name}: {str(e)}")

        return exhibit


    def update(self, instance, validated_data):
        banner_file = validated_data.pop("banner", None)
        if banner_file:
            instance.banner = self.upload_banner(banner_file)

        if "owner" in validated_data:
            instance.owner = User.objects.get(id=validated_data.pop("owner"))

        if "collaborators" in validated_data:
            collaborators_ids = validated_data.pop("collaborators")
            old_collaborators = set(str(c.id) for c in instance.collaborators)
            new_collaborators = set(collaborators_ids)
            
            # Find newly added collaborators
            added_collaborators = new_collaborators - old_collaborators
            
            # Check if collaborators changed (added or removed)
            collaborators_changed = added_collaborators or (old_collaborators - new_collaborators)
            
            instance.collaborators = [User.objects.get(id=uid) for uid in collaborators_ids]
            
            # If collaborators changed, set exhibit to Pending and notify all collaborators
            if collaborators_changed:
                print(f"🔔 Collaborators changed - setting exhibit to Pending and notifying all collaborators...")
                instance.visibility = "Pending"
                
                # Notify all current collaborators (including newly added ones)
                for collaborator_id in collaborators_ids:
                    try:
                        collaborator = User.objects.get(id=collaborator_id)
                        if collaborator_id in added_collaborators:
                            # New collaborator notification
                            message = f"You were invited to collaborate on the exhibit '{instance.title}'"
                            action = "invited you to collaborate"
                        else:
                            # Existing collaborator notification about changes
                            message = f"The exhibit '{instance.title}' has been updated. Please check your assigned slots."
                            action = "exhibit updated"
                        
                        Notification.objects.create(
                            user=collaborator,
                            actor=instance.owner,
                            message=message,
                            exhibit=instance,
                            name=f"{instance.owner.first_name} {instance.owner.last_name}",
                            action=action,
                            target=instance.title,
                            icon="invite" if collaborator_id in added_collaborators else "update",
                            link=f"/collaborator/exhibit/{instance.id}",
                            created_at=datetime.now(),
                        )
                        print(f"✅ Notification created for collaborator: {collaborator.first_name} {collaborator.last_name}")
                    except Exception as e:
                        print(f"❌ Failed to create notification for collaborator {collaborator_id}: {str(e)}")

        if "artworks" in validated_data:
            artworks_ids = validated_data.pop("artworks")
   
            instance.artworks.clear() 
            instance.artworks.extend([Art.objects.get(id=aid) for aid in artworks_ids])

        if "viewed_by" in validated_data:
            viewed_by_ids = validated_data.pop("viewed_by")
            instance.viewed_by = [User.objects.get(id=uid) for uid in viewed_by_ids]

        if "slot_owner_map" in validated_data:
            instance.slot_owner_map = validated_data.pop("slot_owner_map")

        if "slot_artwork_map" in validated_data:
            instance.slot_artwork_map = validated_data.pop("slot_artwork_map")

        # Check for environment changes that require notifications
        environment_changed = False
        if "chosen_env" in validated_data:
            old_env = instance.chosen_env
            new_env = validated_data.get("chosen_env")
            if old_env != new_env:
                environment_changed = True
                print(f"🔔 Environment changed from {old_env} to {new_env} - setting exhibit to Pending")

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # If environment changed and there are collaborators, set to Pending and notify them
        if environment_changed and instance.collaborators:
            instance.visibility = "Pending"
            
            # Notify all collaborators about environment change
            for collaborator in instance.collaborators:
                try:
                    Notification.objects.create(
                        user=collaborator,
                        actor=instance.owner,
                        message=f"The exhibit '{instance.title}' environment has been changed. Please check your assigned slots.",
                        exhibit=instance,
                        name=f"{instance.owner.first_name} {instance.owner.last_name}",
                        action="exhibit environment updated",
                        target=instance.title,
                        icon="update",
                        link=f"/collaborator/exhibit/{instance.id}",
                        created_at=datetime.now(),
                    )
                    print(f"✅ Environment change notification created for collaborator: {collaborator.first_name} {collaborator.last_name}")
                except Exception as e:
                    print(f"❌ Failed to create environment change notification for collaborator {collaborator.id}: {str(e)}")

        instance.updated_at = datetime.utcnow()
        instance.save()
        return instance


    def to_representation(self, instance):
        return {
            "id": str(instance.id),
            "title": instance.title,
            "description": instance.description,
            "tags": instance.tags,
            "banner": instance.banner,
            "owner": str(instance.owner.id) if instance.owner else None,
            "exhibit_type": instance.exhibit_type,
            "collaborators": [str(u.id) for u in instance.collaborators],
            "artworks": ArtSerializer(instance.artworks, many=True, context=self.context).data,

            "category": instance.category,
            "visibility": instance.visibility,
            "start_time": instance.start_time,
            "end_time": instance.end_time,
            "chosen_env": instance.chosen_env,
            "created_at": instance.created_at,
            "updated_at": instance.updated_at,
            "viewed_by": [str(u.id) for u in instance.viewed_by],
            "exhibit_likes_count": self.get_exhibit_likes_count(instance),
            "user_has_liked_exhibit": self.get_user_has_liked_exhibit(instance),
            "collaborator_status": self.get_collaborator_status(instance),
            "overall_completion": self.get_overall_completion(instance),
            "slot_owner_map": getattr(instance, 'slot_owner_map', {}),
            "slot_artwork_map": getattr(instance, 'slot_artwork_map', {}),
        }