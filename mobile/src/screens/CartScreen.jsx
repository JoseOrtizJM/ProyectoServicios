import { ImageOff, Minus, Plus, Trash2 } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";

import { extractErrorMessages } from "../api/errors";
import Alert from "../components/ui/Alert";
import Button from "../components/ui/Button";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import { formatCurrency } from "../utils/format";

export default function CartScreen({ navigation }) {
  const { colors } = useTheme();
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
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground, fontWeight: "600", fontSize: 16 }}>Tu carrito está vacío</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {error ? <Alert>{error}</Alert> : null}

      <FlatList
        data={cart.items}
        keyExtractor={(item) => item.product.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isPending = pendingProductId === item.product.id;
          return (
            <View style={[styles.itemCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.itemImage, { backgroundColor: colors.surfaceMuted }]}>
                {item.product.image_url ? (
                  <Image source={{ uri: item.product.image_url }} style={styles.imageFill} resizeMode="cover" />
                ) : (
                  <ImageOff size={20} color={colors.muted} />
                )}
              </View>

              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: colors.foreground }]} numberOfLines={2}>
                  {item.product.name}
                </Text>
                <Text style={[styles.itemUnitPrice, { color: colors.muted }]}>
                  {formatCurrency(item.unit_price)} c/u
                </Text>

                <View style={styles.quantityRow}>
                  <Pressable
                    disabled={isPending}
                    onPress={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                    style={[styles.stepButton, { borderColor: colors.border, opacity: isPending ? 0.5 : 1 }]}
                  >
                    <Minus size={14} color={colors.foreground} />
                  </Pressable>
                  <Text style={{ color: colors.foreground, fontSize: 13, minWidth: 20, textAlign: "center" }}>
                    {item.quantity}
                  </Text>
                  <Pressable
                    disabled={isPending || item.quantity >= item.product.stock}
                    onPress={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                    style={[
                      styles.stepButton,
                      { borderColor: colors.border, opacity: isPending || item.quantity >= item.product.stock ? 0.4 : 1 },
                    ]}
                  >
                    <Plus size={14} color={colors.foreground} />
                  </Pressable>
                </View>
              </View>

              <View style={styles.itemActions}>
                <Text style={[styles.itemSubtotal, { color: colors.foreground }]}>
                  {formatCurrency(item.subtotal)}
                </Text>
                <Pressable onPress={() => handleRemove(item.product.id)} hitSlop={8}>
                  <Trash2 size={16} color={colors.danger} />
                </Pressable>
              </View>
            </View>
          );
        }}
        ListFooterComponent={<Button title="Vaciar carrito" variant="outline" onPress={handleEmpty} />}
        ListFooterComponentStyle={{ marginTop: 4 }}
      />

      <View style={[styles.summary, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.summaryRow}>
          <Text style={{ color: colors.muted, fontSize: 13 }}>Artículos</Text>
          <Text style={{ color: colors.foreground, fontSize: 13 }}>{cart.total_items}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={{ color: colors.foreground, fontWeight: "700", fontSize: 16 }}>Total</Text>
          <Text style={{ color: colors.foreground, fontWeight: "700", fontSize: 16 }}>
            {formatCurrency(cart.total)}
          </Text>
        </View>
        <Button title="Proceder al pago" onPress={() => navigation.navigate("Checkout")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  container: { flex: 1, paddingHorizontal: 16 },
  list: { gap: 12, paddingVertical: 12 },
  itemCard: { flexDirection: "row", gap: 10, borderWidth: 1, borderRadius: 14, padding: 10, alignItems: "center" },
  itemImage: {
    width: 56,
    height: 56,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  imageFill: { width: "100%", height: "100%" },
  itemInfo: { flex: 1, gap: 2 },
  itemName: { fontSize: 13, fontWeight: "600" },
  itemUnitPrice: { fontSize: 11 },
  quantityRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 },
  stepButton: { width: 26, height: 26, borderRadius: 999, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  itemActions: { alignItems: "flex-end", gap: 10 },
  itemSubtotal: { fontSize: 13, fontWeight: "700" },
  summary: { borderWidth: 1, borderRadius: 16, padding: 16, gap: 10, marginBottom: 16 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
});
