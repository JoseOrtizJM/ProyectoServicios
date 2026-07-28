import { useEffect, useState } from "react";

import { listAdminOrders, updateOrderStatus } from "../../api/admin";
import { extractErrorMessages } from "../../api/errors";
import Alert from "../../components/ui/Alert";
import { ORDER_STATUS_LABELS } from "../../constants/orderStatus";
import { formatCurrency, formatDate } from "../../utils/format";

const STATUS_OPTIONS = Object.entries(ORDER_STATUS_LABELS);

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    setError("");
    const params = { page_size: 50 };
    if (statusFilter) params.status = statusFilter;
    listAdminOrders(params)
      .then((data) => setOrders(data.results))
      .catch(() => setError("No se pudo cargar la lista de pedidos."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [statusFilter]);

  async function handleStatusChange(order, newStatus) {
    setError("");
    try {
      const updated = await updateOrderStatus(order.id, newStatus);
      setOrders((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setError(extractErrorMessages(err)[0]);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-foreground">Pedidos</h1>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
        >
          <option value="">Todos los estados</option>
          {STATUS_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {error && <Alert>{error}</Alert>}

      {loading ? (
        <p className="py-8 text-center text-muted">Cargando…</p>
      ) : orders.length === 0 ? (
        <p className="py-8 text-center text-muted">No hay pedidos con ese filtro.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-muted">
              <tr>
                <th className="px-4 py-3">Pedido</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Dirección</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Pago</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-muted">#{order.id.slice(-6)}</td>
                  <td className="px-4 py-3 text-foreground">{order.user?.name || order.user?.email}</td>
                  <td className="max-w-48 truncate px-4 py-3 text-muted" title={order.shipping_address}>
                    {order.shipping_address || "—"}
                  </td>
                  <td className="px-4 py-3 text-muted">{formatDate(order.created_at)}</td>
                  <td className="px-4 py-3 text-muted">{order.payment_method === "card" ? "Tarjeta" : "Efectivo"}</td>
                  <td className="px-4 py-3 text-foreground">{formatCurrency(order.total)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={(event) => handleStatusChange(order, event.target.value)}
                      className="rounded-lg border border-border bg-surface px-2 py-1 text-xs text-foreground outline-none focus:border-primary"
                    >
                      {STATUS_OPTIONS.map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
