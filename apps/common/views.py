from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.users.documents import User

HealthCheckSerializer = inline_serializer(
    name="HealthCheck",
    fields={
        "status": serializers.CharField(),
        "mongo_connected": serializers.BooleanField(),
        "mongo_error": serializers.CharField(allow_null=True),
        "users_count": serializers.IntegerField(allow_null=True),
    },
)


@extend_schema(
    tags=["Sistema"],
    summary="Health check",
    description="Confirma que Django arrancó y que hay conexión real a MongoDB.",
    responses={200: HealthCheckSerializer, 503: HealthCheckSerializer},
)
@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    """Verifica que Django levantó y que hay conexión real a MongoDB."""
    mongo_ok = True
    mongo_error = None
    user_count = None

    try:
        user_count = User.objects.count()
    except Exception as exc:  # conexión caída, credenciales mal, etc.
        mongo_ok = False
        mongo_error = str(exc)

    return Response(
        {
            "status": "ok" if mongo_ok else "error",
            "mongo_connected": mongo_ok,
            "mongo_error": mongo_error,
            "users_count": user_count,
        },
        status=200 if mongo_ok else 503,
    )
