from mongoengine import Document, ReferenceField, FloatField, DateTimeField, StringField, DictField
from datetime import datetime
from ..user_model.users import User
from ..artwork_model.artwork import Art
from ..artwork_model.bid import Auction

class Transaction(Document):
    sender = ReferenceField(User, required=True, reverse_delete_rule=2)   
    receiver = ReferenceField(User, required=False, reverse_delete_rule=2)  
    art = ReferenceField(Art, required=False)       
    auction = ReferenceField(Auction, required=False) 

    transaction_type = StringField(
        required=True,
        choices=["Tip", "Donation", "Purchase", "AuctionBid", "CurrencyConversion"]
    )
    
    amount = FloatField(required=True, min_value=0.1)
    currency = StringField(default="PHP")

    payment_method = StringField(choices=["PayPal", "Stripe", "GCash", "CreditCard", "BankTransfer", "System"])
    payment_status = StringField(default="Pending", choices=["Pending", "Completed", "Failed", "Refunded"])

    transaction_id = StringField()   
    extra_data = DictField()        

    timestamp = DateTimeField(default=datetime.utcnow)

    meta = {"collection": "transactions"}
