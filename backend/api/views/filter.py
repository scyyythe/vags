from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from api.models.artwork import Art
from api.serializers.artwork_serializers import ArtSerializer
from api.models.users import User
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

     
        serializer = ArtSerializer(artworks, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)
