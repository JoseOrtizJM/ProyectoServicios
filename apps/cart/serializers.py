from rest_framework import serializers

from apps.catalog.documents import Product
from apps.common.utils import valid_object_id


class CartItemSerializer(serializers.Serializer):
    """Representa un CartItem embebido, con precio y subtotal calculados
    al momento (siempre reflejan el precio actual del producto, no uno
    congelado — eso se "congela" recién en el pedido, Sprint 5)."""

    product = serializers.SerializerMethodField()
    quantity = serializers.IntegerField()
    unit_price = serializers.SerializerMethodField()
    subtotal = serializers.SerializerMethodField()

    def get_product(self, obj):
        return {
            "id": str(obj.product.id),
            "name": obj.product.name,
            "image_url": obj.product.image_url,
            "stock": obj.product.stock,
            "is_active": obj.product.is_active,
        }

    def get_unit_price(self, obj):
        return str(obj.product.price)

    def get_subtotal(self, obj):
        return str(obj.product.price * obj.quantity)


class CartSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.SerializerMethodField()
    total = serializers.SerializerMethodField()
    updated_at = serializers.DateTimeField(read_only=True)

    def get_total_items(self, obj):
        return sum(item.quantity for item in obj.items)

    def get_total(self, obj):
        return str(sum(item.product.price * item.quantity for item in obj.items))


class AddCartItemSerializer(serializers.Serializer):
    product_id = serializers.CharField()
    quantity = serializers.IntegerField(min_value=1, default=1)

    def validate_product_id(self, value):
        if not valid_object_id(value):
            raise serializers.ValidationError("ID de producto inválido.")
        product = Product.objects(id=value, is_active=True).first()
        if not product:
            raise serializers.ValidationError("El producto no existe o ya no está disponible.")
        return product  # queda resuelto: en validated_data ya es el objeto


class UpdateCartItemSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=1)
