import datetime

import mongoengine as me

from apps.catalog.documents import Product
from apps.users.documents import User


class Review(me.Document):
    product = me.ReferenceField(Product, required=True, reverse_delete_rule=me.CASCADE)
    user = me.ReferenceField(User, required=True, reverse_delete_rule=me.CASCADE)
    rating = me.IntField(required=True, min_value=1, max_value=5)
    comment = me.StringField(max_length=1000, default="")

    created_at = me.DateTimeField(default=datetime.datetime.utcnow)
    updated_at = me.DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        "collection": "reviews",
        "indexes": [
            "product",
            "user",
            "-created_at",
            # Un usuario solo puede reseñar un producto una vez.
            {"fields": ("product", "user"), "unique": True},
        ],
        "ordering": ["-created_at"],
    }

    def save(self, *args, **kwargs):
        self.updated_at = datetime.datetime.utcnow()
        return super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.email} -> {self.product.name} ({self.rating}★)"
