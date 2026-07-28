"""Agregaciones sobre Order hechas en el propio Mongo (no cargando todos
los pedidos a Python). Las usa el dashboard admin (Sprint 6) y las
reutilizará el chatbot con IA (Sprint 8) para preguntas como "¿cuál es el
producto más vendido?"."""

import datetime
from decimal import ROUND_HALF_UP, Decimal

from .documents import STATUS_CANCELLED, STATUS_DELIVERED, STATUS_PAID, STATUS_SHIPPED, Order

# Solo se cuenta como venta real el pedido ya pagado (aunque esté enviado
# o entregado, sigue siendo dinero cobrado). pending_payment y cancelled
# no suman a ingresos.
REVENUE_STATUSES = [STATUS_PAID, STATUS_SHIPPED, STATUS_DELIVERED]


def _to_money(value):
    """Redondea antes de convertir a Decimal para evitar artefactos de
    punto flotante (ej. 4797.000000000001) — DecimalField de MongoEngine
    se guarda como float en Mongo, no como Decimal128."""
    return Decimal(str(round(value, 2))).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def get_orders_by_status():
    pipeline = [{"$group": {"_id": "$status", "count": {"$sum": 1}}}]
    return {row["_id"]: row["count"] for row in Order.objects.aggregate(pipeline)}


def get_total_revenue():
    pipeline = [
        {"$match": {"status": {"$in": REVENUE_STATUSES}}},
        {"$group": {"_id": None, "total": {"$sum": "$total"}}},
    ]
    results = list(Order.objects.aggregate(pipeline))
    if not results:
        return Decimal("0.00")
    return _to_money(results[0]["total"])


def get_top_selling_products(limit=5):
    pipeline = [
        {"$match": {"status": {"$in": REVENUE_STATUSES}}},
        {"$unwind": "$items"},
        {
            "$group": {
                "_id": "$items.product",
                "product_name": {"$first": "$items.product_name"},
                "total_quantity": {"$sum": "$items.quantity"},
                "total_revenue": {"$sum": {"$multiply": ["$items.unit_price", "$items.quantity"]}},
            }
        },
        {"$sort": {"total_quantity": -1}},
        {"$limit": limit},
    ]
    results = list(Order.objects.aggregate(pipeline))
    return [
        {
            "product_id": str(row["_id"]) if row["_id"] else None,
            "product_name": row["product_name"],
            "total_quantity": row["total_quantity"],
            "total_revenue": str(_to_money(row["total_revenue"])),
        }
        for row in results
    ]


# Config por periodo: cuántos buckets, de qué tamaño, y cómo se agrupan/
# etiquetan. "day" = últimas 24h por hora, "week" = últimos 7 días por día,
# "month" = últimos 30 días por día.
_PERIOD_CONFIG = {
    "day": {"bucket_delta": datetime.timedelta(hours=1), "num_buckets": 24, "date_format": "%Y-%m-%dT%H:00", "label_format": "%H:00"},
    "week": {"bucket_delta": datetime.timedelta(days=1), "num_buckets": 7, "date_format": "%Y-%m-%d", "label_format": "%d/%m"},
    "month": {"bucket_delta": datetime.timedelta(days=1), "num_buckets": 30, "date_format": "%Y-%m-%d", "label_format": "%d/%m"},
}


def get_sales_timeseries(period="week"):
    """Ventas (pedidos + ingresos) agrupadas por periodo, con buckets sin
    ventas incluidos en 0 — para que la gráfica no "salte" fechas."""
    config = _PERIOD_CONFIG[period]
    bucket_delta = config["bucket_delta"]
    num_buckets = config["num_buckets"]
    date_format = config["date_format"]

    now = datetime.datetime.utcnow()
    if period == "day":
        start = now.replace(minute=0, second=0, microsecond=0) - bucket_delta * (num_buckets - 1)
    else:
        start = now.replace(hour=0, minute=0, second=0, microsecond=0) - bucket_delta * (num_buckets - 1)

    pipeline = [
        {"$match": {"status": {"$in": REVENUE_STATUSES}, "created_at": {"$gte": start}}},
        {
            "$group": {
                "_id": {"$dateToString": {"format": date_format, "date": "$created_at"}},
                "orders": {"$sum": 1},
                "revenue": {"$sum": "$total"},
            }
        },
    ]
    rows = {row["_id"]: row for row in Order.objects.aggregate(pipeline)}

    points = []
    for i in range(num_buckets):
        bucket_start = start + bucket_delta * i
        row = rows.get(bucket_start.strftime(date_format))
        points.append(
            {
                "label": bucket_start.strftime(config["label_format"]),
                "orders": row["orders"] if row else 0,
                "revenue": str(_to_money(row["revenue"])) if row else "0.00",
            }
        )
    return points
