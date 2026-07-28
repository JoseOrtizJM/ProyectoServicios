from decimal import Decimal, InvalidOperation

from mongoengine.errors import OperationError
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from apps.common.permissions import IsAdminOrReadOnly
from apps.common.utils import get_object_or_404, paginate_queryset, valid_object_id

from .documents import Brand, Category, Product
from .serializers import BrandSerializer, CategorySerializer, ProductSerializer

# --- Categorías ---


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
