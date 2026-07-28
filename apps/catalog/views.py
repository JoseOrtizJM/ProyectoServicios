from decimal import Decimal, InvalidOperation

from drf_spectacular.utils import OpenApiParameter, extend_schema
from mongoengine.errors import OperationError
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from apps.common.permissions import IsAdminOrReadOnly
from apps.common.schema import PAGINATION_PARAMETERS, DetailSerializer, paginated_response
from apps.common.utils import get_object_or_404, paginate_queryset, valid_object_id

from .documents import Brand, Category, Product
from .serializers import BrandSerializer, CategorySerializer, ProductSerializer

# --- Categorías ---


@extend_schema(
    tags=["Catálogo — Categorías"],
    summary="Listar categorías (público)",
    parameters=PAGINATION_PARAMETERS,
    responses={200: paginated_response(CategorySerializer, "PaginatedCategoryList")},
    methods=["GET"],
    auth=[{}],
)
@extend_schema(
    tags=["Catálogo — Categorías"],
    summary="Crear categoría (admin)",
    request=CategorySerializer,
    responses={201: CategorySerializer},
    methods=["POST"],
)
@api_view(["GET", "POST"])
@permission_classes([IsAdminOrReadOnly])
def category_list(request):
    if request.method == "GET":
        paginated = paginate_queryset(Category.objects.order_by("name"), request)
        paginated["results"] = CategorySerializer(paginated["results"], many=True).data
        return Response(paginated)

    serializer = CategorySerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    category = serializer.save()
    return Response(CategorySerializer(category).data, status=status.HTTP_201_CREATED)


@extend_schema(
    tags=["Catálogo — Categorías"],
    summary="Ver categoría (público)",
    responses={200: CategorySerializer},
    methods=["GET"],
    auth=[{}],
)
@extend_schema(
    tags=["Catálogo — Categorías"],
    summary="Editar categoría (admin)",
    request=CategorySerializer,
    responses={200: CategorySerializer},
    methods=["PUT", "PATCH"],
)
@extend_schema(
    tags=["Catálogo — Categorías"],
    summary="Eliminar categoría (admin)",
    description="Falla con 409 si hay productos asociados a la categoría.",
    responses={204: None, 409: DetailSerializer},
    methods=["DELETE"],
)
@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([IsAdminOrReadOnly])
def category_detail(request, category_id):
    category = get_object_or_404(Category, category_id)

    if request.method == "GET":
        return Response(CategorySerializer(category).data)

    if request.method == "DELETE":
        if Product.objects(category=category).first():
            return Response(
                {"detail": "No se puede eliminar: hay productos asociados a esta categoría."},
                status=status.HTTP_409_CONFLICT,
            )
        try:
            category.delete()
        except OperationError:
            return Response(
                {"detail": "No se puede eliminar: hay productos asociados a esta categoría."},
                status=status.HTTP_409_CONFLICT,
            )
        return Response(status=status.HTTP_204_NO_CONTENT)

    partial = request.method == "PATCH"
    serializer = CategorySerializer(category, data=request.data, partial=partial)
    serializer.is_valid(raise_exception=True)
    category = serializer.save()
    return Response(CategorySerializer(category).data)


# --- Marcas ---


@extend_schema(
    tags=["Catálogo — Marcas"],
    summary="Listar marcas (público)",
    parameters=PAGINATION_PARAMETERS,
    responses={200: paginated_response(BrandSerializer, "PaginatedBrandList")},
    methods=["GET"],
    auth=[{}],
)
@extend_schema(
    tags=["Catálogo — Marcas"],
    summary="Crear marca (admin)",
    request=BrandSerializer,
    responses={201: BrandSerializer},
    methods=["POST"],
)
@api_view(["GET", "POST"])
@permission_classes([IsAdminOrReadOnly])
def brand_list(request):
    if request.method == "GET":
        paginated = paginate_queryset(Brand.objects.order_by("name"), request)
        paginated["results"] = BrandSerializer(paginated["results"], many=True).data
        return Response(paginated)

    serializer = BrandSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    brand = serializer.save()
    return Response(BrandSerializer(brand).data, status=status.HTTP_201_CREATED)


@extend_schema(
    tags=["Catálogo — Marcas"],
    summary="Ver marca (público)",
    responses={200: BrandSerializer},
    methods=["GET"],
    auth=[{}],
)
@extend_schema(
    tags=["Catálogo — Marcas"],
    summary="Editar marca (admin)",
    request=BrandSerializer,
    responses={200: BrandSerializer},
    methods=["PUT", "PATCH"],
)
@extend_schema(
    tags=["Catálogo — Marcas"],
    summary="Eliminar marca (admin)",
    description="Falla con 409 si hay productos asociados a la marca.",
    responses={204: None, 409: DetailSerializer},
    methods=["DELETE"],
)
@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([IsAdminOrReadOnly])
def brand_detail(request, brand_id):
    brand = get_object_or_404(Brand, brand_id)

    if request.method == "GET":
        return Response(BrandSerializer(brand).data)

    if request.method == "DELETE":
        if Product.objects(brand=brand).first():
            return Response(
                {"detail": "No se puede eliminar: hay productos asociados a esta marca."},
                status=status.HTTP_409_CONFLICT,
            )
        try:
            brand.delete()
        except OperationError:
            return Response(
                {"detail": "No se puede eliminar: hay productos asociados a esta marca."},
                status=status.HTTP_409_CONFLICT,
            )
        return Response(status=status.HTTP_204_NO_CONTENT)

    partial = request.method == "PATCH"
    serializer = BrandSerializer(brand, data=request.data, partial=partial)
    serializer.is_valid(raise_exception=True)
    brand = serializer.save()
    return Response(BrandSerializer(brand).data)


# --- Productos ---


@extend_schema(
    tags=["Catálogo — Productos"],
    summary="Listar productos (público)",
    description="Solo devuelve productos activos. Admite filtros y paginación.",
    parameters=[
        OpenApiParameter("category", str, description="ID de categoría para filtrar."),
        OpenApiParameter("brand", str, description="ID de marca para filtrar."),
        OpenApiParameter("search", str, description="Búsqueda parcial por nombre."),
        OpenApiParameter("min_price", str, description="Precio mínimo (MXN)."),
        OpenApiParameter("max_price", str, description="Precio máximo (MXN)."),
        *PAGINATION_PARAMETERS,
    ],
    responses={200: paginated_response(ProductSerializer, "PaginatedProductList")},
    methods=["GET"],
    auth=[{}],
)
@extend_schema(
    tags=["Catálogo — Productos"],
    summary="Crear producto (admin)",
    request=ProductSerializer,
    responses={201: ProductSerializer},
    methods=["POST"],
)
@api_view(["GET", "POST"])
@permission_classes([IsAdminOrReadOnly])
def product_list(request):
    if request.method == "GET":
        params = request.query_params
        qs = Product.objects(is_active=True)

        category_id = params.get("category")
        if category_id:
            if not valid_object_id(category_id):
                return Response({"category": ["ID de categoría inválido."]}, status=status.HTTP_400_BAD_REQUEST)
            qs = qs.filter(category=category_id)

        brand_id = params.get("brand")
        if brand_id:
            if not valid_object_id(brand_id):
                return Response({"brand": ["ID de marca inválido."]}, status=status.HTTP_400_BAD_REQUEST)
            qs = qs.filter(brand=brand_id)

        search = params.get("search")
        if search:
            qs = qs.filter(name__icontains=search.strip())

        min_price = params.get("min_price")
        if min_price:
            try:
                qs = qs.filter(price__gte=Decimal(min_price))
            except InvalidOperation:
                return Response({"min_price": ["Debe ser un número."]}, status=status.HTTP_400_BAD_REQUEST)

        max_price = params.get("max_price")
        if max_price:
            try:
                qs = qs.filter(price__lte=Decimal(max_price))
            except InvalidOperation:
                return Response({"max_price": ["Debe ser un número."]}, status=status.HTTP_400_BAD_REQUEST)

        qs = qs.order_by("-created_at")

        paginated = paginate_queryset(qs, request)
        paginated["results"] = ProductSerializer(paginated["results"], many=True).data
        return Response(paginated)

    serializer = ProductSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    product = serializer.save()
    return Response(ProductSerializer(product).data, status=status.HTTP_201_CREATED)


@extend_schema(
    tags=["Catálogo — Productos"],
    summary="Ver producto (público)",
    description="Productos desactivados devuelven 404 salvo que quien pregunta sea admin.",
    responses={200: ProductSerializer, 404: DetailSerializer},
    methods=["GET"],
    auth=[{}],
)
@extend_schema(
    tags=["Catálogo — Productos"],
    summary="Editar producto (admin)",
    request=ProductSerializer,
    responses={200: ProductSerializer},
    methods=["PUT", "PATCH"],
)
@extend_schema(
    tags=["Catálogo — Productos"],
    summary="Desactivar producto (admin)",
    description="Soft delete: pone is_active=False. No se borra de verdad, para no romper "
    "reseñas/pedidos que ya lo referencian.",
    responses={204: None},
    methods=["DELETE"],
)
@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([IsAdminOrReadOnly])
def product_detail(request, product_id):
    product = get_object_or_404(Product, product_id)
    is_admin = bool(request.user and getattr(request.user, "is_admin", False))

    if request.method == "GET":
        if not product.is_active and not is_admin:
            # Invitados/usuarios no ven productos desactivados; para ellos
            # es como si no existieran.
            return Response({"detail": "Producto no encontrado."}, status=status.HTTP_404_NOT_FOUND)
        return Response(ProductSerializer(product).data)

    if request.method == "DELETE":
        product.is_active = False
        product.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

    partial = request.method == "PATCH"
    serializer = ProductSerializer(product, data=request.data, partial=partial)
    serializer.is_valid(raise_exception=True)
    product = serializer.save()
    return Response(ProductSerializer(product).data)
