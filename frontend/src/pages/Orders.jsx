import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { listOrders } from "../api/orders";
import Pagination from "../components/catalog/Pagination";
import ReviewForm from "../components/orders/ReviewForm";
import { ORDER_STATUS_LABELS } from "../constants/orderStatus";
import { formatCurrency, formatDate } from "../utils/format";

const STATUS_STYLES = {
  pending_payment: "bg-warning text-warning-foreground",
  paid: "bg-secondary text-secondary-foreground",
  shipped: "bg-primary text-primary-foreground",
  delivered: "bg-success text-success-foreground",
  cancelled: "bg-danger text-danger-foreground",
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState({ count: 0, total_pages: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [reviewingKey, setReviewingKey] = useState(null);
  const [reviewedProductIds, setReviewedProductIds] = useState(() => new Set());

  useEffect(() => {
    setLoading(true);
    listOrders({ page, page_size: 10 })
      .then((data) => {
        setOrders(data.results);
        setMeta({ count: data.count, total_pages: data.total_pages });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  function handleReviewSuccess(productId) {
    setReviewedProductIds((prev) => new Set(prev).add(productId));
    setReviewingKey(null);
  }

  if (loading) {
    return <p className="py-16 text-center text-muted">Cargando pedidos…</p>;
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface px-6 py-16 text-center">
        <h1 className="text-xl font-semibold text-foreground">Todavía no tienes pedidos</h1>
        <Link to="/catalogo" className="text-primary underline underline-offset-2">
          Ir al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-foreground">Mis pedidos</h1>

      <div className="flex flex-col gap-4">
        {orders.map((order) => (
          <div key={order.id} className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm text-foreground">{formatDate(order.created_at)}</p>
                <p className="text-xs text-muted">Pedido #{order.id.slice(-6)}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  STATUS_STYLES[order.status] || "bg-surface-muted text-foreground"
                }`}
              >
                {ORDER_STATUS_LABELS[order.status] || order.status}
              </span>
            </div>

            <div className="mt-4 flex flex-col divide-y divide-border">
              {order.items.map((item) => {
                const key = `${order.id}-${item.product_id}`;
                const alreadyReviewed = reviewedProductIds.has(item.product_id);

                return (
                  <div key={key} className="flex flex-col gap-2 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-foreground">
                        {item.product_name} × {item.quantity}
                      </span>
                      <span className="text-sm text-muted">{formatCurrency(item.subtotal)}</span>
                    </div>

                    {item.product_id &&
                      (alreadyReviewed ? (
                        <span className="text-xs text-success">Ya dejaste una reseña para este producto.</span>
                      ) : reviewingKey === key ? (
                        <ReviewForm
                          productId={item.product_id}
                          onSuccess={() => handleReviewSuccess(item.product_id)}
                          onCancel={() => setReviewingKey(null)}
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => setReviewingKey(key)}
                          className="self-start text-xs font-medium text-primary underline underline-offset-2"
                        >
                          Dejar reseña
                        </button>
                      ))}
                  </div>
                );
              })}
            </div>

            {order.shipping_address && (
              <p className="mt-3 text-xs text-muted">Enviado a: {order.shipping_address}</p>
            )}

            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <span className="text-sm text-muted">
                {order.payment_method === "card" && order.card
                  ? `Tarjeta ${order.card.brand} •••• ${order.card.last4}`
                  : "Efectivo"}
              </span>
              <span className="text-base font-semibold text-foreground">{formatCurrency(order.total)}</span>
            </div>
          </div>
        ))}
      </div>

      <Pagination page={page} totalPages={meta.total_pages} onPageChange={setPage} />
    </div>
  );
}
