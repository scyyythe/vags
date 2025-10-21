
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from api.models.interaction_model.comment import Comment
from api.serializers.interaction_s.comment_serializer import CommentSerializer
from bson import ObjectId
from rest_framework.views import APIView
from django.utils import timezone
class CommentListCreateView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request, content_type, object_id):
        comments = Comment.objects(content_type=content_type, object_id=object_id)
        data = []
        for c in comments:
            user = c.user
            data.append({
                "id": str(c.id),
                "user": {
                    "id": str(user.id),
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "profile_picture": user.profile_picture if user.profile_picture else None,
                },
                "text": c.text,
                "likes": c.likes,
                "liked_by": [str(user_id) for user_id in c.liked_by] if c.liked_by else [],
                "emoji_reactions": c.emoji_reactions,
                "created_at": c.created_at.isoformat(),
                "parent": str(c.parent.id) if c.parent else None,   
            })
        return Response(data)


    def post(self, request, content_type, object_id):
        parent = None
        if request.data.get("parentId"):
            parent = Comment.objects.get(id=request.data["parentId"])

        comment = Comment(
            user=request.user,
            text=request.data.get("text"),
            content_type=content_type,
            object_id=object_id,
            parent=parent
        )
        comment.save()

        user = request.user

        return Response({
            "id": str(comment.id),
            "user": {
                "id": str(user.id),
                "first_name": user.first_name,
                "last_name": user.last_name,
                "profile_picture": user.profile_picture if user.profile_picture else None,
            },
            "text": comment.text,
            "likes": comment.likes,
            "liked_by": [str(user_id) for user_id in comment.liked_by] if comment.liked_by else [],
            "emoji_reactions": comment.emoji_reactions,
            "created_at": comment.created_at.isoformat()
        }, status=status.HTTP_201_CREATED)



class CommentRepliesView(generics.ListAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return Comment.objects(parent=self.kwargs["comment_id"])


class CommentReactionView(generics.UpdateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = "pk"

    def update(self, request, *args, **kwargs):
        comment = Comment.objects.get(id=kwargs["pk"])
        emoji = request.data.get("emoji")
        action = request.data.get("action", "like")  # Default to "like" for backward compatibility

        if not emoji:
            return Response({"error": "Emoji is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Get current reaction count
        current_count = comment.emoji_reactions.get(emoji, 0)
        
        if action == "unlike":
            # Decrease reaction count (minimum 0)
            comment.emoji_reactions[emoji] = max(0, current_count - 1)
        else:  # action == "like"
            # Increase reaction count
            comment.emoji_reactions[emoji] = current_count + 1
            
        comment.save()

        # Sort reactions by count (descending)
        sorted_reactions = dict(
            sorted(comment.emoji_reactions.items(), key=lambda x: x[1], reverse=True)
        )

        # Prepare response data
        data = CommentSerializer(comment).data
        data["emoji_reactions"] = sorted_reactions
        data["action_performed"] = action
        data["current_count"] = comment.emoji_reactions.get(emoji, 0)

        return Response(data, status=status.HTTP_200_OK)
class CommentLikeView(generics.UpdateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = "pk"

    def update(self, request, *args, **kwargs):
        comment = Comment.objects.get(id=kwargs["pk"])
        comment.likes += 1
        comment.save()

        return Response(
            CommentSerializer(comment).data,
            status=status.HTTP_200_OK
        )
