import datetime

import mongoengine as me
from django.contrib.auth.hashers import check_password, make_password

ROLE_USER = "user"
ROLE_ADMIN = "admin"
ROLE_CHOICES = (ROLE_USER, ROLE_ADMIN)


class User(me.Document):
    """Usuario de la tienda. Vive completamente en MongoDB.

    No hereda de django.contrib.auth — la autenticación (JWT) y los
    permisos de DRF se resuelven contra este documento directamente
    (ver apps/common/authentication.py).
    """

    email = me.EmailField(required=True, unique=True)
    password = me.StringField(required=True)
    first_name = me.StringField(max_length=100, default="")
    last_name = me.StringField(max_length=100, default="")
    role = me.StringField(choices=ROLE_CHOICES, default=ROLE_USER)

    # En vez de eliminar usuarios, el admin los deshabilita.
    is_active = me.BooleanField(default=True)

    created_at = me.DateTimeField(default=datetime.datetime.utcnow)
    updated_at = me.DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        "collection": "users",
        "indexes": ["email"],
    }

    def set_password(self, raw_password):
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password)

    def save(self, *args, **kwargs):
        self.updated_at = datetime.datetime.utcnow()
        return super().save(*args, **kwargs)

    # DRF/Django esperan estos atributos en cualquier objeto "usuario"
    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False

    @property
    def is_admin(self):
        return self.role == ROLE_ADMIN

    def __str__(self):
        return self.email
