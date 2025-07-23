from django.urls import path
from api.views.purchase_view.purchase_view import PurchaseArtworkView
purchase_urlpatterns = [

   path("purchase/", PurchaseArtworkView.as_view(), name="purchase-artwork"),
]
