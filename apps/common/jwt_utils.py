import datetime

import jwt
from django.conf import settings

ALGORITHM = "HS256"
TOKEN_TYPE_ACCESS = "access"
TOKEN_TYPE_REFRESH = "refresh"


def _now():
    return datetime.datetime.now(datetime.timezone.utc)


def generate_access_token(user):
    payload = {
        "user_id": str(user.id),
        "role": user.role,
        "type": TOKEN_TYPE_ACCESS,
        "iat": _now(),
        "exp": _now() + datetime.timedelta(minutes=settings.JWT_ACCESS_TOKEN_MINUTES),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)


def generate_refresh_token(user):
    payload = {
        "user_id": str(user.id),
        "type": TOKEN_TYPE_REFRESH,
        "iat": _now(),
        "exp": _now() + datetime.timedelta(days=settings.JWT_REFRESH_TOKEN_DAYS),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)


def generate_token_pair(user):
    return {
        "access": generate_access_token(user),
        "refresh": generate_refresh_token(user),
    }


def decode_token(token):
    """Lanza jwt.ExpiredSignatureError o jwt.InvalidTokenError si falla."""
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
