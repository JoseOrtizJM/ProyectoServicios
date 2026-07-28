"""Consultas de catálogo pensadas para reutilizarse desde el chatbot con
IA (Sprint 8) además de la API normal — el chatbot no conoce ObjectIds,
así que estas funciones resuelven categoría/marca por nombre."""

from .documents import Brand, Category, Product


def _resolve_category_id(category_name):
    if not category_name:
        return None
    category = Category.objects(name__icontains=category_name).first()
    return category.id if category else None


def _resolve_brand_id(brand_name):
    if not brand_name:
        return None
    brand = Brand.objects(name__icontains=brand_name).first()
    return brand.id if brand else None


def _serialize_product(product):
    return {
        "product_id": str(product.id),
        "name": product.name,
        "price": str(product.price),
        "stock": product.stock,
        "category": product.category.name if product.category else None,
        "brand": product.brand.name if product.brand else None,
    }


def get_cheapest_products(limit=5, category_name=None):
    qs = Product.objects(is_active=True)

    if category_name:
        category_id = _resolve_category_id(category_name)
        if not category_id:
            return []
        qs = qs.filter(category=category_id)

    qs = qs.order_by("price")[:limit]
    return [_serialize_product(p) for p in qs]


def search_products(query=None, category_name=None, brand_name=None, limit=10):
    qs = Product.objects(is_active=True)

    if category_name:
        category_id = _resolve_category_id(category_name)
        if not category_id:
            return []
        qs = qs.filter(category=category_id)

    if brand_name:
        brand_id = _resolve_brand_id(brand_name)
        if not brand_id:
            return []
        qs = qs.filter(brand=brand_id)

    if query:
        qs = qs.filter(name__icontains=query)

    return [_serialize_product(p) for p in qs[:limit]]
