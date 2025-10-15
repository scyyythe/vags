from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from api.models.payment_model.payment_accounts import PaymentAccount
from datetime import datetime
from rest_framework.parsers import MultiPartParser, FormParser
from api.utils.cloudinary_utils import cloudinary
from rest_framework.permissions import AllowAny
from django.core.cache import cache
from django.conf import settings
import hashlib

class ListPaymentAccounts(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Create cache key for user's payment accounts
        user_id = str(request.user.id)
        cache_key = f"payment_accounts_{user_id}"
        
        # Try to get from cache first
        cached_data = cache.get(cache_key)
        if cached_data is not None:
            return Response(cached_data, status=status.HTTP_200_OK)
        
        # Query payment accounts for the user (simplified for existing data)
        accounts = PaymentAccount.objects(user=request.user)
        
        
        # Use list comprehension for better performance than loop
        data = [
            {
                "id": str(acc.id),
                "type": acc.type,
                "name": acc.name,
                "account_info": acc.account_info,
                "stripe_account_id": getattr(acc, 'stripe_account_id', None),
                "is_default": acc.is_default,
                "details": acc.details or {},
                "qr_image_url": getattr(acc, "qr_image_url", None), 
                "created_at": acc.created_at.isoformat() if acc.created_at else None,
            }
            for acc in accounts
        ]
        
        # Cache the result for 5 minutes
        cache.set(cache_key, data, 300)
        
        return Response(data, status=status.HTTP_200_OK)


class AddOrUpdatePaymentAccount(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser] 

    def post(self, request):
        payload = request.data
        acc_id = payload.get("id")


        if acc_id:
            account = PaymentAccount.objects(user=request.user, id=acc_id).first()
            if not account:
                return Response({"error": "Account not found"}, status=status.HTTP_404_NOT_FOUND)
        else:
            account = PaymentAccount(user=request.user)


        account.type = payload.get("type")
        account.name = payload.get("name")
        account.account_info = payload.get("account_info")
        account.details = payload.get("details", {})
        is_default_value = payload.get("is_default", False)
        
        if isinstance(is_default_value, str):
            is_default_value = is_default_value.lower() == "true"
        account.is_default = bool(is_default_value)

       
        if "qr_image" in request.FILES:
            try:
                result = cloudinary.uploader.unsigned_upload(
                    request.FILES["qr_image"],
                    upload_preset="user_profile_uploads",  
                )
                account.qr_image_url = result.get("secure_url", "")
            except Exception as e:
                return Response(
                    {"error": f"Cloudinary upload failed: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

      
        if account.type == "stripe":
            account.stripe_account_id = payload.get("stripe_account_id")

  
        if account.is_default:
            PaymentAccount.objects(user=request.user, id__ne=account.id).update(set__is_default=False)

   
        account.updated_at = datetime.utcnow()
        account.save()
        
        # Invalidate cache for this user's payment accounts
        user_id = str(request.user.id)
        cache_key = f"payment_accounts_{user_id}"
        cache.delete(cache_key)

        return Response({
            "message": "Saved successfully",
            "id": str(account.id),
            "qr_image_url": account.qr_image_url,
        }, status=status.HTTP_201_CREATED)

class DeletePaymentAccount(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, account_id):
        account = PaymentAccount.objects(user=request.user, id=account_id).first()
        if not account:
            return Response({"error": "Account not found"}, status=404)
        account.delete()
        
        # Invalidate cache for this user's payment accounts
        user_id = str(request.user.id)
        cache_key = f"payment_accounts_{user_id}"
        cache.delete(cache_key)
        
        return Response({"message": "Deleted successfully"})

class GetArtistPaymentAccounts(APIView):
    permission_classes = [AllowAny]

    def get(self, request, artist_id):
        # Query artist payment accounts (simplified for existing data)
        accounts = PaymentAccount.objects(user=artist_id)
        
        data = [
            {   
                "name": acc.name,
                "type": acc.type,
                "account_info": acc.account_info,
                "is_default": acc.is_default,
                "qr_image_url": getattr(acc, "qr_image_url", None),
            }
            for acc in accounts
        ]
        return Response(data, status=200)
