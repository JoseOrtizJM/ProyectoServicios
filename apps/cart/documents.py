import datetime

import mongoengine as me

from apps.catalog.documents import Product
from apps.users.documents import User


class CartItem(me.EmbeddedDocument):
    product = me.ReferenceField(Product, required=True)
    quantity = me.IntField(required=True, min_value=1)
    added_at = me.DateTimeField(default=datetime.datetime.utcnow)


class Cart(me.Document):
    """Un carrito por usuario. Los items van embebidos: en Mongo tiene más
    sentido que el carrito sea un solo documento (se lee/escribe entero de
    una vez) en vez de una colección aparte referenciando al usuario."""

    user = me.ReferenceField(User, required=True, unique=True, reverse_delete_rule=me.CASCADE)
    items = me.EmbeddedDocumentListField(CartItem)
    updated_at = me.DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        "collection": "carts",
        "indexes": ["user"],
    }

    def save(self, *args, **kwargs):
        self.updated_at = datetime.datetime.utcnow()
        return super().save(*args, **kwargs)


def get_or_create_cart(user):
    cart = Cart.objects(user=user).first()
    if cart is None:
        cart = Cart(user=user, items=[])
        cart.save()
    return cart
