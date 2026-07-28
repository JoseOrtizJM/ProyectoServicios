import { NavLink, Outlet } from "react-router-dom";

const LINKS = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/productos", label: "Productos" },
  { to: "/admin/categorias", label: "Categorías" },
  { to: "/admin/marcas", label: "Marcas" },
  { to: "/admin/usuarios", label: "Usuarios" },
  { to: "/admin/pedidos", label: "Pedidos" },
  { to: "/admin/resenas", label: "Reseñas" },
];

export default function AdminLayout() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[200px_1fr]">
      <aside className="flex h-fit flex-col gap-1 rounded-2xl border border-border bg-surface p-3 md:sticky md:top-20">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `rounded-xl px-3 py-2 text-sm transition-colors ${
                isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-surface-muted"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </aside>
      <div className="flex flex-col gap-6">
        <Outlet />
      </div>
    </div>
  );
}
