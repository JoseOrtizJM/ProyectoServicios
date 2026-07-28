from django.urls import include, path

urlpatterns = [
    path("api/", include("apps.common.urls")),
    path("api/auth/", include("apps.users.urls")),
    path("api/catalog/", include("apps.catalog.urls")),
    path("api/reviews/", include("apps.reviews.urls")),
    path("api/cart/", include("apps.cart.urls")),
]
