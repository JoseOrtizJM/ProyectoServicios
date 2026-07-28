export default function Home() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface px-6 py-16 text-center">
      <h1 className="text-3xl font-semibold text-foreground">Bienvenido a Tienda Tech</h1>
      <p className="max-w-md text-muted">
        El catálogo de productos, el carrito y el resto de la tienda se irán agregando en los
        próximos sprints. Por ahora, esto es el andamiaje base del frontend.
      </p>
    </div>
  );
}
