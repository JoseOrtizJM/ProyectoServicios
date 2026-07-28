import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";

import { listOrders } from "../api/orders";
import ReviewForm from "../components/orders/ReviewForm";
import { ORDER_STATUS_LABELS } from "../constants/orderStatus";
import { useTheme } from "../context/ThemeContext";
import { formatCurrency, formatDate } from "../utils/format";

const STATUS_KEYS = {
  pending_payment: ["warning", "warningForeground"],
  paid: ["secondary", "secondaryForeground"],
  shipped: ["primary", "primaryForeground"],
  delivered: ["success", "successForeground"],
  cancelled: ["danger", "dangerForeground"],
};

const PAGE_SIZE = 10;

export default function OrdersScreen() {
  const { colors } = useTheme();

  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [reviewingKey, setReviewingKey] = useState(null);
  const [reviewedProductIds, setReviewedProductIds] = useState(() => new Set());

  useEffect(() => {
    setLoading(true);
    listOrders({ page: 1, page_size: PAGE_SIZE })
      .then((data) => {
        setOrders(data.results);
        setTotalPages(data.total_pages);
        setPage(1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleLoadMore() {
    if (loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    listOrders({ page: nextPage, page_size: PAGE_SIZE })
      .then((data) => {
        setOrders((prev) => [...prev, ...data.results]);
        setPage(nextPage);
      })
      .catch(() => {})
      .finally(() => setLoadingMore(false));
  }

  function handleReviewSuccess(productId) {
    setReviewedProductIds((prev) => new Set(prev).add(productId));
    setReviewingKey(null);
  }

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground, fontWeight: "600" }}>Todavía no tienes pedidos</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.list}
      data={orders}
      keyExtractor={(item) => item.id}
      onEndReachedThreshold={0.4}
      onEndReached={handleLoadMore}
      ListFooterComponent={
        loadingMore ? <ActivityIndicator style={{ marginVertical: 16 }} color={colors.primary} /> : null
      }
      renderItem={({ item: order }) => {
        const [bgKey, fgKey] = STATUS_KEYS[order.status] || ["surfaceMuted", "foreground"];
        return (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.header}>
              <View>
                <Text style={{ color: colors.foreground, fontSize: 13 }}>{formatDate(order.created_at)}</Text>
                <Text style={{ color: colors.muted, fontSize: 11 }}>Pedido #{order.id.slice(-6)}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: colors[bgKey] }]}>
                <Text style={{ color: colors[fgKey], fontSize: 11, fontWeight: "600" }}>
                  {ORDER_STATUS_LABELS[order.status] || order.status}
                </Text>
              </View>
            </View>

            <View style={styles.items}>
              {order.items.map((item) => {
                const key = `${order.id}-${item.product_id}`;
                const alreadyReviewed = reviewedProductIds.has(item.product_id);
                return (
                  <View key={key} style={styles.itemRow}>
                    <View style={styles.itemLine}>
                      <Text style={{ color: colors.foreground, fontSize: 13, flex: 1 }} numberOfLines={1}>
                        {item.product_name} × {item.quantity}
                      </Text>
                      <Text style={{ color: colors.muted, fontSize: 13 }}>{formatCurrency(item.subtotal)}</Text>
                    </View>

                    {item.product_id &&
                      (alreadyReviewed ? (
                        <Text style={{ color: colors.success, fontSize: 11 }}>
                          Ya dejaste una reseña para este producto.
                        </Text>
                      ) : reviewingKey === key ? (
                        <ReviewForm
                          productId={item.product_id}
                          onSuccess={() => handleReviewSuccess(item.product_id)}
                          onCancel={() => setReviewingKey(null)}
                        />
                      ) : (
                        <Text
                          onPress={() => setReviewingKey(key)}
                          style={{ color: colors.primary, fontSize: 12, fontWeight: "600" }}
                        >
                          Dejar reseña
                        </Text>
                      ))}
                  </View>
                );
              })}
            </View>

            {order.shipping_address ? (
              <Text style={{ color: colors.muted, fontSize: 11, marginTop: 8 }}>
                Enviado a: {order.shipping_address}
              </Text>
            ) : null}

            <View style={[styles.footer, { borderTopColor: colors.border }]}>
              <Text style={{ color: colors.muted, fontSize: 12 }}>
                {order.payment_method === "card" && order.card
                  ? `Tarjeta ${order.card.brand} •••• ${order.card.last4}`
                  : "Efectivo"}
              </Text>
              <Text style={{ color: colors.foreground, fontWeight: "700", fontSize: 15 }}>
                {formatCurrency(order.total)}
              </Text>
            </View>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { padding: 16, gap: 12 },
  card: { borderWidth: 1, borderRadius: 16, padding: 14, gap: 4 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  items: { marginTop: 8, gap: 8 },
  itemRow: { gap: 4 },
  itemLine: { flexDirection: "row", alignItems: "center", gap: 8 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    marginTop: 10,
    paddingTop: 10,
  },
});
