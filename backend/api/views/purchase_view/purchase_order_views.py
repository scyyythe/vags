from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from api.models.purchase_model.order import PurchasedArtwork, ShippingSnapshot
from api.models.artwork_model.artwork import Art
from api.models.user_model.users import User
from api.serializers.purchase_serializer.purchase_serializer import PurchaseArtworkSerializer
from api.models.transaction_model.transaction import Transaction
from api.models.interaction_model.notification import Notification
from bson import ObjectId
from datetime import datetime


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_purchase_order(request):
    """Create a new purchase order using PurchaseArtworkSerializer"""
    try:
        data = request.data.copy()
        
        # Validate required fields
        if not data.get('artwork') or not data.get('quantity') or not data.get('total_price'):
            return Response({
                'success': False,
                'message': 'Missing required fields: artwork, quantity, total_price',
                'error': 'Invalid data'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Convert artwork ID to ObjectId for validation
        try:
            artwork_id = ObjectId(data['artwork'])
        except Exception:
            return Response({
                'success': False,
                'message': 'Invalid artwork ID format',
                'error': 'Invalid artwork ID'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get the artwork for validation
        try:
            artwork = Art.objects.get(id=artwork_id)
        except Art.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Artwork not found',
                'error': 'Artwork does not exist'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Create a temporary shipping address for the order (will be updated later)
        data['shipping_address'] = {
            'name': 'Temporary',
            'address': 'Temporary',
            'city': 'Temporary',
            'state': 'Temporary',
            'country': 'Philippines',
            'postal_code': '0000',
            'phone': '0000-000-0000'
        }
        
        # Set default payment method and status for order creation
        data['payment_method'] = data.get('payment_method', 'PayPal')
        data['is_paid'] = False
        data['artwork_id'] = data['artwork']  # Rename for serializer
        data['is_purchase_order'] = True  # Flag to indicate this is a purchase order
        
        print(f"DEBUG: create_purchase_order - is_purchase_order: {data['is_purchase_order']}")
        print(f"DEBUG: create_purchase_order - data: {data}")
        
        # Use the PurchaseArtworkSerializer to create the purchase order
        serializer = PurchaseArtworkSerializer(data=data, context={"request": request})
        
        if serializer.is_valid():
            # Override the status to "Ordering" for purchase orders
            purchased_artwork = serializer.save()
            purchased_artwork.status = "Ordering"
            purchased_artwork.save()
            
            return Response({
                'success': True,
                'message': 'Purchase order created successfully',
                'purchase_order_id': str(purchased_artwork.id),
                'data': {
                    'id': str(purchased_artwork.id),
                    'buyer': str(purchased_artwork.buyer.id),
                    'artwork': str(purchased_artwork.artwork.id),
                    'quantity': purchased_artwork.quantity,
                    'total_price': purchased_artwork.total_price,
                    'status': purchased_artwork.status,
                    'created_at': purchased_artwork.created_at.isoformat(),
                    'updated_at': purchased_artwork.updated_at.isoformat()
                }
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'success': False,
                'message': 'Validation failed',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({
            'success': False,
            'message': 'Failed to create purchase order',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_purchase_order(request, order_id):
    """Get purchase order by ID"""
    try:
        purchased_artwork = PurchasedArtwork.objects.get(id=ObjectId(order_id))
        
        # Serialize the data
        data = {
            'id': str(purchased_artwork.id),
            'buyer': str(purchased_artwork.buyer.id),
            'artwork': str(purchased_artwork.artwork.id),
            'shipping_address': {
                'name': purchased_artwork.shipping_address.name,
                'address': purchased_artwork.shipping_address.address,
                'city': purchased_artwork.shipping_address.city,
                'state': purchased_artwork.shipping_address.state,
                'country': purchased_artwork.shipping_address.country,
                'postal_code': purchased_artwork.shipping_address.postal_code,
                'phone': purchased_artwork.shipping_address.phone,
            } if purchased_artwork.shipping_address else None,
            'payment_method': purchased_artwork.payment_method,
            'is_paid': purchased_artwork.is_paid,
            'quantity': purchased_artwork.quantity,
            'total_price': purchased_artwork.total_price,
            'status': purchased_artwork.status,
            'created_at': purchased_artwork.created_at.isoformat(),
            'updated_at': purchased_artwork.updated_at.isoformat()
        }
        
        return Response({
            'success': True,
            'data': data
        }, status=status.HTTP_200_OK)
    except PurchasedArtwork.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Purchase order not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'message': 'Failed to retrieve purchase order',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_purchase_order(request, order_id):
    """Update purchase order (shipping, payment, etc.)"""
    try:
        purchased_artwork = PurchasedArtwork.objects.get(id=ObjectId(order_id))
        
        # Update shipping address if provided
        if 'shipping_address' in request.data:
            shipping_data = request.data['shipping_address']
            purchased_artwork.shipping_address = ShippingSnapshot(
                name=shipping_data.get('name', ''),
                address=shipping_data.get('address', ''),
                city=shipping_data.get('city', ''),
                state=shipping_data.get('state', ''),
                country=shipping_data.get('country', 'Philippines'),
                postal_code=shipping_data.get('postal_code', ''),
                phone=shipping_data.get('phone', '')
            )
            # Keep status as "Ordering" when shipping address is provided
            # Status will only change when payment is completed
        
        # Update payment method if provided
        if 'payment_method' in request.data:
            purchased_artwork.payment_method = request.data['payment_method']
            # Keep status as "Ordering" when payment method is provided
            # Status will only change when payment is completed
        
        # Update payment status if provided
        if 'is_paid' in request.data:
            purchased_artwork.is_paid = request.data['is_paid']
            if request.data['is_paid']:
                purchased_artwork.status = 'Paid'
                
                # When payment is completed, mark artwork as sold and create transaction
                artwork = purchased_artwork.artwork
                
                # IMPORTANT: Only reduce quantity when payment is actually completed
                # This ensures quantity is not reduced during ordering phase
                if artwork.edition in ["Open Edition", "Limited Edition"] and artwork.quantity is not None:
                    artwork.quantity -= purchased_artwork.quantity
                    if artwork.quantity == 0:
                        artwork.art_status = "Sold"  
                    else:
                        artwork.art_status = "onSale" 
                else:
                    # For non-Open Edition artworks, mark as Sold
                    artwork.art_status = "Sold"
                artwork.save()
                
                # Create transaction record for completed payment
                Transaction(
                    sender=purchased_artwork.buyer,
                    receiver=artwork.artist,
                    art=artwork,
                    transaction_type="Purchase",
                    amount=purchased_artwork.total_price,
                    currency="PHP",
                    payment_method=purchased_artwork.payment_method,
                    payment_status="Completed",
                    transaction_id=str(ObjectId()),
                    extra_data={"purchase_id": str(purchased_artwork.id)},
                    timestamp=datetime.now()
                ).save()
                
                # Create notifications ONLY when payment is actually completed
                # Check if this is a real payment completion (not just order submission)
                if request.data.get('payment_completed', False):
                    Notification.objects.create(
                        user=artwork.artist,
                        actor=purchased_artwork.buyer,
                        message=f"{purchased_artwork.buyer.first_name} {purchased_artwork.buyer.last_name} completed payment for: '{artwork.title}'. Please contact them to coordinate the purchase.",
                        name=f"{purchased_artwork.buyer.first_name} {purchased_artwork.buyer.last_name}",
                        action="completed payment for your artwork",
                        target=artwork.title,
                        icon="purchase",
                        created_at=datetime.now(),
                        link=f"/viewproduct/{artwork.id}"
                    )

                    Notification.objects.create(
                        user=purchased_artwork.buyer,
                        actor=purchased_artwork.buyer,
                        message=f"Payment completed for: '{artwork.title}'. The seller will be notified and will contact you soon.",
                        name=f"{purchased_artwork.buyer.first_name} {purchased_artwork.buyer.last_name}",
                        action="completed payment",
                        target=artwork.title,
                        icon="purchase",
                        created_at=datetime.now(),
                        link=f"/viewproduct/{artwork.id}"
                    )
        
        # Update quantity if provided
        if 'quantity' in request.data:
            purchased_artwork.quantity = int(request.data['quantity'])
            # Recalculate total price based on new quantity
            purchased_artwork.total_price = purchased_artwork.artwork.price * purchased_artwork.quantity
        
        purchased_artwork.save()
        
        # Return updated data
        data = {
            'id': str(purchased_artwork.id),
            'buyer': str(purchased_artwork.buyer.id),
            'artwork': str(purchased_artwork.artwork.id),
            'shipping_address': {
                'name': purchased_artwork.shipping_address.name,
                'address': purchased_artwork.shipping_address.address,
                'city': purchased_artwork.shipping_address.city,
                'state': purchased_artwork.shipping_address.state,
                'country': purchased_artwork.shipping_address.country,
                'postal_code': purchased_artwork.shipping_address.postal_code,
                'phone': purchased_artwork.shipping_address.phone,
            } if purchased_artwork.shipping_address else None,
            'payment_method': purchased_artwork.payment_method,
            'is_paid': purchased_artwork.is_paid,
            'quantity': purchased_artwork.quantity,
            'total_price': purchased_artwork.total_price,
            'status': purchased_artwork.status,
            'created_at': purchased_artwork.created_at.isoformat(),
            'updated_at': purchased_artwork.updated_at.isoformat()
        }
        
        return Response({
            'success': True,
            'message': 'Purchase order updated successfully',
            'data': data
        }, status=status.HTTP_200_OK)
    except PurchasedArtwork.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Purchase order not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'message': 'Failed to update purchase order',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def cancel_purchase_order(request, order_id):
    """Cancel purchase order"""
    try:
        purchased_artwork = PurchasedArtwork.objects.get(id=ObjectId(order_id))
        purchased_artwork.status = 'Cancelled'
        purchased_artwork.save()
        
        return Response({
            'success': True,
            'message': 'Purchase order cancelled successfully',
            'data': {
                'id': str(purchased_artwork.id),
                'status': purchased_artwork.status,
                'updated_at': purchased_artwork.updated_at.isoformat()
            }
        }, status=status.HTTP_200_OK)
    except PurchasedArtwork.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Purchase order not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'message': 'Failed to cancel purchase order',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
