import datetime

import mongoengine as me


class Category(me.Document):
    name = me.StringField(required=True, unique=True, max_length=100)
    description = me.StringField(max_length=500, default="")
    created_at = me.DateTimeField(default=datetime.datetime.utcnow)
    updated_at = me.DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        "collection": "categories",
        "indexes": ["name"],
        "ordering": ["name"],
    }

    def save(self, *args, **kwargs):
        self.updated_at = datetime.datetime.utcnow()
        return super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Brand(me.Document):
    name = me.StringField(required=True, unique=True, max_length=100)
    description = me.StringField(max_length=500, default="")
    created_at = me.DateTimeField(default=datetime.datetime.utcnow)
    updated_at = me.DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        "collection": "brands",
        "indexes": ["name"],
        "ordering": ["name"],
    }

    def save(self, *args, **kwargs):
        self.updated_at = datetime.datetime.utcnow()
        return super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Product(me.Document):
    name = me.StringField(required=True, max_length=200)
    description = me.StringField(max_length=2000, default="")
    price = me.DecimalField(required=True, min_value=0, precision=2)  # MXN
    stock = me.IntField(min_value=0, default=0)
    # URL de imagen (no upload de archivo por ahora — mantiene el proyecto
    # simple sin depender de un storage tipo S3/Cloudinary). None = sin imagen;
    # nunca "" (el URLField de MongoEngine valida cualquier valor no-None
    # contra un regex de URL, así que una cadena vacía revienta la validación).
    image_url = me.URLField(default=None)

    # DENY: no se puede borrar una categoría/marca mientras tenga productos.
    category = me.ReferenceField(Category, required=True, reverse_delete_rule=me.DENY)
    brand = me.ReferenceField(Brand, required=True, reverse_delete_rule=me.DENY)

    # Los productos no se eliminan físicamente (soft delete) para no romper
    # reseñas/pedidos que ya los referencian — se ocultan del catálogo público.
    is_active = me.BooleanField(default=True)

    created_at = me.DateTimeField(default=datetime.datetime.utcnow)
    updated_at = me.DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        "collection": "products",
        "indexes": ["name", "category", "brand", "is_active"],
        "ordering": ["-created_at"],
    }

    def save(self, *args, **kwargs):
        self.updated_at = datetime.datetime.utcnow()
        return super().save(*args, **kwargs)

    def __str__(self):
        return self.name
