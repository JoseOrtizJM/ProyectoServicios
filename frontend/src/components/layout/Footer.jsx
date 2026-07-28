export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 text-center text-sm text-muted">
        © {new Date().getFullYear()} Tienda Tech. Todos los derechos reservados.
      </div>
    </footer>
  );
}
