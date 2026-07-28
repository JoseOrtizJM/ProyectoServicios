import jwt
from rest_framework import authentication, exceptions

from apps.users.documents import User

from .jwt_utils import TOKEN_TYPE_ACCESS, decode_token


class MongoJWTAuthentication(authentication.BaseAuthentication):
    """Autenticación JWT sobre usuarios almacenados en MongoDB.

    Espera el header: Authorization: Bearer <access_token>
    Si no hay header, devuelve None (petición anónima/invitado) en vez
    de lanzar error — así los endpoints públicos siguen funcionando.
    """

    keyword = "Bearer"

    def authenticate(self, request):
        auth_header = authentication.get_authorization_header(request).decode("utf-8")
        if not auth_header:
            return None

        parts = auth_header.split()
        if len(parts) != 2 or parts[0] != self.keyword:
            return None

        token = parts[1]

        try:
            payload = decode_token(token)
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed("El token ha expirado.")
        except jwt.InvalidTokenError:
            raise exceptions.AuthenticationFailed("Token inválido.")

        if payload.get("type") != TOKEN_TYPE_ACCESS:
            raise exceptions.AuthenticationFailed("Se esperaba un access token.")

        try:
            user = User.objects.get(id=payload["user_id"])
        except Exception:
            # Cubre User.DoesNotExist y errores de formato de ObjectId
            raise exceptions.AuthenticationFailed("Usuario no encontrado.")

        if not user.is_active:
            raise exceptions.AuthenticationFailed("Esta cuenta está deshabilitada.")

        return (user, token)

    def authenticate_header(self, request):
        return self.keyword
