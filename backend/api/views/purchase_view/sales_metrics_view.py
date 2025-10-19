from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status as http_status
from rest_framework.permissions import IsAuthenticated
from api.models.purchase_model.order import PurchasedArtwork
from api.models.artwork_model.artwork import Art
from datetime import datetime, timedelta
from django.core.cache import cache
import hashlib

class SalesMetricsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            # Create cache key
            cache_key = f"sales_metrics_{request.user.id}"
            cache_key = hashlib.md5(cache_key.encode()).hexdigest()
            
            # Try to get from cache first (5 minute cache)
            cached_result = cache.get(cache_key)
            if cached_result is not None:
                return Response(cached_result, status=http_status.HTTP_200_OK)
            
            # Get current time and calculate time ranges
            now = datetime.utcnow()
            last_30_days = now - timedelta(days=30)
            
            # Get all purchased artworks where the current user is the seller
            # We need to find artworks owned by the current user that have been purchased
            user_artworks = Art.objects(artist=request.user)
            user_artwork_ids = [str(art.id) for art in user_artworks]
            
            # Get all purchases of the user's artworks
            all_purchases = PurchasedArtwork.objects(artwork__in=user_artwork_ids)
            
            # Debug logging
            print(f"🔍 SalesMetrics - User artwork IDs: {user_artwork_ids}")
            print(f"🔍 SalesMetrics - Total purchases found: {all_purchases.count()}")
            
            # Log all statuses found
            status_counts = {}
            for purchase in all_purchases:
                status = purchase.status
                status_counts[status] = status_counts.get(status, 0) + 1
            print(f"🔍 SalesMetrics - Status breakdown: {status_counts}")
            
            # Calculate metrics
            total_artworks_sold = all_purchases.count()
            
            # Calculate total earnings (only from completed/paid purchases)
            completed_purchases = all_purchases.filter(
                status__in=["Completed", "Paid", "Reviewed"],
                is_paid=True
            )
            total_earnings = sum(purchase.total_price for purchase in completed_purchases)
            
            # Calculate sales by status
            pending_sales = all_purchases.filter(
                status__in=["Ordering", "Pending", "To Receive"]
            ).count()
            
            completed_sales = all_purchases.filter(
                status__in=["Completed", "Reviewed", "Paid"]
            ).count()
            
            cancelled_sales = all_purchases.filter(
                status="Cancelled"
            ).count()
            
            refunded_sales = all_purchases.filter(
                status="Refunded"
            ).count()
            
            # Debug logging for calculated counts
            print(f"🔍 SalesMetrics - Pending sales: {pending_sales}")
            print(f"🔍 SalesMetrics - Completed sales: {completed_sales}")
            print(f"🔍 SalesMetrics - Cancelled sales: {cancelled_sales}")
            print(f"🔍 SalesMetrics - Refunded sales: {refunded_sales}")
            
            # Calculate monthly growth (comparing last 30 days to previous 30 days)
            last_30_days_purchases = all_purchases.filter(
                created_at__gte=last_30_days
            )
            previous_30_days_start = last_30_days - timedelta(days=30)
            previous_30_days_purchases = all_purchases.filter(
                created_at__gte=previous_30_days_start,
                created_at__lt=last_30_days
            )
            
            current_month_sales = last_30_days_purchases.filter(
                status__in=["Completed", "Paid", "Reviewed"],
                is_paid=True
            ).count()
            
            previous_month_sales = previous_30_days_purchases.filter(
                status__in=["Completed", "Paid", "Reviewed"],
                is_paid=True
            ).count()
            
            # Calculate growth percentage
            if previous_month_sales > 0:
                growth_percentage = round(((current_month_sales - previous_month_sales) / previous_month_sales) * 100, 1)
            else:
                growth_percentage = 100.0 if current_month_sales > 0 else 0.0
            
            # Prepare response data
            metrics_data = {
                'total_artworks_sold': total_artworks_sold,
                'total_earnings': total_earnings,
                'pending_sales': pending_sales,
                'completed_sales': completed_sales,
                'cancelled_sales': cancelled_sales,
                'refunded_sales': refunded_sales,
                'current_month_sales': current_month_sales,
                'growth_percentage': growth_percentage,
                'last_updated': now.isoformat()
            }
            
            # Cache the result for 5 minutes
            cache.set(cache_key, metrics_data, 300)
            
            return Response(metrics_data, status=http_status.HTTP_200_OK)
            
        except Exception as e:
            print(f"Error in SalesMetricsView: {e}")
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=http_status.HTTP_500_INTERNAL_SERVER_ERROR)
