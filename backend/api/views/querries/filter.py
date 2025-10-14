from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from api.models.artwork_model.artwork import Art
from api.serializers.artwork_s.artwork_serializers import ArtSerializer
from api.models.user_model.users import User
from bson import ObjectId
from mongoengine.queryset.visitor import Q  

class ArtSearchAndFilterView(APIView):
    def get(self, request, *args, **kwargs):

        search_query = request.GET.get('search', '')  
        artist_id = request.GET.get('artist', None)   
        category = request.GET.get('category', None) 
        art_status = request.GET.get('art_status', None)  
        min_price = request.GET.get('min_price', None)  
        max_price = request.GET.get('max_price', None)  


        query = Q()  
        if search_query:
     
            query &= (Q(title__icontains=search_query) | Q(description__icontains=search_query))

        if artist_id:
            query &= Q(artist=ObjectId(artist_id))

        if category:
            query &= Q(category=category)

        if art_status:
            query &= Q(art_status=art_status)

        if min_price:
            query &= Q(price__gte=int(min_price))

        if max_price:
            query &= Q(price__lte=int(max_price))

        artworks = Art.objects(query)
        
        # Get deactivated user IDs to exclude their content
        deactivated_user_ids = User.objects(user_status__iexact="deactivated").scalar('id')
        scheduled_deletion_user_ids = User.objects(user_status__iexact="scheduled_for_deletion").scalar('id')
        
        # Exclude content from deactivated and scheduled for deletion users
        if deactivated_user_ids or scheduled_deletion_user_ids:
            excluded_user_ids = list(deactivated_user_ids) + list(scheduled_deletion_user_ids)
            artworks = artworks.filter(artist__nin=excluded_user_ids)

     
        serializer = ArtSerializer(artworks, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)
