"""Le dice a drf-spectacular cómo documentar MongoJWTAuthentication —
sin esto, Swagger no sabría que estos endpoints usan Bearer JWT y no
mostraría el botón "Authorize". También trae piezas reutilizables
(paginación, pares de tokens) para anotar las vistas por función de
cada app con @extend_schema, ya que ninguna es una ViewSet/GenericAPIView
de la que drf-spectacular pueda adivinar el serializer solo."""

from drf_spectacular.extensions import OpenApiAuthenticationExtension
from drf_spectacular.utils import OpenApiParameter, inline_serializer
from rest_framework import serializers


class MongoJWTAuthenticationScheme(OpenApiAuthenticationExtension):
    target_class = "apps.common.authentication.MongoJWTAuthentication"
    name = "jwtAuth"

    def get_security_definition(self, auto_schema):
        return {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }


PAGINATION_PARAMETERS = [
    OpenApiParameter("page", int, description="Número de página (por defecto 1)."),
    OpenApiParameter("page_size", int, description="Resultados por página (por defecto 12, máximo 50)."),
]


class TokenPairSerializer(serializers.Serializer):
    access = serializers.CharField()
    refresh = serializers.CharField()


class AccessTokenSerializer(serializers.Serializer):
    access = serializers.CharField()


class DetailSerializer(serializers.Serializer):
    """Respuesta genérica {"detail": "..."} usada por varios endpoints
    (logout, cambio de contraseña, errores, etc.)."""

    detail = serializers.CharField()


def paginated_response(item_serializer_class, name):
    """Arma un serializer inline para documentar el sobre de paginación
    {count, page, page_size, total_pages, results: [...]} de
    apps/common/utils.py:paginate_queryset."""
    return inline_serializer(
        name=name,
        fields={
            "count": serializers.IntegerField(),
            "page": serializers.IntegerField(),
            "page_size": serializers.IntegerField(),
            "total_pages": serializers.IntegerField(),
            "results": item_serializer_class(many=True),
        },
    )
