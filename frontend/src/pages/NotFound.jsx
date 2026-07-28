import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface px-6 py-16 text-center">
      <h1 className="text-3xl font-semibold text-foreground">404</h1>
      <p className="text-muted">Esta página no existe o todavía no se ha construido.</p>
      <Link
        to="/"
        className="rounded-full bg-primary px-4 py-1.5 text-sm text-primary-foreground transition-colors hover:opacity-90"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
