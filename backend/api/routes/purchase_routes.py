from django.urls import path
from api.views.purchase_view.purchase_view import PurchaseArtworkView,MyPurchasesView
from api.views.purchase_view.review_view import SubmitReviewView
from api.views.purchase_view.sold_artworks_view import MySoldArtworksView
from api.views.purchase_view.review_view import SubmitReviewView, GetReviewByPurchaseView,AllReviewsByPurchaseView,UpdateReviewView,DeleteReviewView
purchase_urlpatterns = [

# purchases
   path("purchase/", PurchaseArtworkView.as_view(), name="purchase-artwork"),
   path("my-purchases/", MyPurchasesView.as_view(), name="my-purchases"),
  
#   sold artworks
   path("my-sold-artworks/", MySoldArtworksView.as_view(), name="my-sold-artworks"),
   
   # review
   path("submit-review/", SubmitReviewView.as_view(), name="submit-review"),
   path("get-review-by-purchase/", GetReviewByPurchaseView.as_view(), name="get-review-by-purchase"),
   path("review/<str:review_id>/update/", UpdateReviewView.as_view()),
   path("review/<str:review_id>/delete/", DeleteReviewView.as_view()),
   path("review/all-by-purchase/<str:purchase_id>/", AllReviewsByPurchaseView.as_view(), name="all-reviews-by-purchase"),
]
