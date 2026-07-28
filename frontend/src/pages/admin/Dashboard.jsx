import { useEffect, useState } from "react";

import { getDashboardSummary } from "../../api/admin";
import { ORDER_STATUS_LABELS } from "../../constants/orderStatus";
import { formatCurrency, formatDate } from "../../utils/format";

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

  const stats = [
    { label: "Pedidos totales", value: summary.sales.total_orders },
    { label: "Ingresos", value: formatCurrency(summary.sales.total_revenue) },
    { label: "Productos activos", value: summary.catalog.total_active_products },
    { label: "Usuarios", value: summary.users.total_users },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-sm text-muted">{stat.label}</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-foreground">Pedidos por estado</h2>
          <div className="mt-3 flex flex-col gap-2">
            {Object.entries(summary.sales.orders_by_status).map(([statusValue, count]) => (
              <div key={statusValue} className="flex justify-between text-sm">
                <span className="text-muted">{ORDER_STATUS_LABELS[statusValue] || statusValue}</span>
                <span className="text-foreground">{count}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-foreground">Productos más vendidos</h2>
          <div className="mt-3 flex flex-col gap-2">
            {summary.top_selling_products.length === 0 ? (
              <p className="text-sm text-muted">Todavía no hay ventas.</p>
            ) : (
              summary.top_selling_products.map((product) => (
                <div key={product.product_id || product.product_name} className="flex justify-between text-sm">
                  <span className="text-foreground">{product.product_name}</span>
                  <span className="text-muted">
                    {product.total_quantity} vendidos · {formatCurrency(product.total_revenue)}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
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
