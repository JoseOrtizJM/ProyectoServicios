from bson import ObjectId
from rest_framework.exceptions import NotFound

DEFAULT_PAGE_SIZE = 12
MAX_PAGE_SIZE = 50


def valid_object_id(value):
    return bool(value) and ObjectId.is_valid(value)


def get_object_or_404(document_class, object_id, **extra_filters):
    """Equivalente a Django's get_object_or_404 pero para Document de
    MongoEngine (que no lanzan Http404, sino DoesNotExist/ValidationError)."""
    if not valid_object_id(object_id):
        raise NotFound(f"{document_class.__name__} no encontrado.")

    obj = document_class.objects(id=object_id, **extra_filters).first()
    if obj is None:
        raise NotFound(f"{document_class.__name__} no encontrado.")
    return obj


def paginate_queryset(queryset, request):
    """Pagina a mano (skip/limit) un QuerySet de MongoEngine y arma el
    payload con metadatos. Se usa en vez de la paginación de DRF porque
    esta última está pensada para QuerySets del ORM de Django."""
    try:
        page = max(int(request.query_params.get("page", 1)), 1)
    except (TypeError, ValueError):
        page = 1

    try:
        page_size = int(request.query_params.get("page_size", DEFAULT_PAGE_SIZE))
    except (TypeError, ValueError):
        page_size = DEFAULT_PAGE_SIZE
    page_size = max(1, min(page_size, MAX_PAGE_SIZE))

    total = queryset.count()
    start = (page - 1) * page_size
    items = list(queryset[start : start + page_size])
    total_pages = (total + page_size - 1) // page_size if total else 0

    return {
        "count": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "results": items,
    }
