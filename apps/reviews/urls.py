from django.urls import path

from . import views

urlpatterns = [
    # Rutas literales primero para que no choquen con el catch-all <review_id>.
    path("admin/", views.admin_review_list, name="admin-review-list"),
    path("products/<str:product_id>/", views.product_review_list, name="product-review-list"),
    path("<str:review_id>/", views.review_detail, name="review-detail"),
]
