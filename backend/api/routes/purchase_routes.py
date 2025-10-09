from django.urls import path
from api.views.purchase_view.purchase_view import PurchaseArtworkView,MyPurchasesView,MarkPurchaseCompletedView,MarkPurchaseAsShippedView
from api.views.purchase_view.review_view import SubmitReviewView
from api.views.purchase_view.sold_artworks_view import MySoldArtworksView,ToggleArtworkStatusView,MarkArtworkAsUnlistedView
from api.views.purchase_view.review_view import SubmitReviewView,AllReviewsByArtworkView, GetReviewByPurchaseView,AllReviewsByPurchaseView,UpdateReviewView,DeleteReviewView
from api.views.payment_views.payment_accounts import ListPaymentAccounts,AddOrUpdatePaymentAccount,DeletePaymentAccount,GetArtistPaymentAccounts
from api.views.transaction.auction_payment import PayPalVerifyAuctionPaymentView
from api.views.transaction.marketplace_payment import PayPalPurchaseVerifyView
purchase_urlpatterns = [

# purchases
   path("purchase/", PurchaseArtworkView.as_view(), name="purchase-artwork"),
   path("my-purchases/", MyPurchasesView.as_view(), name="my-purchases"),
   path("my-purchases/<str:purchase_id>/complete/", MarkPurchaseCompletedView.as_view(), name="mark-purchase-completed"),
   path("my-sales/<str:purchase_id>/mark-shipped/", MarkPurchaseAsShippedView.as_view()),
#   sold artworks
   path("my-sold-artworks/", MySoldArtworksView.as_view(), name="my-sold-artworks"),
    path("my-artworks/<str:artwork_id>/mark-sold/", ToggleArtworkStatusView.as_view(), name="mark-artwork-sold"),
    
   #  unlisted
    path(
   "my-artworks/<str:artwork_id>/mark-unlisted/",MarkArtworkAsUnlistedView.as_view(),name="mark-artwork-unlisted"),
   # review
   path("submit-review/", SubmitReviewView.as_view(), name="submit-review"),
   path("get-review-by-purchase/", GetReviewByPurchaseView.as_view(), name="get-review-by-purchase"),
   path("review/<str:review_id>/update/", UpdateReviewView.as_view()),
   path("review/<str:review_id>/delete/", DeleteReviewView.as_view()),
   path("review/all-by-purchase/<str:purchase_id>/", AllReviewsByPurchaseView.as_view(), name="all-reviews-by-purchase"),
     path(
        "review/all-by-artwork/<str:artwork_id>/",
        AllReviewsByArtworkView.as_view(),
        name="all-reviews-by-artwork"
    ),
     
     
   # payment account roiutes
   path("accounts/", ListPaymentAccounts.as_view(), name="list-payment-accounts"),
   
    path("accounts/save/", AddOrUpdatePaymentAccount.as_view(), name="add-update-account"),
    path("accounts/<str:account_id>/delete/", DeletePaymentAccount.as_view(), name="delete-account"),
   path("payment/accounts/artist/<str:artist_id>/", GetArtistPaymentAccounts.as_view(), name="artist-payment-accounts"),

    
    #payment acution payppal
     path('paypal/verify-auction/', PayPalVerifyAuctionPaymentView.as_view(), name='paypal-verify-auction'),
     
   #paypal marketpkace
   path("paypal/verify-purchase/", PayPalPurchaseVerifyView.as_view(), name="paypal-verify-purchase"),
]
