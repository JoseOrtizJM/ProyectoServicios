"""Agregación de reseñas para el chatbot con IA (Sprint 8): "¿cuál es el
producto mejor valorado?". Igual que apps/orders/analytics.py, corre en
el propio Mongo en vez de cargar todas las reseñas a Python."""

from apps.catalog.documents import Product

from .documents import Review


def get_top_rated_products(limit=5, min_reviews=1):
    pipeline = [
        {
            "$group": {
                "_id": "$product",
                "average_rating": {"$avg": "$rating"},
                "total_reviews": {"$sum": 1},
            }
        },
        {"$match": {"total_reviews": {"$gte": min_reviews}}},
        {"$sort": {"average_rating": -1, "total_reviews": -1}},
        {"$limit": limit},
    ]
    rows = list(Review.objects.aggregate(pipeline))
    if not rows:
        return []

    products = {p.id: p for p in Product.objects(id__in=[row["_id"] for row in rows if row["_id"]])}

    results = []
    for row in rows:
        product = products.get(row["_id"])
        if not product:
            continue
        results.append(
            {
                "product_id": str(product.id),
                "product_name": product.name,
                "price": str(product.price),
                "average_rating": round(row["average_rating"], 2),
                "total_reviews": row["total_reviews"],
            }
        )
    return results
