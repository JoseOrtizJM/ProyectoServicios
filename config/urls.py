from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView

urlpatterns = [
    path("api/", include("apps.common.urls")),
    path("api/auth/", include("apps.users.urls")),
    path("api/catalog/", include("apps.catalog.urls")),
    path("api/reviews/", include("apps.reviews.urls")),
    path("api/cart/", include("apps.cart.urls")),
    path("api/orders/", include("apps.orders.urls")),
    path("api/dashboard/", include("apps.dashboard.urls")),
    path("api/chatbot/", include("apps.chatbot.urls")),
    # Documentación de la API
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
]
