import { BarChart3, ClipboardList, Package, Star, Tag, Trophy, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getDashboardSummary } from "../../api/admin";
import MiniBarChart from "../../components/admin/charts/MiniBarChart";
import MiniDonutChart from "../../components/admin/charts/MiniDonutChart";
import { ORDER_STATUS_LABELS } from "../../constants/orderStatus";
import { formatCurrency, formatDate } from "../../utils/format";

const SHORTCUTS = [
  { to: "/admin/productos", label: "Productos", icon: Package },
  { to: "/admin/categorias", label: "Categorías", icon: Tag },
  { to: "/admin/marcas", label: "Marcas", icon: Trophy },
  { to: "/admin/usuarios", label: "Usuarios", icon: Users },
  { to: "/admin/pedidos", label: "Pedidos", icon: ClipboardList },
  { to: "/admin/resenas", label: "Reseñas", icon: Star },
  { to: "/admin/analiticas", label: "Analíticas", icon: BarChart3 },
];

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getDashboardSummary()
      .then(setSummary)
      .catch(() => setError("No se pudo cargar el resumen."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="py-16 text-center text-muted">Cargando resumen…</p>;
  }

  if (error || !summary) {
    return <p className="py-16 text-center text-danger">{error || "No hay datos."}</p>;
  }

  const ordersByStatusChart = Object.entries(summary.sales.orders_by_status)
    .filter(([, count]) => count > 0)
    .map(([statusValue, count]) => ({ label: ORDER_STATUS_LABELS[statusValue] || statusValue, value: count }));

  const revenueByProductChart = summary.top_selling_products
    .slice(0, 3)
    .map((product) => ({ label: product.product_name, value: Number(product.total_revenue) }));

  const catalogChart = [
    { label: "Activos", value: summary.catalog.total_active_products },
    { label: "Categorías", value: summary.catalog.total_categories },
    { label: "Marcas", value: summary.catalog.total_brands },
  ];

  const usersChart = [
    { label: "Usuarios", value: summary.users.total_users },
    { label: "Admins", value: summary.users.total_admins },
    { label: "Bloqueados", value: summary.users.blocked_users },
  ];

  const stats = [
    {
      label: "Pedidos totales",
      value: summary.sales.total_orders,
      chart: ordersByStatusChart.length > 0 ? <MiniDonutChart data={ordersByStatusChart} /> : null,
    },
    {
      label: "Ingresos",
      value: formatCurrency(summary.sales.total_revenue),
      chart: revenueByProductChart.length > 0 ? <MiniBarChart data={revenueByProductChart} /> : null,
    },
    {
      label: "Productos activos",
      value: summary.catalog.total_active_products,
      chart: <MiniBarChart data={catalogChart} />,
    },
    {
      label: "Usuarios",
      value: summary.users.total_users,
      chart: <MiniDonutChart data={usersChart} />,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {SHORTCUTS.map((shortcut) => (
          <Link
            key={shortcut.to}
            to={shortcut.to}
            className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface p-4 text-center transition-colors hover:bg-surface-muted"
          >
            <shortcut.icon size={22} className="text-primary" />
            <span className="text-sm font-medium text-foreground">{shortcut.label}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-sm text-muted">{stat.label}</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{stat.value}</p>
            {stat.chart}
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold text-foreground">Pedidos recientes</h2>
        <div className="mt-3 flex flex-col divide-y divide-border">
          {summary.recent_orders.length === 0 ? (
            <p className="py-2 text-sm text-muted">Todavía no hay pedidos.</p>
          ) : (
            summary.recent_orders.map((order) => (
              <div key={order.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                <span className="text-foreground">{order.user?.name || order.user?.email}</span>
                <span className="text-muted">{formatDate(order.created_at)}</span>
                <span className="text-muted">{ORDER_STATUS_LABELS[order.status] || order.status}</span>
                <span className="font-medium text-foreground">{formatCurrency(order.total)}</span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
