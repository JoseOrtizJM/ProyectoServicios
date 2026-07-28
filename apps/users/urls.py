from django.urls import path

from . import views

urlpatterns = [
    path("register/", views.register, name="auth-register"),
    path("login/", views.login, name="auth-login"),
    path("refresh/", views.refresh_token, name="auth-refresh"),
    path("logout/", views.logout, name="auth-logout"),
    path("profile/", views.profile, name="auth-profile"),
    path("change-password/", views.change_password, name="auth-change-password"),
    path("admin/users/", views.admin_user_list, name="admin-user-list"),
    path("admin/users/<str:user_id>/", views.admin_user_detail, name="admin-user-detail"),
]
