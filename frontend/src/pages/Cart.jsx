import { Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { extractErrorMessages } from "../api/errors";
import Alert from "../components/ui/Alert";
import Button from "../components/ui/Button";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/format";

export default function Cart() {
  const { cart, loading, updateItem, removeItem, emptyCart } = useCart();
  const [error, setError] = useState("");
  const [pendingProductId, setPendingProductId] = useState(null);

  async function handleQuantityChange(productId, quantity) {
    if (quantity < 1) return;
    setError("");
    setPendingProductId(productId);
    try {
      await updateItem(productId, quantity);
    } catch (err) {
      setError(extractErrorMessages(err)[0]);
    } finally {
      setPendingProductId(null);
    }
  }

  async function handleRemove(productId) {
    setError("");
    setPendingProductId(productId);
    try {
      await removeItem(productId);
    } catch (err) {
      setError(extractErrorMessages(err)[0]);
    } finally {
      setPendingProductId(null);
    }
  }

  async function handleEmpty() {
    setError("");
    try {
      await emptyCart();
    } catch (err) {
      setError(extractErrorMessages(err)[0]);
    }
  }

  if (loading) {
    return <p className="py-16 text-center text-muted">Cargando carrito…</p>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface px-6 py-16 text-center">
        <h1 className="text-xl font-semibold text-foreground">Tu carrito está vacío</h1>
        <Link to="/catalogo" className="text-primary underline underline-offset-2">
          Ir al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-semibold text-foreground">Mi carrito</h1>
        {error && <Alert>{error}</Alert>}

        <div className="flex flex-col gap-3">
          {cart.items.map((item) => (
            <div
              key={item.product.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-surface p-4"
            >
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-muted text-xs text-muted">
                {item.product.image_url ? (
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  "Sin imagen"
                )}
              </div>

              <div className="flex min-w-40 flex-1 flex-col gap-1">
                <Link to={`/productos/${item.product.id}`} className="font-medium text-foreground hover:underline">
                  {item.product.name}
                </Link>
                <span className="text-sm text-muted">{formatCurrency(item.unit_price)} c/u</span>
                {!item.product.is_active && (
                  <span className="text-xs text-danger">Este producto ya no está disponible.</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={pendingProductId === item.product.id}
                  onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-surface-muted disabled:opacity-50"
                  aria-label="Disminuir cantidad"
                >
                  <Minus size={14} />
                </button>
                <span className="w-6 text-center text-sm text-foreground">{item.quantity}</span>
                <button
                  type="button"
                  disabled={pendingProductId === item.product.id || item.quantity >= item.product.stock}
                  onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-surface-muted disabled:opacity-50"
                  aria-label="Aumentar cantidad"
                >
                  <Plus size={14} />
                </button>
              </div>

              <span className="w-24 text-right font-medium text-foreground">{formatCurrency(item.subtotal)}</span>

              <button
                type="button"
                onClick={() => handleRemove(item.product.id)}
                className="text-muted transition-colors hover:text-danger"
                aria-label="Quitar del carrito"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        <Button variant="outline" type="button" onClick={handleEmpty} className="self-start">
          Vaciar carrito
        </Button>
      </div>

      <aside className="flex h-fit flex-col gap-4 rounded-2xl border border-border bg-surface p-6">
        <h2 className="text-sm font-semibold text-foreground">Resumen</h2>
        <div className="flex justify-between text-sm text-muted">
          <span>Artículos</span>
          <span>{cart.total_items}</span>
        </div>
        <div className="flex justify-between border-t border-border pt-3 text-base font-semibold text-foreground">
          <span>Total</span>
          <span>{formatCurrency(cart.total)}</span>
        </div>
        <Link to="/checkout">
          <Button type="button" className="w-full">
            Proceder al pago
          </Button>
        </Link>
      </aside>
    </div>
  );
}
