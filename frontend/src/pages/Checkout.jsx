import { CreditCard, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { extractErrorMessages } from "../api/errors";
import { checkout, deleteCard, listCards } from "../api/orders";
import Alert from "../components/ui/Alert";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { ORDER_STATUS_LABELS } from "../constants/orderStatus";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/format";

const EMPTY_CARD_FORM = { card_number: "", cvv: "", exp_month: "", exp_year: "", card_alias: "", save_card: false };

export default function Checkout() {
  const { cart, loading: cartLoading, refreshCart } = useCart();

  const [cards, setCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [selectedCardId, setSelectedCardId] = useState("");
  const [cardForm, setCardForm] = useState(EMPTY_CARD_FORM);
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    listCards()
      .then((data) => {
        setCards(data);
        if (data.length > 0) setSelectedCardId(data[0].id);
      })
      .catch(() => {})
      .finally(() => setLoadingCards(false));
  }, []);

  async function handleDeleteCard(cardId) {
    try {
      await deleteCard(cardId);
      setCards((prev) => prev.filter((card) => card.id !== cardId));
      setSelectedCardId((prev) => (prev === cardId ? "" : prev));
    } catch {
      // Si falla, la tarjeta sigue en la lista y el usuario puede reintentar.
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrors([]);
    setSubmitting(true);

    const payload = { payment_method: paymentMethod };
    if (paymentMethod === "card") {
      if (selectedCardId) {
        payload.card_id = selectedCardId;
      } else {
        payload.card_number = cardForm.card_number;
        payload.cvv = cardForm.cvv;
        payload.exp_month = Number(cardForm.exp_month);
        payload.exp_year = Number(cardForm.exp_year);
        payload.save_card = cardForm.save_card;
        payload.card_alias = cardForm.card_alias;
      }
    }

    try {
      const data = await checkout(payload);
      setOrder(data);
      await refreshCart();
    } catch (error) {
      setErrors(extractErrorMessages(error));
    } finally {
      setSubmitting(false);
    }
  }

  if (order) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-2xl border border-border bg-surface p-6 text-center">
        <h1 className="text-xl font-semibold text-foreground">¡Pedido confirmado!</h1>
        <p className="text-sm text-muted">
          Tu pedido quedó registrado como{" "}
          <span className="font-medium text-foreground">{ORDER_STATUS_LABELS[order.status] || order.status}</span>.
        </p>
        <p className="text-2xl font-semibold text-foreground">{formatCurrency(order.total)}</p>
        <Link to="/catalogo">
          <Button variant="outline" type="button">
            Seguir comprando
          </Button>
        </Link>
      </div>
    );
  }

  if (cartLoading) {
    return <p className="py-16 text-center text-muted">Cargando…</p>;
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
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 rounded-2xl border border-border bg-surface p-6">
        <h1 className="text-xl font-semibold text-foreground">Pagar</h1>

        {errors.map((message, index) => (
          <Alert key={`${index}-${message}`}>{message}</Alert>
        ))}

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-foreground">Método de pago</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod("cash")}
              className={`flex-1 rounded-xl border px-4 py-2 text-sm transition-colors ${
                paymentMethod === "cash" ? "border-primary bg-surface-muted text-foreground" : "border-border text-muted hover:bg-surface-muted"
              }`}
            >
              Efectivo
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("card")}
              className={`flex-1 rounded-xl border px-4 py-2 text-sm transition-colors ${
                paymentMethod === "card" ? "border-primary bg-surface-muted text-foreground" : "border-border text-muted hover:bg-surface-muted"
              }`}
            >
              Tarjeta
            </button>
          </div>
          {paymentMethod === "cash" && (
            <p className="text-xs text-muted">Pagas al recibir tu pedido; queda pendiente hasta confirmarse.</p>
          )}
        </div>

        {paymentMethod === "card" && (
          <div className="flex flex-col gap-4">
            {!loadingCards && cards.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-foreground">Tarjetas guardadas</span>
                {cards.map((card) => (
                  <label
                    key={card.id}
                    className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm transition-colors ${
                      selectedCardId === card.id ? "border-primary bg-surface-muted" : "border-border"
                    }`}
                  >
                    <span className="flex items-center gap-2 text-foreground">
                      <input
                        type="radio"
                        name="saved_card"
                        checked={selectedCardId === card.id}
                        onChange={() => setSelectedCardId(card.id)}
                      />
                      <CreditCard size={16} />
                      {card.brand} •••• {card.last4} ({card.exp_month}/{card.exp_year})
                      {card.alias && <span className="text-muted">· {card.alias}</span>}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteCard(card.id)}
                      className="text-muted transition-colors hover:text-danger"
                      aria-label="Eliminar tarjeta"
                    >
                      <Trash2 size={16} />
                    </button>
                  </label>
                ))}
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="radio"
                    name="saved_card"
                    checked={selectedCardId === ""}
                    onChange={() => setSelectedCardId("")}
                  />
                  Usar una tarjeta nueva
                </label>
              </div>
            )}

            {selectedCardId === "" && (
              <div className="flex flex-col gap-3 rounded-xl border border-border p-4">
                <p className="text-xs text-muted">
                  Tarjeta simulada: puedes usar cualquier número de 13 a 19 dígitos, no se guarda información real.
                </p>
                <Input
                  label="Número de tarjeta"
                  name="card_number"
                  inputMode="numeric"
                  value={cardForm.card_number}
                  onChange={(event) => setCardForm((prev) => ({ ...prev, card_number: event.target.value }))}
                  required
                />
                <div className="grid grid-cols-3 gap-3">
                  <Input
                    label="Mes exp."
                    name="exp_month"
                    type="number"
                    min="1"
                    max="12"
                    value={cardForm.exp_month}
                    onChange={(event) => setCardForm((prev) => ({ ...prev, exp_month: event.target.value }))}
                    required
                  />
                  <Input
                    label="Año exp."
                    name="exp_year"
                    type="number"
                    min="2024"
                    value={cardForm.exp_year}
                    onChange={(event) => setCardForm((prev) => ({ ...prev, exp_year: event.target.value }))}
                    required
                  />
                  <Input
                    label="CVV"
                    name="cvv"
                    inputMode="numeric"
                    value={cardForm.cvv}
                    onChange={(event) => setCardForm((prev) => ({ ...prev, cvv: event.target.value }))}
                  />
                </div>
                <Input
                  label="Alias (opcional)"
                  name="card_alias"
                  value={cardForm.card_alias}
                  onChange={(event) => setCardForm((prev) => ({ ...prev, card_alias: event.target.value }))}
                />
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={cardForm.save_card}
                    onChange={(event) => setCardForm((prev) => ({ ...prev, save_card: event.target.checked }))}
                  />
                  Guardar esta tarjeta para la próxima compra
                </label>
              </div>
            )}
          </div>
        )}

        <Button type="submit" disabled={submitting} className="self-start">
          {submitting ? "Procesando…" : "Confirmar pedido"}
        </Button>
      </form>

      <aside className="flex h-fit flex-col gap-3 rounded-2xl border border-border bg-surface p-6">
        <h2 className="text-sm font-semibold text-foreground">Resumen</h2>
        <div className="flex flex-col gap-2">
          {cart.items.map((item) => (
            <div key={item.product.id} className="flex justify-between text-sm">
              <span className="text-muted">
                {item.product.name} × {item.quantity}
              </span>
              <span className="text-foreground">{formatCurrency(item.subtotal)}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between border-t border-border pt-3 text-base font-semibold text-foreground">
          <span>Total</span>
          <span>{formatCurrency(cart.total)}</span>
        </div>
      </aside>
    </div>
  );
}
