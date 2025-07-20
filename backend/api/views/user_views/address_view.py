from rest_framework import status, permissions, viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from bson import ObjectId
from bson.errors import InvalidId
from django.http import Http404
from api.models.user_model.address import Address
from api.serializers.user_s.address_serializer import AddressSerializer
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects(user=self.request.user)

    def get_object(self):
        try:
            object_id = ObjectId(self.kwargs["pk"])
        except InvalidId:
            raise Http404("Invalid address ID")

        try:
            return Address.objects.get(id=object_id, user=self.request.user)
        except Address.DoesNotExist:
            raise Http404("Address not found")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class DefaultAddressView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        address = Address.objects(user=request.user, is_default=True).first()
        if not address:
            return Response({"detail": "No default address."}, status=status.HTTP_404_NOT_FOUND)
        return Response(AddressSerializer(address).data, status=status.HTTP_200_OK)
    
    


class SetDefaultAddressView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, address_id):
        try:
            address_obj_id = ObjectId(address_id)
        except Exception:
            return Response({"detail": "Invalid address ID"}, status=status.HTTP_400_BAD_REQUEST)

        # Find the address belonging to the user
        address = Address.objects(user=request.user, id=address_obj_id).first()
        if not address:
            return Response({"detail": "Address not found"}, status=status.HTTP_404_NOT_FOUND)

        # Unset others
        Address.objects(user=request.user, is_default=True).update(is_default=False)

        # Set this one
        address.is_default = True
        address.save()

        return Response({"detail": "Default address set successfully."}, status=status.HTTP_200_OK)
