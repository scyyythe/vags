from django.urls import path
from api.views.artwork_views.tip_views import TipCreateView, TipListView, TotalTipsView, TipReceivedListView

tip_urlpatterns = [
    path('tip/', TipCreateView.as_view(), name='create-tip'),
    path('tips/', TipListView.as_view(), name='all-tips'),
    path('tips/received/<str:username>/', TipReceivedListView.as_view(), name='tips-received'),
    path('tips/total/<str:username>/', TotalTipsView.as_view(), name='total-tips'),
]
