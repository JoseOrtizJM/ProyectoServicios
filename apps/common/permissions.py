from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdmin(BasePermission):
    """Solo usuarios con role='admin'."""

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and getattr(user, "is_admin", False))


class IsAdminOrReadOnly(BasePermission):
    """Cualquiera (incluido invitado) puede leer (GET/HEAD/OPTIONS).
    Solo un admin puede crear/editar/borrar. Útil para catálogo público
    (productos, categorías, marcas) con administración restringida.
    """

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        return bool(user and user.is_authenticated and getattr(user, "is_admin", False))
