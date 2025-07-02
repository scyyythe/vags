# views/comment_views.py
from rest_framework import generics
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from api.models.interaction_model.comment import Comment
from api.models.artwork_model.artwork import Art
from api.serializers.interaction_s.comment_serializer import CommentSerializer

class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        artwork_id = self.kwargs['artwork_id']
        return Comment.objects(artwork=artwork_id, parent=None)

    def perform_create(self, serializer):
        artwork = Art.objects.get(id=self.kwargs['artwork_id'])
        parent = None
        if self.request.data.get("parentId"):
            parent = Comment.objects.get(id=self.request.data["parentId"])
        comment = Comment(
            artwork=artwork,
            user=self.request.user,
            text=self.request.data["text"],
            parent=parent
        )
        comment.save()
        serializer.instance = comment

class CommentRepliesView(generics.ListAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return Comment.objects(parent=self.kwargs['comment_id'])
