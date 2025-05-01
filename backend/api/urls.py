from django.urls import path
from .routes.user_routes import user_urlpatterns
from .routes.admin_routes import admin_urlpatterns
from .routes.artwork_routes import artwork_urlpatterns
from .routes.interaction_routes import interaction_urlpatterns
from .routes.filter_routes import filter_urlpatterns
from .routes.tips_routes import tip_urlpatterns
from .routes.auction_routes import auction_urlpatterns
from .routes.bid_routes import bid_urlpatterns
from .routes.report_routes import report_urlpatterns
from .routes.fingerprint_routes import fingerprint_urlpatterns
from .routes.exhibit_routes import exhibit_urlpatterns
from .routes.reset_routes import reset_urlpatterns
from .routes.auth_routes import auth_urlpatterns
urlpatterns = (
    user_urlpatterns +
    admin_urlpatterns +
    artwork_urlpatterns +
    interaction_urlpatterns +
    filter_urlpatterns +
    tip_urlpatterns +
    auction_urlpatterns +
    bid_urlpatterns +
    report_urlpatterns +
    exhibit_urlpatterns +
    reset_urlpatterns +
    fingerprint_urlpatterns
)
