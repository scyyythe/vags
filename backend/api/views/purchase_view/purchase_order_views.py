from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from api.models.purchase_model.order import PurchasedArtwork, ShippingSnapshot
from api.models.artwork_model.artwork import Art
from api.models.user_model.users import User
from bson import ObjectId


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_purchase_order(request):
    """Create a new purchase order with artwork details only"""
    try:
        data = request.data.copy()
        
        # Validate required fields
        if not data.get('artwork') or not data.get('quantity') or not data.get('total_price'):
            return Response({
                'success': False,
                'message': 'Missing required fields: artwork, quantity, total_price',
                'error': 'Invalid data'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Convert artwork ID to ObjectId
        try:
            artwork_id = ObjectId(data['artwork'])
        except Exception:
            return Response({
                'success': False,
                'message': 'Invalid artwork ID format',
                'error': 'Invalid artwork ID'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get the artwork
        try:
            artwork = Art.objects.get(id=artwork_id)
        except Art.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Artwork not found',
                'error': 'Artwork does not exist'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Create a minimal shipping address for now (will be updated later)
        shipping_address = ShippingSnapshot(
            name="Temporary",
            address="Temporary",
            city="Temporary",
            state="Temporary",
            country="Philippines",
            postal_code="0000",
            phone="0000-000-0000"
        )
        
        # Create PurchasedArtwork with status "Ordering"
        purchased_artwork = PurchasedArtwork(
            buyer=request.user,
            artwork=artwork,
            shipping_address=shipping_address,
            payment_method="PayPal",  # Default to PayPal, will be updated later
            is_paid=False,
            quantity=int(data['quantity']),
            total_price=float(data['total_price']),
            status="Ordering"
        )
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
            purchased_artwork.status = 'Shipping'
        
        # Update payment method if provided
        if 'payment_method' in request.data:
            purchased_artwork.payment_method = request.data['payment_method']
            purchased_artwork.status = 'Payment'
        
        # Update payment status if provided
        if 'is_paid' in request.data:
            purchased_artwork.is_paid = request.data['is_paid']
            if request.data['is_paid']:
                purchased_artwork.status = 'Completed'
        
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
