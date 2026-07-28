from django.urls import path

from . import views

urlpatterns = [
    # Rutas literales primero para que no choquen con el catch-all <order_id>.
    path("checkout/", views.checkout, name="order-checkout"),
    path("cards/", views.card_list, name="card-list"),
    path("cards/<str:card_id>/", views.card_detail, name="card-detail"),
    path("admin/", views.admin_order_list, name="admin-order-list"),
    path("admin/<str:order_id>/status/", views.admin_order_status_update, name="admin-order-status-update"),
    path("", views.order_list, name="order-list"),
    path("<str:order_id>/", views.order_detail, name="order-detail"),
]
