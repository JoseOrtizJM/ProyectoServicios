"""Agregaciones sobre Order hechas en el propio Mongo (no cargando todos
los pedidos a Python). Las usa el dashboard admin (Sprint 6) y las
reutilizará el chatbot con IA (Sprint 8) para preguntas como "¿cuál es el
producto más vendido?"."""

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
