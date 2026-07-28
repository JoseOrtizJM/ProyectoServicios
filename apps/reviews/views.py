from mongoengine.errors import NotUniqueError
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response

from apps.catalog.documents import Product
from apps.common.permissions import IsAdmin
from apps.common.utils import get_object_or_404, paginate_queryset, valid_object_id

from .documents import Review
from .serializers import ReviewCreateSerializer, ReviewSerializer


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticatedOrReadOnly])
def product_review_list(request, product_id):
    product = get_object_or_404(Product, product_id)

    if request.method == "GET":
        qs = Review.objects(product=product)
        total = qs.count()
        paginated = paginate_queryset(qs, request)
        paginated["results"] = ReviewSerializer(paginated["results"], many=True).data
        paginated["summary"] = {
            "average_rating": round(qs.average("rating"), 2) if total else None,
            "total_reviews": total,
        }
        return Response(paginated)

    if not product.is_active:
        return Response(
            {"detail": "No se puede reseñar un producto que ya no está disponible."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    serializer = ReviewCreateSerializer(data=request.data, context={"request": request, "product": product})
    serializer.is_valid(raise_exception=True)

    try:
        review = serializer.save()
    except NotUniqueError:
        # Cubre la carrera entre el chequeo en validate() y el save().
        return Response(
            {"detail": "Ya escribiste una reseña para este producto."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response(ReviewSerializer(review).data, status=status.HTTP_201_CREATED)


@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticatedOrReadOnly])
def review_detail(request, review_id):
    review = get_object_or_404(Review, review_id)

    if request.method == "GET":
        return Response(ReviewSerializer(review).data)

    is_owner = bool(request.user and str(review.user.id) == str(request.user.id))
    is_admin = bool(request.user and getattr(request.user, "is_admin", False))

    if request.method == "DELETE":
        # Moderación: el admin puede borrar cualquier reseña; el dueño borra
        # la suya. Se elimina de verdad, no se "desactiva".
        if not (is_owner or is_admin):
            raise PermissionDenied("No puedes eliminar la reseña de otro usuario.")
        review.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    # PATCH: el admin NO puede reescribir el contenido de otra persona —
    # moderar es borrar, no editar palabras que no son suyas. Solo el
    # dueño puede cambiar su propio rating/comentario.
    if not is_owner:
        raise PermissionDenied("Solo el autor puede editar el contenido de su reseña.")

    serializer = ReviewSerializer(review, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    review = serializer.save()
    return Response(ReviewSerializer(review).data)


@api_view(["GET"])
@permission_classes([IsAdmin])
def admin_review_list(request):
    """Panel admin: todas las reseñas, filtrables por producto y/o calificación."""
    qs = Review.objects.all()

    product_id = request.query_params.get("product")
    if product_id:
        if not valid_object_id(product_id):
            return Response({"product": ["ID de producto inválido."]}, status=status.HTTP_400_BAD_REQUEST)
        qs = qs.filter(product=product_id)

    rating = request.query_params.get("rating")
    if rating:
        try:
            qs = qs.filter(rating=int(rating))
        except ValueError:
            return Response({"rating": ["Debe ser un número entero (1-5)."]}, status=status.HTTP_400_BAD_REQUEST)

    paginated = paginate_queryset(qs.order_by("-created_at"), request)
    paginated["results"] = ReviewSerializer(paginated["results"], many=True).data
    return Response(paginated)
