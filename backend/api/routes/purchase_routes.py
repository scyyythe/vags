from django.urls import path
from api.views.purchase_view.purchase_view import PurchaseArtworkView,MyPurchasesView
from api.views.purchase_view.review_view import SubmitReviewView
from api.views.purchase_view.sold_artworks_view import MySoldArtworksView
purchase_urlpatterns = [

   path("purchase/", PurchaseArtworkView.as_view(), name="purchase-artwork"),
   path("my-purchases/", MyPurchasesView.as_view(), name="my-purchases"),
   path("submit-review/", SubmitReviewView.as_view(), name="submit-review"),
   path("my-sold-artworks/", MySoldArtworksView.as_view(), name="my-sold-artworks"),
]
