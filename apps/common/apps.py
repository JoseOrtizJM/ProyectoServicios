from django.apps import AppConfig


class CommonConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.common"

    def ready(self):
        # Registra el esquema de autenticación JWT para drf-spectacular.
        from . import schema  # noqa: F401
