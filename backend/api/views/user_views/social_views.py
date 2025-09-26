from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from bson import ObjectId

from api.models.user_model.social_model import Social
from api.serializers.user_s.social_serializer import SocialSerializer
from api.models.user_model.users import User


class SocialsView(APIView):
    permission_classes = [IsAuthenticated]


    def get(self, request, user_id):
        socials = Social.objects(user=ObjectId(user_id))
        serializer = SocialSerializer(socials, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


    def post(self, request, user_id):
        try:
            user = User.objects.get(id=ObjectId(user_id))
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        data = request.data.copy()
        data["user"] = user

        serializer = SocialSerializer(data=data)
        if serializer.is_valid():
            social = serializer.create(validated_data=data)
            return Response(SocialSerializer(social).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DeleteSocialView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, social_id):
        try:
            social = Social.objects.get(id=ObjectId(social_id))
            social.delete()
            return Response({"message": "Social deleted"}, status=status.HTTP_204_NO_CONTENT)
        except Social.DoesNotExist:
            return Response({"error": "Social not found"}, status=status.HTTP_404_NOT_FOUND)
