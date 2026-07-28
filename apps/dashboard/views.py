from drf_spectacular.utils import OpenApiParameter, extend_schema, inline_serializer
from rest_framework import serializers, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from apps.catalog.documents import Brand, Category, Product
from apps.common.permissions import IsAdmin
from apps.common.schema import DetailSerializer
from apps.orders.analytics import (
    get_orders_by_status,
    get_sales_timeseries,
    get_top_selling_products,
    get_total_revenue,
)
from apps.orders.documents import Order, STATUS_CHOICES
from apps.orders.serializers import OrderSerializer
from apps.reviews.analytics import get_top_rated_products
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


SalesChartSerializer = inline_serializer(
    name="SalesChartPoint",
    fields={
        "label": serializers.CharField(),
        "orders": serializers.IntegerField(),
        "revenue": serializers.CharField(),
    },
    many=True,
)


@extend_schema(
    tags=["Admin — Dashboard"],
    summary="Serie de ventas por periodo (admin)",
    description="Pedidos e ingresos agrupados por hora ('day', últimas 24h), por día "
    "('week', últimos 7 días) o por día ('month', últimos 30 días). Los periodos sin "
    "ventas se incluyen en 0 para que la gráfica no salte fechas.",
    parameters=[OpenApiParameter("period", str, description="'day', 'week' o 'month'. Por defecto 'week'.")],
    responses={200: SalesChartSerializer, 400: DetailSerializer},
)
@api_view(["GET"])
@permission_classes([IsAdmin])
def dashboard_sales_chart(request):
    period = request.query_params.get("period", "week")
    if period not in ("day", "week", "month"):
        return Response({"period": ["Debe ser 'day', 'week' o 'month'."]}, status=status.HTTP_400_BAD_REQUEST)
    return Response(get_sales_timeseries(period))


DashboardTopProductsSerializer = inline_serializer(
    name="DashboardTopProducts",
    fields={
        "top_selling": inline_serializer(
            name="TopSellingProductChart",
            fields={
                "product_id": serializers.CharField(allow_null=True),
                "product_name": serializers.CharField(),
                "total_quantity": serializers.IntegerField(),
                "total_revenue": serializers.CharField(),
            },
            many=True,
        ),
        "top_rated": inline_serializer(
            name="TopRatedProductChart",
            fields={
                "product_id": serializers.CharField(),
                "product_name": serializers.CharField(),
                "price": serializers.CharField(),
                "average_rating": serializers.FloatField(),
                "total_reviews": serializers.IntegerField(),
            },
            many=True,
        ),
    },
)


@extend_schema(
    tags=["Admin — Dashboard"],
    summary="Productos más vendidos y mejor valorados (admin)",
    parameters=[OpenApiParameter("limit", int, description="Cuántos productos por lista (por defecto 10).")],
    responses={200: DashboardTopProductsSerializer},
)
@api_view(["GET"])
@permission_classes([IsAdmin])
def dashboard_top_products(request):
    try:
        limit = int(request.query_params.get("limit", 10))
    except ValueError:
        limit = 10
    return Response(
        {
            "top_selling": get_top_selling_products(limit=limit),
            "top_rated": get_top_rated_products(limit=limit),
        }
    )
