"""Herramientas que Claude puede invocar durante el chat. Cada una envuelve
una función de analítica ya existente (Sprints 6-7) y devuelve JSON en texto
— así el chatbot responde con datos reales de Mongo, nunca inventados."""

import json

from anthropic import beta_tool

from apps.catalog.analytics import get_cheapest_products, search_products
from apps.orders.analytics import get_top_selling_products
from apps.reviews.analytics import get_top_rated_products


@beta_tool
def producto_mas_vendido(cantidad: int = 5) -> str:
    """Devuelve los productos más vendidos de la tienda, del que más
    unidades vendió al que menos, contando solo pedidos ya pagados.

    Args:
        cantidad: Cuántos productos devolver como máximo (por defecto 5).
    """
    results = get_top_selling_products(limit=cantidad)
    if not results:
        return "Todavía no hay ventas registradas en la tienda."
    return json.dumps(results, ensure_ascii=False)


@beta_tool
def productos_mejor_valorados(cantidad: int = 5) -> str:
    """Devuelve los productos con mejor calificación promedio en reseñas
    de clientes, de la más alta a la más baja.

    Args:
        cantidad: Cuántos productos devolver como máximo (por defecto 5).
    """
    results = get_top_rated_products(limit=cantidad)
    if not results:
        return "Todavía no hay productos con reseñas."
    return json.dumps(results, ensure_ascii=False)


@beta_tool
def producto_mas_barato(cantidad: int = 5, categoria: str = "") -> str:
    """Devuelve los productos más baratos disponibles en la tienda, del
    precio más bajo al más alto. Se puede limitar a una categoría.

    Args:
        cantidad: Cuántos productos devolver como máximo (por defecto 5).
        categoria: Nombre de categoría para filtrar, ej. "Mouses" (opcional).
    """
    results = get_cheapest_products(limit=cantidad, category_name=categoria or None)
    if not results:
        return "No se encontraron productos disponibles con esos filtros."
    return json.dumps(results, ensure_ascii=False)


@beta_tool
def buscar_productos(consulta: str = "", categoria: str = "", marca: str = "") -> str:
    """Busca productos en el catálogo por texto en el nombre, categoría
    y/o marca. Usa esto para preguntas generales sobre qué productos hay
    disponibles (ej. "¿tienen teclados Logitech?").

    Args:
        consulta: Texto a buscar en el nombre del producto (opcional).
        categoria: Nombre de categoría para filtrar (opcional).
        marca: Nombre de marca para filtrar (opcional).
    """
    results = search_products(
        query=consulta or None,
        category_name=categoria or None,
        brand_name=marca or None,
    )
    if not results:
        return "No se encontraron productos con esos criterios."
    return json.dumps(results, ensure_ascii=False)


CHATBOT_TOOLS = [
    producto_mas_vendido,
    productos_mejor_valorados,
    producto_mas_barato,
    buscar_productos,
]
