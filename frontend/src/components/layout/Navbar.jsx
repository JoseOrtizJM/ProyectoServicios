import { Menu, ShoppingBag, ShoppingCart, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import ThemeToggle from "../ui/ThemeToggle";

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleLogout() {
    closeMenu();
    logout();
  }

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <Link
          to={isAdmin ? "/admin" : "/catalogo"}
          onClick={closeMenu}
          className="flex items-center gap-2 font-semibold text-foreground"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <ShoppingBag size={18} />
          </span>
          <span>Tienda Tech</span>
        </Link>

        {/* Nav completo — pantallas medianas en adelante */}
        <nav className="hidden items-center gap-3 md:flex">
          {!isAdmin && (
            <Link
              to="/catalogo"
              className="rounded-full px-4 py-1.5 text-sm text-foreground transition-colors hover:bg-surface-muted"
            >
              Catálogo
            </Link>
          )}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted">Hola, {user.first_name || user.email}</span>
              {!isAdmin && (
                <Link
                  to="/carrito"
                  className="relative flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface-muted"
                  aria-label="Ver carrito"
                >
                  <ShoppingCart size={18} />
                  {itemCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-foreground">
                      {itemCount}
                    </span>
                  )}
                </Link>
              )}
              {!isAdmin && (
                <Link
                  to="/pedidos"
                  className="rounded-full px-4 py-1.5 text-sm text-foreground transition-colors hover:bg-surface-muted"
                >
                  Mis pedidos
                </Link>
              )}
              <Link
                to="/profile"
                className="rounded-full px-4 py-1.5 text-sm text-foreground transition-colors hover:bg-surface-muted"
              >
                Mi perfil
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="rounded-full bg-accent px-4 py-1.5 text-sm text-accent-foreground transition-colors hover:opacity-90"
                >
                  Admin
                </Link>
              )}
              <button
                type="button"
                onClick={logout}
                className="rounded-full border border-border px-4 py-1.5 text-sm text-foreground transition-colors hover:bg-surface-muted"
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-full px-4 py-1.5 text-sm text-foreground transition-colors hover:bg-surface-muted"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-primary px-4 py-1.5 text-sm text-primary-foreground transition-colors hover:opacity-90"
              >
                Registrarse
              </Link>
            </div>
          )}
          <ThemeToggle />
        </nav>

        {/* Controles compactos — pantallas chicas */}
        <div className="flex items-center gap-2 md:hidden">
          {isAuthenticated && !isAdmin && (
            <Link
              to="/carrito"
              onClick={closeMenu}
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface-muted"
              aria-label="Ver carrito"
            >
              <ShoppingCart size={18} />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-foreground">
                  {itemCount}
                </span>
              )}
            </Link>
          )}
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface-muted"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Menú desplegable — pantallas chicas */}
      {menuOpen && (
        <div className="border-t border-border bg-surface px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {!isAdmin && (
              <Link
                to="/catalogo"
                onClick={closeMenu}
                className="rounded-xl px-3 py-2 text-sm text-foreground transition-colors hover:bg-surface-muted"
              >
                Catálogo
              </Link>
            )}
            {isAuthenticated ? (
              <>
                {!isAdmin && (
                  <Link
                    to="/pedidos"
                    onClick={closeMenu}
                    className="rounded-xl px-3 py-2 text-sm text-foreground transition-colors hover:bg-surface-muted"
                  >
                    Mis pedidos
                  </Link>
                )}
                <Link
                  to="/profile"
                  onClick={closeMenu}
                  className="rounded-xl px-3 py-2 text-sm text-foreground transition-colors hover:bg-surface-muted"
                >
                  Mi perfil
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={closeMenu}
                    className="rounded-xl px-3 py-2 text-sm text-foreground transition-colors hover:bg-surface-muted"
                  >
                    Admin
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-surface-muted"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="rounded-xl px-3 py-2 text-sm text-foreground transition-colors hover:bg-surface-muted"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="rounded-xl px-3 py-2 text-sm text-foreground transition-colors hover:bg-surface-muted"
                >
                  Registrarse
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
