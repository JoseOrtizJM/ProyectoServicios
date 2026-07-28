from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.cart.documents import get_or_create_cart
from apps.common.utils import get_object_or_404, paginate_queryset

from .documents import (
    PAYMENT_CARD,
    STATUS_PAID,
    STATUS_PENDING_PAYMENT,
    CardSnapshot,
    Order,
    OrderItem,
    SavedCard,
)
from .serializers import (
    AddCardSerializer,
    CheckoutSerializer,
    OrderSerializer,
    SavedCardSerializer,
    detect_card_brand,
)

# --- Tarjetas guardadas ---


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def card_list(request):
    if request.method == "GET":
        qs = SavedCard.objects(user=request.user).order_by("-created_at")
        return Response(SavedCardSerializer(qs, many=True).data)

    serializer = AddCardSerializer(data=request.data, context={"request": request})
    serializer.is_valid(raise_exception=True)
    card = serializer.save()
    return Response(SavedCardSerializer(card).data, status=status.HTTP_201_CREATED)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def card_detail(request, card_id):
    card = get_object_or_404(SavedCard, card_id, user=request.user)
    card.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# --- Checkout ---


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def checkout(request):
    serializer = CheckoutSerializer(data=request.data, context={"request": request})
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    cart = get_or_create_cart(request.user)
    if not cart.items:
        return Response({"detail": "Tu carrito está vacío."}, status=status.HTTP_400_BAD_REQUEST)

    # Revalidar stock al momento del checkout: pudo cambiar desde que se
    # agregó al carrito (otro usuario compró, admin lo desactivó, etc.).
    stock_errors = {}
    for item in cart.items:
        product = item.product
        if not product.is_active:
            stock_errors[str(product.id)] = f"'{product.name}' ya no está disponible."
        elif item.quantity > product.stock:
            stock_errors[str(product.id)] = f"Solo hay {product.stock} unidades disponibles de '{product.name}'."
    if stock_errors:
        return Response({"stock": stock_errors}, status=status.HTTP_400_BAD_REQUEST)

    order_items = [
        OrderItem(
            product=item.product,
            product_name=item.product.name,
            unit_price=item.product.price,
            quantity=item.quantity,
        )
        for item in cart.items
    ]
    total = sum(oi.unit_price * oi.quantity for oi in order_items)

    card_snapshot = None
    if data["payment_method"] == PAYMENT_CARD:
        resolved_card = data.get("resolved_card")
        if resolved_card:
            card_snapshot = CardSnapshot(brand=resolved_card.brand, last4=resolved_card.last4)
        else:
            brand = detect_card_brand(data["card_number"])
            last4 = data["card_number"][-4:]
            card_snapshot = CardSnapshot(brand=brand, last4=last4)
            if data.get("save_card"):
                SavedCard(
                    user=request.user,
                    brand=brand,
                    last4=last4,
                    exp_month=data["exp_month"],
                    exp_year=data["exp_year"],
                    alias=data.get("card_alias", ""),
                ).save()

    # Pago simulado: con tarjeta "autoriza" al instante (queda pagado);
    # en efectivo queda pendiente hasta que se confirme en tienda.
    order_status = STATUS_PAID if data["payment_method"] == PAYMENT_CARD else STATUS_PENDING_PAYMENT

    order = Order(
        user=request.user,
        items=order_items,
        total=total,
        payment_method=data["payment_method"],
        card_snapshot=card_snapshot,
        status=order_status,
    )
    order.save()

    for item in cart.items:
        product = item.product
        product.stock = max(product.stock - item.quantity, 0)
        product.save()

    cart.items = []
    cart.save()

    return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


# --- Historial de compras ---


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def order_list(request):
    qs = Order.objects(user=request.user).order_by("-created_at")
    paginated = paginate_queryset(qs, request)
    paginated["results"] = OrderSerializer(paginated["results"], many=True).data
    return Response(paginated)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def order_detail(request, order_id):
    order = get_object_or_404(Order, order_id)
    is_owner = str(order.user.id) == str(request.user.id)
    is_admin = bool(getattr(request.user, "is_admin", False))
    if not (is_owner or is_admin):
        raise PermissionDenied("No puedes ver pedidos de otro usuario.")
    return Response(OrderSerializer(order).data)
