from rest_framework import serializers

from apps.common.utils import valid_object_id

from .documents import PAYMENT_CARD, PAYMENT_METHOD_CHOICES, SavedCard


def detect_card_brand(card_number):
    if card_number.startswith("4"):
        return "Visa"
    if card_number.startswith("5"):
        return "Mastercard"
    if card_number.startswith(("34", "37")):
        return "American Express"
    return "Otra"


# --- Tarjetas guardadas ---


class SavedCardSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    brand = serializers.CharField(read_only=True)
    last4 = serializers.CharField(read_only=True)
    exp_month = serializers.IntegerField(read_only=True)
    exp_year = serializers.IntegerField(read_only=True)
    alias = serializers.CharField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)


class AddCardSerializer(serializers.Serializer):
    """Simulado: card_number y cvv se validan por formato pero JAMÁS se
    persisten — solo se guardan marca + últimos 4 dígitos."""

    card_number = serializers.CharField(write_only=True)
    cvv = serializers.CharField(write_only=True, required=False, allow_blank=True)
    exp_month = serializers.IntegerField(min_value=1, max_value=12)
    exp_year = serializers.IntegerField(min_value=2000)
    alias = serializers.CharField(max_length=50, required=False, allow_blank=True, default="")

    def validate_card_number(self, value):
        digits = value.replace(" ", "")
        if not digits.isdigit() or not (13 <= len(digits) <= 19):
            raise serializers.ValidationError("Número de tarjeta inválido.")
        return digits

    def validate_cvv(self, value):
        if value and (not value.isdigit() or not (3 <= len(value) <= 4)):
            raise serializers.ValidationError("CVV inválido.")
        return value

    def create(self, validated_data):
        card_number = validated_data.pop("card_number")
        validated_data.pop("cvv", None)  # nunca se persiste, ni siquiera temporalmente
        card = SavedCard(
            user=self.context["request"].user,
            brand=detect_card_brand(card_number),
            last4=card_number[-4:],
            **validated_data,
        )
        card.save()
        return card


# --- Checkout ---


class CheckoutSerializer(serializers.Serializer):
    payment_method = serializers.ChoiceField(choices=PAYMENT_METHOD_CHOICES)

    # Pago con tarjeta guardada:
    card_id = serializers.CharField(required=False, allow_blank=True)

    # Pago con tarjeta nueva (simulada — nunca se persiste el número/cvv):
    card_number = serializers.CharField(required=False, allow_blank=True, write_only=True)
    cvv = serializers.CharField(required=False, allow_blank=True, write_only=True)
    exp_month = serializers.IntegerField(required=False, min_value=1, max_value=12)
    exp_year = serializers.IntegerField(required=False, min_value=2000)
    save_card = serializers.BooleanField(required=False, default=False)
    card_alias = serializers.CharField(max_length=50, required=False, allow_blank=True, default="")

    def validate(self, attrs):
        if attrs["payment_method"] != PAYMENT_CARD:
            return attrs

        card_id = attrs.get("card_id")
        card_number = attrs.get("card_number")

        if not card_id and not card_number:
            raise serializers.ValidationError(
                "Para pagar con tarjeta indica 'card_id' (una tarjeta guardada) "
                "o los datos de una tarjeta nueva (card_number, exp_month, exp_year)."
            )

        if card_id:
            if not valid_object_id(card_id):
                raise serializers.ValidationError({"card_id": "ID de tarjeta inválido."})
            card = SavedCard.objects(id=card_id, user=self.context["request"].user).first()
            if not card:
                raise serializers.ValidationError({"card_id": "Esa tarjeta no existe o no te pertenece."})
            attrs["resolved_card"] = card
        else:
            digits = card_number.replace(" ", "")
            if not digits.isdigit() or not (13 <= len(digits) <= 19):
                raise serializers.ValidationError({"card_number": "Número de tarjeta inválido."})
            if not attrs.get("exp_month") or not attrs.get("exp_year"):
                raise serializers.ValidationError("Faltan exp_month/exp_year de la tarjeta nueva.")
            cvv = attrs.get("cvv")
            if cvv and (not cvv.isdigit() or not (3 <= len(cvv) <= 4)):
                raise serializers.ValidationError({"cvv": "CVV inválido."})
            attrs["card_number"] = digits
            attrs.pop("cvv", None)  # nunca se persiste

        return attrs


# --- Pedidos (salida / historial) ---


class OrderItemSerializer(serializers.Serializer):
    product_id = serializers.SerializerMethodField()
    product_name = serializers.CharField()
    unit_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    quantity = serializers.IntegerField()
    subtotal = serializers.SerializerMethodField()

    def get_product_id(self, obj):
        return str(obj.product.id) if obj.product else None

    def get_subtotal(self, obj):
        return str(obj.unit_price * obj.quantity)


class OrderSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)
    total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    payment_method = serializers.CharField(read_only=True)
    card = serializers.SerializerMethodField(read_only=True)
    status = serializers.CharField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    def get_card(self, obj):
        if obj.card_snapshot:
            return {"brand": obj.card_snapshot.brand, "last4": obj.card_snapshot.last4}
        return None
