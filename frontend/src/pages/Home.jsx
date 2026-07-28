import { Link, Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { isAdmin } = useAuth();

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface px-6 py-16 text-center">
      <h1 className="text-3xl font-semibold text-foreground">Bienvenido a Tienda Tech</h1>
      <p className="max-w-md text-muted">
        Mouses, teclados, monitores y más. Explora el catálogo y encuentra lo que buscas.
      </p>
      <Link
        to="/catalogo"
        className="rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
      >
        Ver catálogo
      </Link>
    </div>
  );
}
