from django.urls import include, path

urlpatterns = [
    path("api/", include("apps.common.urls")),
    # path("api/auth/", include("apps.users.urls")),  # se activa en el Sprint 1
]
