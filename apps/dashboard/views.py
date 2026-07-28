from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from apps.catalog.documents import Brand, Category, Product
from apps.common.permissions import IsAdmin
from apps.orders.analytics import get_orders_by_status, get_top_selling_products, get_total_revenue
from apps.orders.documents import Order, STATUS_CHOICES
from apps.orders.serializers import OrderSerializer
from apps.users.documents import ROLE_ADMIN, ROLE_USER, User

DashboardSummarySerializer = inline_serializer(
    name="DashboardSummary",
    fields={
        "sales": inline_serializer(
            name="DashboardSales",
            fields={
                "total_orders": serializers.IntegerField(),
                "total_revenue": serializers.CharField(),
                "orders_by_status": inline_serializer(
                    name="OrdersByStatus",
                    fields={status_value: serializers.IntegerField() for status_value in STATUS_CHOICES},
                ),
            },
        ),
        "top_selling_products": inline_serializer(
            name="TopSellingProduct",
            fields={
                "product_id": serializers.CharField(allow_null=True),
                "product_name": serializers.CharField(),
                "total_quantity": serializers.IntegerField(),
                "total_revenue": serializers.CharField(),
            },
            many=True,
        ),
        "catalog": inline_serializer(
            name="DashboardCatalog",
            fields={
                "total_active_products": serializers.IntegerField(),
                "total_categories": serializers.IntegerField(),
                "total_brands": serializers.IntegerField(),
            },
        ),
        "users": inline_serializer(
            name="DashboardUsers",
            fields={
                "total_users": serializers.IntegerField(),
                "total_admins": serializers.IntegerField(),
                "blocked_users": serializers.IntegerField(),
            },
        ),
        "recent_orders": OrderSerializer(many=True),
    },
)


@extend_schema(
    tags=["Admin — Dashboard"],
    summary="Resumen de ventas (admin)",
    description="Ventas, pedidos por estado, top 5 productos más vendidos, catálogo, "
    "usuarios y últimos 5 pedidos. Las agregaciones corren en el propio Mongo.",
    responses={200: DashboardSummarySerializer},
)
@api_view(["GET"])
@permission_classes([IsAdmin])
def dashboard_summary(request):
    orders_by_status = get_orders_by_status()

    data = {
        "sales": {
            "total_orders": sum(orders_by_status.values()),
            "total_revenue": str(get_total_revenue()),
            "orders_by_status": {s: orders_by_status.get(s, 0) for s in STATUS_CHOICES},
        },
        "top_selling_products": get_top_selling_products(limit=5),
        "catalog": {
            "total_active_products": Product.objects(is_active=True).count(),
            "total_categories": Category.objects.count(),
            "total_brands": Brand.objects.count(),
        },
        "users": {
            "total_users": User.objects(role=ROLE_USER).count(),
            "total_admins": User.objects(role=ROLE_ADMIN).count(),
            "blocked_users": User.objects(is_active=False).count(),
        },
        "recent_orders": OrderSerializer(
            Order.objects.order_by("-created_at")[:5], many=True
        ).data,
    }
    return Response(data)
