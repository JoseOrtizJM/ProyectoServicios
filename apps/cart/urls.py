from django.urls import path

from . import views

urlpatterns = [
    path("", views.cart_detail, name="cart-detail"),
    path("items/", views.cart_item_add, name="cart-item-add"),
    path("items/<str:product_id>/", views.cart_item_detail, name="cart-item-detail"),
]
