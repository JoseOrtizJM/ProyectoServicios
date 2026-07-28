import jwt
from drf_spectacular.utils import OpenApiParameter, extend_schema, inline_serializer
from mongoengine.errors import NotUniqueError
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apps.common.jwt_utils import (
    TOKEN_TYPE_REFRESH,
    decode_token,
    generate_access_token,
    generate_token_pair,
)
from apps.common.permissions import IsAdmin
from apps.common.schema import (
    PAGINATION_PARAMETERS,
    AccessTokenSerializer,
    DetailSerializer,
    TokenPairSerializer,
    paginated_response,
)
from apps.common.utils import get_object_or_404, paginate_queryset

from .documents import ROLE_ADMIN, ROLE_CHOICES, BlacklistedToken, User
from .serializers import (
    AdminUserSerializer,
    ChangePasswordSerializer,
    LoginSerializer,
    RefreshTokenSerializer,
    RegisterSerializer,
    UserProfileSerializer,
)

AuthResponseSerializer = inline_serializer(
    name="AuthResponse",
    fields={"user": UserProfileSerializer(), "tokens": TokenPairSerializer()},
)


@extend_schema(
    tags=["Auth"],
    summary="Registrar un nuevo usuario",
    description="Crea una cuenta con role='user' y devuelve el par de tokens (access/refresh).",
    request=RegisterSerializer,
    responses={201: AuthResponseSerializer},
)
@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    try:
        user = serializer.save()
    except NotUniqueError:
        # Cubre la carrera entre el chequeo de validate_email() y el save().
        return Response(
            {"email": ["Ya existe una cuenta con este correo."]},
            status=status.HTTP_400_BAD_REQUEST,
        )

    tokens = generate_token_pair(user)
    return Response(
        {"user": UserProfileSerializer(user).data, "tokens": tokens},
        status=status.HTTP_201_CREATED,
    )


@extend_schema(
    tags=["Auth"],
    summary="Iniciar sesión",
    request=LoginSerializer,
    responses={200: AuthResponseSerializer},
)
@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.validated_data["user"]
    tokens = generate_token_pair(user)
    return Response({"user": UserProfileSerializer(user).data, "tokens": tokens})


@extend_schema(
    tags=["Auth"],
    summary="Renovar el access token",
    description="Cambia un refresh token válido (no invalidado) por un access token nuevo.",
    request=RefreshTokenSerializer,
    responses={200: AccessTokenSerializer, 401: DetailSerializer},
)
@api_view(["POST"])
@permission_classes([AllowAny])
def refresh_token(request):
    serializer = RefreshTokenSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    token = serializer.validated_data["refresh"]

    if BlacklistedToken.objects(token=token).first():
        return Response({"detail": "El refresh token fue invalidado."}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        payload = decode_token(token)
    except jwt.ExpiredSignatureError:
        return Response({"detail": "El refresh token expiró. Inicia sesión de nuevo."}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError:
        return Response({"detail": "Refresh token inválido."}, status=status.HTTP_401_UNAUTHORIZED)

    if payload.get("type") != TOKEN_TYPE_REFRESH:
        return Response({"detail": "Se esperaba un refresh token, no un access token."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(id=payload["user_id"])
    except Exception:
        return Response({"detail": "Usuario no encontrado."}, status=status.HTTP_401_UNAUTHORIZED)

    if not user.is_active:
        return Response({"detail": "Esta cuenta está deshabilitada."}, status=status.HTTP_401_UNAUTHORIZED)

    return Response({"access": generate_access_token(user)})


@extend_schema(
    tags=["Auth"],
    summary="Cerrar sesión",
    description="Invalida el refresh token enviado (blacklist). El access token en uso sigue "
    "siendo válido hasta que expire naturalmente (máx. JWT_ACCESS_TOKEN_MINUTES).",
    request=RefreshTokenSerializer,
    responses={200: DetailSerializer},
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request):
    serializer = RefreshTokenSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    token = serializer.validated_data["refresh"]

    if not BlacklistedToken.objects(token=token).first():
        BlacklistedToken(token=token).save()

    return Response({"detail": "Sesión cerrada correctamente."})


@extend_schema(
    tags=["Auth"],
    summary="Ver mi perfil",
    responses={200: UserProfileSerializer},
    methods=["GET"],
)
@extend_schema(
    tags=["Auth"],
    summary="Editar mi perfil",
    description="Solo first_name/last_name son editables aquí — email, role e is_active "
    "no se pueden auto-modificar.",
    request=UserProfileSerializer,
    responses={200: UserProfileSerializer},
    methods=["PATCH"],
)
@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def profile(request):
    if request.method == "GET":
        return Response(UserProfileSerializer(request.user).data)

    serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    return Response(UserProfileSerializer(user).data)


@extend_schema(
    tags=["Auth"],
    summary="Cambiar mi contraseña",
    request=ChangePasswordSerializer,
    responses={200: DetailSerializer},
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response({"detail": "Contraseña actualizada correctamente."})


# --- Panel admin de usuarios ---


@extend_schema(
    tags=["Admin — Usuarios"],
    summary="Listar usuarios (admin)",
    parameters=[
        OpenApiParameter("role", str, description="Filtrar por rol: 'user' o 'admin'."),
        OpenApiParameter("is_active", str, description="Filtrar por 'true' o 'false'."),
        OpenApiParameter("search", str, description="Búsqueda parcial por email."),
        *PAGINATION_PARAMETERS,
    ],
    responses={200: paginated_response(AdminUserSerializer, "PaginatedUserList")},
)
@api_view(["GET"])
@permission_classes([IsAdmin])
def admin_user_list(request):
    qs = User.objects.all()
    params = request.query_params

    role = params.get("role")
    if role:
        if role not in ROLE_CHOICES:
            return Response(
                {"role": [f"Rol inválido. Opciones: {', '.join(ROLE_CHOICES)}."]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        qs = qs.filter(role=role)

    is_active = params.get("is_active")
    if is_active is not None:
        if is_active.lower() not in ("true", "false"):
            return Response({"is_active": ["Debe ser 'true' o 'false'."]}, status=status.HTTP_400_BAD_REQUEST)
        qs = qs.filter(is_active=(is_active.lower() == "true"))

    search = params.get("search")
    if search:
        qs = qs.filter(email__icontains=search.strip())

    paginated = paginate_queryset(qs.order_by("-created_at"), request)
    paginated["results"] = AdminUserSerializer(paginated["results"], many=True).data
    return Response(paginated)


@extend_schema(
    tags=["Admin — Usuarios"],
    summary="Ver un usuario (admin)",
    responses={200: AdminUserSerializer},
    methods=["GET"],
)
@extend_schema(
    tags=["Admin — Usuarios"],
    summary="Editar / cambiar rol / bloquear-desbloquear usuario (admin)",
    description="is_active=false bloquea, is_active=true desbloquea. Un admin no puede "
    "bloquearse ni quitarse su propio rol a sí mismo.",
    request=AdminUserSerializer,
    responses={200: AdminUserSerializer, 400: DetailSerializer},
    methods=["PATCH"],
)
@extend_schema(
    tags=["Admin — Usuarios"],
    summary="Bloquear usuario (admin)",
    description="Atajo semántico: en vez de eliminar, pone is_active=False. Conserva su "
    "historial de pedidos y reseñas.",
    responses={200: AdminUserSerializer, 400: DetailSerializer},
    methods=["DELETE"],
)
@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAdmin])
def admin_user_detail(request, user_id):
    user = get_object_or_404(User, user_id)
    is_self = str(user.id) == str(request.user.id)

    if request.method == "GET":
        return Response(AdminUserSerializer(user).data)

    if request.method == "DELETE":
        # "Eliminar" un usuario en realidad lo bloquea — nunca se borra de
        # verdad, para conservar su historial de pedidos y reseñas.
        if is_self:
            return Response(
                {"detail": "No puedes bloquear tu propia cuenta de administrador."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user.is_active = False
        user.save()
        return Response(AdminUserSerializer(user).data)

    # PATCH: editar datos, cambiar rol, o bloquear/desbloquear (is_active).
    if is_self:
        if request.data.get("is_active") is False:
            return Response(
                {"is_active": ["No puedes bloquear tu propia cuenta."]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if "role" in request.data and request.data["role"] != ROLE_ADMIN:
            return Response(
                {"role": ["No puedes quitarte tu propio rol de administrador."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

    serializer = AdminUserSerializer(user, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    return Response(AdminUserSerializer(user).data)
