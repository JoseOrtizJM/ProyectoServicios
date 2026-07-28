import { CreditCard, Trash2 } from "lucide-react-native";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { extractErrorMessages } from "../api/errors";
import { checkout, deleteCard, listCards } from "../api/orders";
import Alert from "../components/ui/Alert";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { ORDER_STATUS_LABELS } from "../constants/orderStatus";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import { formatCurrency } from "../utils/format";

const EMPTY_CARD_FORM = {
  cardholder_name: "",
  card_number: "",
  cvv: "",
  exp_month: "",
  exp_year: "",
  card_alias: "",
  save_card: false,
};

export default function CheckoutScreen({ navigation }) {
  const { colors } = useTheme();
  const { cart, refreshCart } = useCart();

  const [shippingAddress, setShippingAddress] = useState("");
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
      // Si falla, la tarjeta sigue en la lista y se puede reintentar.
    }
  }

  function handleCardNumberChange(text) {
    const digitsOnly = text.replace(/\D/g, "").slice(0, 16);
    setCardForm((prev) => ({ ...prev, card_number: digitsOnly }));
  }

  async function handleSubmit() {
    setErrors([]);
    setSubmitting(true);

    const payload = { payment_method: paymentMethod, shipping_address: shippingAddress };
    if (paymentMethod === "card") {
      if (selectedCardId) {
        payload.card_id = selectedCardId;
      } else {
        payload.cardholder_name = cardForm.cardholder_name;
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
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <View style={[styles.confirmCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.confirmTitle, { color: colors.foreground }]}>¡Pedido confirmado!</Text>
          <Text style={{ color: colors.muted, fontSize: 13, textAlign: "center" }}>
            Tu pedido quedó registrado como{" "}
            <Text style={{ color: colors.foreground, fontWeight: "700" }}>
              {ORDER_STATUS_LABELS[order.status] || order.status}
            </Text>
            .
          </Text>
          <Text style={{ color: colors.foreground, fontSize: 24, fontWeight: "800" }}>
            {formatCurrency(order.total)}
          </Text>
          <Text style={{ color: colors.muted, fontSize: 12, textAlign: "center" }}>
            Se enviará a: {order.shipping_address}
          </Text>
          <Button
            title="Seguir comprando"
            variant="outline"
            onPress={() => {
              // Sin esto, la próxima vez que se abra la pestaña Carrito seguiría
              // mostrando esta misma confirmación (React Navigation conserva el
              // stack de cada pestaña en memoria al cambiar de pestaña).
              navigation.popToTop();
              navigation.navigate("CatalogTab");
            }}
          />
        </View>
      </View>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground, fontWeight: "600" }}>Tu carrito está vacío</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {errors.map((message, index) => (
          <Alert key={`${index}-${message}`}>{message}</Alert>
        ))}

        <Input
          label="Dirección de envío"
          placeholder="Calle, número, colonia, ciudad, estado, CP…"
          multiline
          numberOfLines={2}
          value={shippingAddress}
          onChangeText={setShippingAddress}
        />

        <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Método de pago</Text>
        <View style={styles.methodRow}>
          <Pressable
            onPress={() => setPaymentMethod("cash")}
            style={[
              styles.methodButton,
              {
                borderColor: paymentMethod === "cash" ? colors.primary : colors.border,
                backgroundColor: paymentMethod === "cash" ? colors.surfaceMuted : colors.surface,
              },
            ]}
          >
            <Text style={{ color: colors.foreground, fontSize: 13 }}>Efectivo</Text>
          </Pressable>
          <Pressable
            onPress={() => setPaymentMethod("card")}
            style={[
              styles.methodButton,
              {
                borderColor: paymentMethod === "card" ? colors.primary : colors.border,
                backgroundColor: paymentMethod === "card" ? colors.surfaceMuted : colors.surface,
              },
            ]}
          >
            <Text style={{ color: colors.foreground, fontSize: 13 }}>Tarjeta</Text>
          </Pressable>
        </View>
        {paymentMethod === "cash" && (
          <Text style={{ color: colors.muted, fontSize: 11 }}>
            Pagas al recibir tu pedido; queda pendiente hasta confirmarse.
          </Text>
        )}

        {paymentMethod === "card" && (
          <View style={{ gap: 12 }}>
            {!loadingCards && cards.length > 0 && (
              <View style={{ gap: 8 }}>
                <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Tarjetas guardadas</Text>
                {cards.map((card) => (
                  <Pressable
                    key={card.id}
                    onPress={() => setSelectedCardId(card.id)}
                    style={[
                      styles.cardRow,
                      {
                        borderColor: selectedCardId === card.id ? colors.primary : colors.border,
                        backgroundColor: selectedCardId === card.id ? colors.surfaceMuted : colors.surface,
                      },
                    ]}
                  >
                    <CreditCard size={16} color={colors.foreground} />
                    <Text style={{ color: colors.foreground, fontSize: 12, flex: 1 }} numberOfLines={1}>
                      {card.brand} •••• {card.last4} ({card.exp_month}/{card.exp_year})
                      {card.cardholder_name ? ` · ${card.cardholder_name}` : ""}
                    </Text>
                    <Pressable onPress={() => handleDeleteCard(card.id)} hitSlop={8}>
                      <Trash2 size={16} color={colors.danger} />
                    </Pressable>
                  </Pressable>
                ))}
                <Pressable onPress={() => setSelectedCardId("")} style={styles.newCardOption}>
                  <Text style={{ color: colors.foreground, fontSize: 13 }}>
                    {selectedCardId === "" ? "● " : "○ "}Usar una tarjeta nueva
                  </Text>
                </Pressable>
              </View>
            )}

            {selectedCardId === "" && (
              <View style={[styles.newCardForm, { borderColor: colors.border }]}>
                <Text style={{ color: colors.muted, fontSize: 11 }}>
                  Tarjeta simulada: puedes usar cualquier número de hasta 16 dígitos, no se guarda información
                  real.
                </Text>
                <Input
                  label="Nombre del titular"
                  value={cardForm.cardholder_name}
                  onChangeText={(text) => setCardForm((prev) => ({ ...prev, cardholder_name: text }))}
                />
                <Input
                  label="Número de tarjeta"
                  keyboardType="number-pad"
                  maxLength={16}
                  value={cardForm.card_number}
                  onChangeText={handleCardNumberChange}
                />
                <View style={styles.row3}>
                  <View style={styles.third}>
                    <Input
                      label="Mes"
                      keyboardType="number-pad"
                      maxLength={2}
                      value={cardForm.exp_month}
                      onChangeText={(text) => setCardForm((prev) => ({ ...prev, exp_month: text }))}
                    />
                  </View>
                  <View style={styles.third}>
                    <Input
                      label="Año"
                      keyboardType="number-pad"
                      maxLength={4}
                      value={cardForm.exp_year}
                      onChangeText={(text) => setCardForm((prev) => ({ ...prev, exp_year: text }))}
                    />
                  </View>
                  <View style={styles.third}>
                    <Input
                      label="CVV"
                      keyboardType="number-pad"
                      maxLength={4}
                      value={cardForm.cvv}
                      onChangeText={(text) => setCardForm((prev) => ({ ...prev, cvv: text }))}
                    />
                  </View>
                </View>
                <Input
                  label="Alias (opcional)"
                  value={cardForm.card_alias}
                  onChangeText={(text) => setCardForm((prev) => ({ ...prev, card_alias: text }))}
                />
                <Pressable
                  onPress={() => setCardForm((prev) => ({ ...prev, save_card: !prev.save_card }))}
                  style={styles.checkboxRow}
                >
                  <View
                    style={[
                      styles.checkbox,
                      {
                        borderColor: colors.border,
                        backgroundColor: cardForm.save_card ? colors.primary : "transparent",
                      },
                    ]}
                  />
                  <Text style={{ color: colors.foreground, fontSize: 12 }}>
                    Guardar esta tarjeta para la próxima compra
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        )}

        <View style={[styles.summary, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {cart.items.map((item) => (
            <View key={item.product.id} style={styles.summaryRow}>
              <Text style={{ color: colors.muted, fontSize: 12, flex: 1 }} numberOfLines={1}>
                {item.product.name} × {item.quantity}
              </Text>
              <Text style={{ color: colors.foreground, fontSize: 12 }}>{formatCurrency(item.subtotal)}</Text>
            </View>
          ))}
          <View style={[styles.summaryRow, styles.summaryTotal, { borderTopColor: colors.border }]}>
            <Text style={{ color: colors.foreground, fontWeight: "700", fontSize: 15 }}>Total</Text>
            <Text style={{ color: colors.foreground, fontWeight: "700", fontSize: 15 }}>
              {formatCurrency(cart.total)}
            </Text>
          </View>
        </View>

        <Button
          title={submitting ? "Procesando…" : "Confirmar pedido"}
          onPress={handleSubmit}
          loading={submitting}
          disabled={!shippingAddress.trim()}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  scroll: { padding: 16, gap: 12 },
  sectionLabel: { fontSize: 13, fontWeight: "600" },
  methodRow: { flexDirection: "row", gap: 8 },
  methodButton: { flex: 1, borderWidth: 1, borderRadius: 12, paddingVertical: 10, alignItems: "center" },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderRadius: 12, padding: 10 },
  newCardOption: { paddingVertical: 4 },
  newCardForm: { borderWidth: 1, borderRadius: 14, padding: 12, gap: 10 },
  row3: { flexDirection: "row", gap: 8 },
  third: { flex: 1 },
  checkboxRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  checkbox: { width: 18, height: 18, borderWidth: 1, borderRadius: 4 },
  summary: { borderWidth: 1, borderRadius: 14, padding: 14, gap: 6 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  summaryTotal: { borderTopWidth: 1, paddingTop: 8, marginTop: 4 },
  confirmCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 24,
    gap: 12,
    alignItems: "center",
    width: "100%",
    maxWidth: 360,
  },
  confirmTitle: { fontSize: 18, fontWeight: "700" },
});
