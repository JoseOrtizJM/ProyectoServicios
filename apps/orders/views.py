from drf_spectacular.utils import OpenApiParameter, extend_schema, inline_serializer
from rest_framework import serializers, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.cart.documents import get_or_create_cart
from apps.common.permissions import IsAdmin
from apps.common.schema import PAGINATION_PARAMETERS, DetailSerializer, paginated_response
from apps.common.utils import get_object_or_404, paginate_queryset, valid_object_id

from .documents import (
    ALLOWED_STATUS_TRANSITIONS,
    PAYMENT_CARD,
    STATUS_CANCELLED,
    STATUS_CHOICES,
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

OrderStatusUpdateSerializer = inline_serializer(
    name="OrderStatusUpdate",
    fields={"status": serializers.ChoiceField(choices=STATUS_CHOICES)},
)

# --- Tarjetas guardadas ---


@extend_schema(
    tags=["Pedidos — Tarjetas"],
    summary="Listar mis tarjetas guardadas",
    responses={200: SavedCardSerializer(many=True)},
    methods=["GET"],
)
@extend_schema(
    tags=["Pedidos — Tarjetas"],
    summary="Guardar una tarjeta",
    description="Simulado: card_number/cvv se validan por formato pero JAMÁS se persisten "
    "— solo se guardan marca y últimos 4 dígitos.",
    request=AddCardSerializer,
    responses={201: SavedCardSerializer},
    methods=["POST"],
)
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


@extend_schema(
    tags=["Pedidos — Tarjetas"],
    summary="Eliminar una tarjeta guardada",
    responses={204: None},
)
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def card_detail(request, card_id):
    card = get_object_or_404(SavedCard, card_id, user=request.user)
    card.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# --- Checkout ---


@extend_schema(
    tags=["Pedidos"],
    summary="Pagar el carrito (checkout)",
    description="Cobra el carrito completo del usuario. Con tarjeta (simulada) el pedido "
    "queda 'paid' de inmediato; en efectivo queda 'pending_payment'. Descuenta stock y "
    "vacía el carrito al confirmar.",
    request=CheckoutSerializer,
    responses={201: OrderSerializer, 400: DetailSerializer},
)
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
            card_snapshot = CardSnapshot(
                brand=resolved_card.brand,
                last4=resolved_card.last4,
                cardholder_name=resolved_card.cardholder_name,
            )
        else:
            brand = detect_card_brand(data["card_number"])
            last4 = data["card_number"][-4:]
            card_snapshot = CardSnapshot(brand=brand, last4=last4, cardholder_name=data["cardholder_name"])
            if data.get("save_card"):
                SavedCard(
                    user=request.user,
                    cardholder_name=data["cardholder_name"],
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
        shipping_address=data["shipping_address"],
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


@extend_schema(
    tags=["Pedidos"],
    summary="Ver mi historial de compras",
    parameters=PAGINATION_PARAMETERS,
    responses={200: paginated_response(OrderSerializer, "PaginatedOrderList")},
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def order_list(request):
    qs = Order.objects(user=request.user).order_by("-created_at")
    paginated = paginate_queryset(qs, request)
    paginated["results"] = OrderSerializer(paginated["results"], many=True).data
    return Response(paginated)


@extend_schema(
    tags=["Pedidos"],
    summary="Ver un pedido",
    description="Solo el dueño del pedido o un admin pueden verlo.",
    responses={200: OrderSerializer},
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def order_detail(request, order_id):
    order = get_object_or_404(Order, order_id)
    is_owner = str(order.user.id) == str(request.user.id)
    is_admin = bool(getattr(request.user, "is_admin", False))
    if not (is_owner or is_admin):
        raise PermissionDenied("No puedes ver pedidos de otro usuario.")
    return Response(OrderSerializer(order).data)


# --- Panel admin de pedidos ---


@extend_schema(
    tags=["Admin — Pedidos"],
    summary="Listar todos los pedidos (admin)",
    parameters=[
        OpenApiParameter("status", str, description=f"Filtrar por estado: {', '.join(STATUS_CHOICES)}."),
        OpenApiParameter("user", str, description="ID de usuario comprador para filtrar."),
        *PAGINATION_PARAMETERS,
    ],
    responses={200: paginated_response(OrderSerializer, "PaginatedAdminOrderList")},
)
@api_view(["GET"])
@permission_classes([IsAdmin])
def admin_order_list(request):
    """Todos los pedidos de todos los usuarios, filtrables por estado y/o comprador."""
    qs = Order.objects.all()

    status_filter = request.query_params.get("status")
    if status_filter:
        if status_filter not in STATUS_CHOICES:
            return Response(
                {"status": [f"Estado inválido. Opciones: {', '.join(STATUS_CHOICES)}."]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        qs = qs.filter(status=status_filter)

    user_id = request.query_params.get("user")
    if user_id:
        if not valid_object_id(user_id):
            return Response({"user": ["ID de usuario inválido."]}, status=status.HTTP_400_BAD_REQUEST)
        qs = qs.filter(user=user_id)

    paginated = paginate_queryset(qs.order_by("-created_at"), request)
    paginated["results"] = OrderSerializer(paginated["results"], many=True).data
    return Response(paginated)


@extend_schema(
    tags=["Admin — Pedidos"],
    summary="Cambiar estado / cancelar pedido (admin)",
    description="Flujo: pending_payment → paid → shipped → delivered. Cancelar solo es "
    "posible antes de 'shipped'. Cancelar devuelve el stock reservado. Ver "
    "ALLOWED_STATUS_TRANSITIONS para la máquina de estados completa.",
    request=OrderStatusUpdateSerializer,
    responses={200: OrderSerializer, 400: DetailSerializer},
)
@api_view(["PATCH"])
@permission_classes([IsAdmin])
def admin_order_status_update(request, order_id):
    order = get_object_or_404(Order, order_id)
    new_status = request.data.get("status")

    if new_status not in STATUS_CHOICES:
        return Response(
            {"status": [f"Estado inválido. Opciones: {', '.join(STATUS_CHOICES)}."]},
            status=status.HTTP_400_BAD_REQUEST,
        )

    allowed = ALLOWED_STATUS_TRANSITIONS.get(order.status, set())
    if new_status not in allowed:
        return Response(
            {"status": [f"No se puede pasar de '{order.status}' a '{new_status}'."]},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if new_status == STATUS_CANCELLED:
        # El pedido no se va a completar: se devuelve el stock reservado.
        for item in order.items:
            product = item.product
            if product:
                product.stock += item.quantity
                product.save()

    order.status = new_status
    order.save()
    return Response(OrderSerializer(order).data)
