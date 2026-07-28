from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import NotFound
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.common.schema import DetailSerializer
from apps.common.utils import valid_object_id

from .documents import CartItem, get_or_create_cart
from .serializers import AddCartItemSerializer, CartSerializer, UpdateCartItemSerializer


@extend_schema(
    tags=["Carrito"],
    summary="Ver mi carrito",
    description="Se crea automáticamente (vacío) si el usuario todavía no tiene uno.",
    responses={200: CartSerializer},
    methods=["GET"],
)
@extend_schema(
    tags=["Carrito"],
    summary="Vaciar mi carrito",
    responses={204: None},
    methods=["DELETE"],
)
@api_view(["GET", "DELETE"])
@permission_classes([IsAuthenticated])
def cart_detail(request):
    cart = get_or_create_cart(request.user)

    if request.method == "DELETE":
        cart.items = []
        cart.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

    return Response(CartSerializer(cart).data)


@extend_schema(
    tags=["Carrito"],
    summary="Agregar producto al carrito",
    description="Si el producto ya está en el carrito, suma la cantidad a la existente. "
    "Valida que no se exceda el stock disponible.",
    request=AddCartItemSerializer,
    responses={201: CartSerializer, 400: DetailSerializer},
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def cart_item_add(request):
    serializer = AddCartItemSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    product = serializer.validated_data["product_id"]
    quantity = serializer.validated_data["quantity"]

    cart = get_or_create_cart(request.user)
    existing = next((item for item in cart.items if str(item.product.id) == str(product.id)), None)
    new_quantity = (existing.quantity if existing else 0) + quantity

    if new_quantity > product.stock:
        return Response(
            {"quantity": [f"Solo hay {product.stock} unidades disponibles de este producto."]},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if existing:
        existing.quantity = new_quantity
    else:
        cart.items.append(CartItem(product=product, quantity=quantity))

    cart.save()
    return Response(CartSerializer(cart).data, status=status.HTTP_201_CREATED)


@extend_schema(
    tags=["Carrito"],
    summary="Fijar cantidad de un producto en el carrito",
    request=UpdateCartItemSerializer,
    responses={200: CartSerializer, 400: DetailSerializer},
    methods=["PATCH"],
)
@extend_schema(
    tags=["Carrito"],
    summary="Quitar un producto del carrito",
    responses={204: None},
    methods=["DELETE"],
)
@api_view(["PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def cart_item_detail(request, product_id):
    if not valid_object_id(product_id):
        raise NotFound("Este producto no está en tu carrito.")

    cart = get_or_create_cart(request.user)
    item = next((i for i in cart.items if str(i.product.id) == product_id), None)
    if item is None:
        raise NotFound("Este producto no está en tu carrito.")

    if request.method == "DELETE":
        cart.items = [i for i in cart.items if str(i.product.id) != product_id]
        cart.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

    serializer = UpdateCartItemSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    quantity = serializer.validated_data["quantity"]

    if quantity > item.product.stock:
        return Response(
            {"quantity": [f"Solo hay {item.product.stock} unidades disponibles de este producto."]},
            status=status.HTTP_400_BAD_REQUEST,
        )

    item.quantity = quantity
    cart.save()
    return Response(CartSerializer(cart).data)
