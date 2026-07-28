from django.urls import path

from . import views

urlpatterns = [
    path("summary/", views.dashboard_summary, name="dashboard-summary"),
    path("sales-chart/", views.dashboard_sales_chart, name="dashboard-sales-chart"),
    path("top-products/", views.dashboard_top_products, name="dashboard-top-products"),
]
