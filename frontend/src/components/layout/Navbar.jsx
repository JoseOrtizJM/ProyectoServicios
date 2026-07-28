import { ShoppingBag, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import ThemeToggle from "../ui/ThemeToggle";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-semibold text-foreground">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <ShoppingBag size={18} />
          </span>
          <span>Tienda Tech</span>
        </Link>

        <nav className="flex items-center gap-3">
          <Link
            to="/catalogo"
            className="rounded-full px-4 py-1.5 text-sm text-foreground transition-colors hover:bg-surface-muted"
          >
            Catálogo
          </Link>
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-muted sm:inline">
                Hola, {user.first_name || user.email}
              </span>
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
              <Link
                to="/pedidos"
                className="hidden rounded-full px-4 py-1.5 text-sm text-foreground transition-colors hover:bg-surface-muted sm:inline"
              >
                Mis pedidos
              </Link>
              <Link
                to="/profile"
                className="rounded-full px-4 py-1.5 text-sm text-foreground transition-colors hover:bg-surface-muted"
              >
                Mi perfil
              </Link>
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
      </div>
    </header>
  );
}
