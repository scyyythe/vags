from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated,IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework import status
from api.serializers.review_serializer.review_serializer import ReviewSerializer
from api.models.review_model.review import Review
from api.utils.notification_utils import notify_review_submitted, notify_review_updated, notify_review_deleted
from bson import ObjectId
from api.serializers.review_serializer.review_serializer import ReviewSerializer, ReviewUpdateSerializer,ReviewReadSerializer

class SubmitReviewView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ReviewSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            review = serializer.save()
            
            # Create notification for review submission
            if review.artwork and review.artwork.artist:
                notify_review_submitted(
                    reviewer=request.user,
                    seller=review.artwork.artist,
                    artwork=review.artwork,
                    review_id=str(review.id),
                    rating=review.rating
                )
            
            return Response({"message": "Review submitted successfully!", "review_id": str(review.id)}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GetReviewByPurchaseView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        purchase_id = request.data.get("purchase_id")
        if not purchase_id:
            return Response({"error": "purchase_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            review = Review.objects.get(purchase=ObjectId(purchase_id))
        except Review.DoesNotExist:
            return Response({"error": "Review not found."}, status=status.HTTP_404_NOT_FOUND)

        artwork = review.artwork

        return Response({
            "id": str(review.id),
            "rating": review.rating,
            "comment": review.comment,
            "photos": review.photos,
            "reviewDate": review.created_at,
            "canEdit": True, 
            "canDelete": True,
            "reviewerName": review.reviewer.username,
            "artwork": {
                "artworkImage": getattr(artwork, "image", ""), 
                "title": artwork.title,
                "artist": getattr(artwork, "artist_name", "Unknown")  
            }
        }, status=status.HTTP_200_OK)
        
        
class UpdateReviewView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, review_id):
        try:
            review = Review.objects.get(id=ObjectId(review_id), reviewer=request.user)
        except Review.DoesNotExist:
            return Response({"error": "Review not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ReviewUpdateSerializer(data=request.data)
        if serializer.is_valid():
            validated_data = serializer.validated_data
            review.rating = validated_data["rating"]
            review.comment = validated_data.get("comment", "")
            review.photos = validated_data.get("photos", [])
            review.save()
            
            # Create notification for review update
            if review.artwork and review.artwork.artist:
                notify_review_updated(
                    reviewer=request.user,
                    seller=review.artwork.artist,
                    artwork=review.artwork,
                    review_id=str(review.id),
                    rating=review.rating
                )
            
            return Response({"message": "Review updated successfully."})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
    
class DeleteReviewView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, review_id):
        try:
            review = Review.objects.get(id=ObjectId(review_id), reviewer=request.user)
        except Review.DoesNotExist:
            return Response({"error": "Review not found."}, status=status.HTTP_404_NOT_FOUND)

      
        purchase = review.purchase


        # Store artwork info before deletion for notification
        artwork = review.artwork
        seller = artwork.artist if artwork else None
        
        review.delete()

        if purchase:
            purchase.status = "Completed"
            purchase.save()

        # Create notification for review deletion
        if artwork and seller:
            notify_review_deleted(
                reviewer=request.user,
                seller=seller,
                artwork=artwork
            )

        return Response({"message": "Review deleted successfully."}, status=status.HTTP_204_NO_CONTENT)



class AllReviewsByPurchaseView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, purchase_id):
        try:
            reviews = Review.objects(purchase=ObjectId(purchase_id))
        except Exception:
            return Response({"error": "Invalid purchase ID."}, status=status.HTTP_400_BAD_REQUEST)

        if not reviews:
            return Response({"message": "No reviews found for this purchase."}, status=status.HTTP_404_NOT_FOUND)

        data = []
        for review in reviews:
            data.append({
                "id": str(review.id),
                "rating": review.rating,
                "comment": review.comment,
                "photos": review.photos,
                "created_at": review.created_at,
                "reviewerName": review.reviewer.username,
            })

        return Response(data, status=status.HTTP_200_OK)

class AllReviewsByArtworkView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly] 

    def get(self, request, artwork_id):
        try:
            reviews = Review.objects(artwork=ObjectId(artwork_id))
        except Exception:
            return Response({"error": "Invalid artwork ID."}, status=status.HTTP_400_BAD_REQUEST)

        if not reviews:
            return Response([], status=status.HTTP_200_OK) 

        serializer = ReviewReadSerializer(reviews, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
