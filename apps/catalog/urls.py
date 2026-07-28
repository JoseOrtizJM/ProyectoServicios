from django.urls import path

from . import views

urlpatterns = [
    path("categories/", views.category_list, name="category-list"),
    path("categories/<str:category_id>/", views.category_detail, name="category-detail"),
    path("brands/", views.brand_list, name="brand-list"),
    path("brands/<str:brand_id>/", views.brand_detail, name="brand-detail"),
    path("products/", views.product_list, name="product-list"),
    path("products/<str:product_id>/", views.product_detail, name="product-detail"),
]
