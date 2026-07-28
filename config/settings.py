"""
Configuración de Django para el proyecto de la tienda en línea.

Nota de arquitectura: este proyecto NO usa el ORM de Django para los datos
de la aplicación (productos, usuarios, pedidos, etc.) — todo eso vive en
MongoDB a través de MongoEngine. La base de datos SQL configurada abajo es
un placeholder sin uso real, requerido porque Django siempre espera un
DATABASES definido aunque no tenga apps que dependan de él (no usamos
django.contrib.admin/auth/sessions).
"""

import os
from pathlib import Path

import mongoengine
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(BASE_DIR / ".env")


def env_bool(key, default=False):
    return os.environ.get(key, str(default)).strip().lower() in ("1", "true", "yes")


def env_list(key, default=""):
    raw = os.environ.get(key, default)
    return [item.strip() for item in raw.split(",") if item.strip()]


SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "insecure-dev-key")
DEBUG = env_bool("DJANGO_DEBUG", True)
ALLOWED_HOSTS = env_list("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1")

# Render asigna un hostname externo (*.onrender.com) vía esta variable —
# la agregamos automáticamente para no tener que hardcodearla.
RENDER_EXTERNAL_HOSTNAME = os.environ.get("RENDER_EXTERNAL_HOSTNAME")
if RENDER_EXTERNAL_HOSTNAME:
    ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)

INSTALLED_APPS = [
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    "apps.common",
    "apps.users",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# --- Base de datos SQL (sin uso real, ver nota de arquitectura arriba) ---
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db_unused.sqlite3",
    }
}

LANGUAGE_CODE = "es-mx"
TIME_ZONE = "America/Mexico_City"
USE_I18N = True
USE_TZ = True

# Reutilizamos los validadores de contraseña de Django (son funciones
# puras, no requieren django.contrib.auth en INSTALLED_APPS) desde
# apps/users/serializers.py.
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
        "OPTIONS": {"min_length": 8},
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STORAGES = {
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# --- MongoDB / MongoEngine ---
# En producción (Render + MongoDB Atlas) se usa MONGO_URI, una connection
# string completa tipo "mongodb+srv://user:pass@cluster.mongodb.net/db".
# En desarrollo local (Docker Compose) se arma la conexión con las
# variables sueltas MONGO_HOST/PORT/USERNAME/PASSWORD.
MONGO_URI = os.environ.get("MONGO_URI", "").strip()

if MONGO_URI:
    mongoengine.connect(host=MONGO_URI, alias="default")
else:
    MONGO_DB_NAME = os.environ.get("MONGO_DB_NAME", "tienda_db")
    MONGO_HOST = os.environ.get("MONGO_HOST", "localhost")
    MONGO_PORT = int(os.environ.get("MONGO_PORT", "27017"))
    MONGO_USERNAME = os.environ.get("MONGO_USERNAME", "")
    MONGO_PASSWORD = os.environ.get("MONGO_PASSWORD", "")
    MONGO_AUTH_SOURCE = os.environ.get("MONGO_AUTH_SOURCE", "admin")

    mongoengine.connect(
        db=MONGO_DB_NAME,
        host=MONGO_HOST,
        port=MONGO_PORT,
        username=MONGO_USERNAME or None,
        password=MONGO_PASSWORD or None,
        authentication_source=MONGO_AUTH_SOURCE if MONGO_USERNAME else None,
        alias="default",
    )

# --- CORS ---
CORS_ALLOWED_ORIGINS = env_list("CORS_ALLOWED_ORIGINS")
CORS_ALLOW_CREDENTIALS = True

# --- JWT propio (ver apps/common/jwt_utils.py) ---
JWT_ACCESS_TOKEN_MINUTES = int(os.environ.get("JWT_ACCESS_TOKEN_MINUTES", "30"))
JWT_REFRESH_TOKEN_DAYS = int(os.environ.get("JWT_REFRESH_TOKEN_DAYS", "7"))

# --- Chatbot IA ---
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")

# --- Django REST Framework ---
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "apps.common.authentication.MongoJWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ],
    # No usamos django.contrib.auth.models.AnonymousUser (requeriría
    # django.contrib.contenttypes en INSTALLED_APPS). Para peticiones sin
    # token, request.user queda en None — nuestros permisos personalizados
    # y los de DRF (IsAuthenticated, etc.) manejan None correctamente.
    "UNAUTHENTICATED_USER": None,
}
