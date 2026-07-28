import datetime

import mongoengine as me

from apps.catalog.documents import Product
from apps.users.documents import User

PAYMENT_CASH = "cash"
PAYMENT_CARD = "card"
PAYMENT_METHOD_CHOICES = (PAYMENT_CASH, PAYMENT_CARD)

STATUS_PENDING_PAYMENT = "pending_payment"
STATUS_PAID = "paid"
STATUS_SHIPPED = "shipped"
STATUS_DELIVERED = "delivered"
STATUS_CANCELLED = "cancelled"
STATUS_CHOICES = (
    STATUS_PENDING_PAYMENT,
    STATUS_PAID,
    STATUS_SHIPPED,
    STATUS_DELIVERED,
    STATUS_CANCELLED,
)

# Flujo del pedido: pendiente_pago -> pagado -> enviado -> recibido.
# Cancelar solo tiene sentido antes de que salga enviado (una vez enviado/
# recibido, es una devolución, no una cancelación). delivered/cancelled
# son estados terminales — de ahí no se puede pasar a ningún otro.
ALLOWED_STATUS_TRANSITIONS = {
    STATUS_PENDING_PAYMENT: {STATUS_PAID, STATUS_CANCELLED},
    STATUS_PAID: {STATUS_SHIPPED, STATUS_CANCELLED},
    STATUS_SHIPPED: {STATUS_DELIVERED},
    STATUS_DELIVERED: set(),
    STATUS_CANCELLED: set(),
}


class SavedCard(me.Document):
    """Tarjeta simulada. NUNCA se guarda el número completo ni el CVV —
    solo lo necesario para mostrarla en la UI (marca + últimos 4 dígitos)."""

    user = me.ReferenceField(User, required=True, reverse_delete_rule=me.CASCADE)
    brand = me.StringField(max_length=20, required=True)
    last4 = me.StringField(max_length=4, required=True)
    exp_month = me.IntField(min_value=1, max_value=12, required=True)
    exp_year = me.IntField(min_value=2000, required=True)
    alias = me.StringField(max_length=50, default="")
    created_at = me.DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        "collection": "saved_cards",
        "indexes": ["user"],
        "ordering": ["-created_at"],
    }


class CardSnapshot(me.EmbeddedDocument):
    """Copia de qué tarjeta se usó en un pedido, congelada en el tiempo:
    si el usuario borra la tarjeta guardada después, el historial de
    pedidos sigue mostrando con qué se pagó."""

    brand = me.StringField(max_length=20)
    last4 = me.StringField(max_length=4)


class OrderItem(me.EmbeddedDocument):
    """Copia de producto/precio al momento de la compra: si el producto
    cambia de precio o nombre después, el pedido ya hecho no debe cambiar."""

    product = me.ReferenceField(Product, required=True)
    product_name = me.StringField(required=True)
    unit_price = me.DecimalField(required=True, min_value=0, precision=2)
    quantity = me.IntField(required=True, min_value=1)


class Order(me.Document):
    user = me.ReferenceField(User, required=True, reverse_delete_rule=me.DENY)
    items = me.EmbeddedDocumentListField(OrderItem, required=True)
    total = me.DecimalField(required=True, min_value=0, precision=2)  # MXN

    payment_method = me.StringField(choices=PAYMENT_METHOD_CHOICES, required=True)
    card_snapshot = me.EmbeddedDocumentField(CardSnapshot, required=False)

    status = me.StringField(choices=STATUS_CHOICES, default=STATUS_PENDING_PAYMENT)

    created_at = me.DateTimeField(default=datetime.datetime.utcnow)
    updated_at = me.DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        "collection": "orders",
        "indexes": ["user", "status", "-created_at"],
        "ordering": ["-created_at"],
    }

    def save(self, *args, **kwargs):
        self.updated_at = datetime.datetime.utcnow()
        return super().save(*args, **kwargs)
