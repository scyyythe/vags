
from django.urls import path
from api.views.transaction.transaction_views import TransactionListView

transaction_urlpatterns = [
    path("transactions/", TransactionListView.as_view(), name="transaction-list"),
]
