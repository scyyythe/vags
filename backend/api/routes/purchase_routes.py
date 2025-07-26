from django.urls import path
from api.views.purchase_view.purchase_view import PurchaseArtworkView,MyPurchasesView
purchase_urlpatterns = [

   path("purchase/", PurchaseArtworkView.as_view(), name="purchase-artwork"),
   path("my-purchases/", MyPurchasesView.as_view(), name="my-purchases"),
]
