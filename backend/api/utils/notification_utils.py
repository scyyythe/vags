from datetime import datetime
from api.models.interaction_model.notification import Notification
from api.models.user_model.users import User
from bson import ObjectId

def create_notification(
    recipient_user_id,
    actor_user,
    message,
    action=None,
    target=None,
    icon=None,
    link=None,
    amount=None,
    artwork=None,
    auction=None,
    exhibit=None
):
   
    try:
        # Get the recipient user
        recipient_user = User.objects.get(id=ObjectId(recipient_user_id))
        
        # Create the notification
        notification = Notification(
            user=recipient_user,
            actor=actor_user,
            message=message,
            name=f"{actor_user.first_name} {actor_user.last_name}".strip(),
            action=action,
            target=target,
            icon=icon,
            link=link,
            amount=amount,
            art=artwork,
            auction=auction,
            exhibit=exhibit,
            created_at=datetime.utcnow()
        )
        
        notification.save()
        return notification
        
    except Exception as e:
        print(f"Error creating notification: {e}")
        return None

def notify_purchase_created(buyer, seller, artwork, purchase_id, total_price):
    """Create notifications for a new purchase"""
    notifications = []
    
    # Notify the seller (artist)
    seller_notification = create_notification(
        recipient_user_id=str(seller.id),
        actor_user=buyer,
        message=f"{buyer.first_name} {buyer.last_name} purchased your artwork: '{artwork.title}'",
        action="purchased your artwork",
        target=artwork.title,
        icon="purchase",
        link=f"/viewproduct/{artwork.id}",
        amount=f"₱{total_price:,.2f}",
        artwork=artwork
    )
    if seller_notification:
        notifications.append(seller_notification)
    
    # Notify the buyer
    buyer_notification = create_notification(
        recipient_user_id=str(buyer.id),
        actor_user=buyer,
        message=f"You successfully purchased: '{artwork.title}'",
        action="purchased an artwork",
        target=artwork.title,
        icon="purchase",
        link=f"/viewproduct/{artwork.id}",
        amount=f"₱{total_price:,.2f}",
        artwork=artwork
    )
    if buyer_notification:
        notifications.append(buyer_notification)
    
    return notifications

def notify_purchase_status_update(buyer, seller, artwork, purchase_id, new_status, updated_by):
    """Create notifications for purchase status updates"""
    notifications = []
    
    if new_status == "To Receive":
        # Notify buyer that item is shipped
        buyer_notification = create_notification(
            recipient_user_id=str(buyer.id),
            actor_user=updated_by,
            message=f"'{artwork.title}' has been shipped and is on its way to you!",
            action="shipped your order",
            target=artwork.title,
            icon="shipping",
            link=f"/viewproduct/{artwork.id}",
            artwork=artwork
        )
        if buyer_notification:
            notifications.append(buyer_notification)
    
    elif new_status == "Completed":
        # Notify seller that order is completed
        seller_notification = create_notification(
            recipient_user_id=str(seller.id),
            actor_user=buyer,
            message=f"'{artwork.title}' order has been completed by {buyer.first_name} {buyer.last_name}",
            action="completed your order",
            target=artwork.title,
            icon="completed",
            link=f"/viewproduct/{artwork.id}",
            artwork=artwork
        )
        if seller_notification:
            notifications.append(seller_notification)
    
    return notifications

def notify_review_submitted(reviewer, seller, artwork, review_id, rating):
    """Create notifications for review submission"""
    notifications = []
    
    # Notify the seller about the review
    seller_notification = create_notification(
        recipient_user_id=str(seller.id),
        actor_user=reviewer,
        message=f"{reviewer.first_name} {reviewer.last_name} left a {rating}-star review for '{artwork.title}'",
        action="reviewed your artwork",
        target=artwork.title,
        icon="review",
        link=f"/viewproduct/{artwork.id}",
        amount=f"{rating} stars",
        artwork=artwork
    )
    if seller_notification:
        notifications.append(seller_notification)
    
    return notifications

def notify_review_updated(reviewer, seller, artwork, review_id, rating):
    """Create notifications for review updates"""
    notifications = []
    
    # Notify the seller about the updated review
    seller_notification = create_notification(
        recipient_user_id=str(seller.id),
        actor_user=reviewer,
        message=f"{reviewer.first_name} {reviewer.last_name} updated their review for '{artwork.title}' to {rating} stars",
        action="updated their review",
        target=artwork.title,
        icon="review",
        link=f"/viewproduct/{artwork.id}",
        amount=f"{rating} stars",
        artwork=artwork
    )
    if seller_notification:
        notifications.append(seller_notification)
    
    return notifications

def notify_review_deleted(reviewer, seller, artwork):
    """Create notifications for review deletion"""
    notifications = []
    
    # Notify the seller about the deleted review
    seller_notification = create_notification(
        recipient_user_id=str(seller.id),
        actor_user=reviewer,
        message=f"{reviewer.first_name} {reviewer.last_name} deleted their review for '{artwork.title}'",
        action="deleted their review",
        target=artwork.title,
        icon="review",
        link=f"/viewproduct/{artwork.id}",
        artwork=artwork
    )
    if seller_notification:
        notifications.append(seller_notification)
    
    return notifications

def notify_artwork_listed_for_sale(artist, artwork, price):
    """Create notification when artwork is listed for sale (optimized)"""
    try:
        # Create notification directly without extra database queries
        notification = Notification(
            user=artist,
            actor=artist,
            message=f"Your artwork '{artwork.title}' has been successfully listed for sale at ₱{price:,.2f}",
            name=f"{artist.first_name} {artist.last_name}".strip(),
            action="listed artwork for sale",
            target=artwork.title,
            icon="sale",
            link=f"/viewproduct/{artwork.id}",
            amount=f"₱{price:,.2f}",
            art=artwork,
            created_at=datetime.utcnow()
        )
        
        notification.save()
        return [notification]
        
    except Exception as e:
        print(f"Error creating artwork listing notification: {e}")
        return []
