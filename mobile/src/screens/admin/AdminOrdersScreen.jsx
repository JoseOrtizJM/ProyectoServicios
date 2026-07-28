import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { listAdminOrders, updateOrderStatus } from "../../api/admin";
import { extractErrorMessages } from "../../api/errors";
import Alert from "../../components/ui/Alert";
import { ORDER_STATUS_LABELS } from "../../constants/orderStatus";
import { useTheme } from "../../context/ThemeContext";
import { formatCurrency, formatDate } from "../../utils/format";

const STATUS_OPTIONS = Object.entries(ORDER_STATUS_LABELS);
const FILTER_OPTIONS = [["", "Todos"], ...STATUS_OPTIONS];

export default function AdminOrdersScreen() {
  const { colors } = useTheme();
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState(null);

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
    if (newStatus === order.status) return;
    setError("");
    try {
      const updated = await updateOrderStatus(order.id, newStatus);
      setOrders((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setError(extractErrorMessages(err)[0]);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, padding: 16, paddingBottom: 8 }}
        contentContainerStyle={{ gap: 8 }}
        data={FILTER_OPTIONS}
        keyExtractor={([value]) => value || "all"}
        renderItem={({ item: [value, label] }) => (
          <Pressable
            onPress={() => setStatusFilter(value)}
            style={[
              styles.chip,
              {
                backgroundColor: statusFilter === value ? colors.primary : colors.surfaceMuted,
                borderColor: statusFilter === value ? colors.primary : colors.border,
              },
            ]}
          >
            <Text style={{ color: statusFilter === value ? colors.primaryForeground : colors.foreground, fontSize: 12 }}>
              {label}
            </Text>
          </Pressable>
        )}
      />

      {error ? <Alert>{error}</Alert> : null}

      {loading ? (
        <ActivityIndicator style={{ marginTop: 24 }} color={colors.primary} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item: order }) => {
            const expanded = expandedOrderId === order.id;
            return (
              <Pressable
                onPress={() => setExpandedOrderId(expanded ? null : order.id)}
                style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "600" }} numberOfLines={1}>
                      {order.user?.name || order.user?.email}
                    </Text>
                    <Text style={{ color: colors.muted, fontSize: 11 }}>
                      #{order.id.slice(-6)} · {formatDate(order.created_at)}
                    </Text>
                  </View>
                  <Text style={{ color: colors.foreground, fontWeight: "700", fontSize: 14 }}>
                    {formatCurrency(order.total)}
                  </Text>
                </View>

                {order.shipping_address ? (
                  <Text style={{ color: colors.muted, fontSize: 11, marginTop: 4 }} numberOfLines={expanded ? 3 : 1}>
                    Enviar a: {order.shipping_address}
                  </Text>
                ) : null}

                {expanded ? (
                  <View style={styles.statusChips}>
                    {STATUS_OPTIONS.map(([value, label]) => (
                      <Pressable
                        key={value}
                        onPress={() => handleStatusChange(order, value)}
                        style={[
                          styles.chip,
                          {
                            backgroundColor: order.status === value ? colors.primary : colors.surfaceMuted,
                            borderColor: order.status === value ? colors.primary : colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            color: order.status === value ? colors.primaryForeground : colors.foreground,
                            fontSize: 11,
                          }}
                        >
                          {label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                ) : (
                  <Text style={{ color: colors.muted, fontSize: 11, marginTop: 6 }}>
                    {ORDER_STATUS_LABELS[order.status] || order.status} · toca para cambiar estado
                  </Text>
                )}
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <Text style={{ color: colors.muted, textAlign: "center", marginTop: 24 }}>No hay pedidos con ese filtro.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  list: { paddingHorizontal: 16, paddingBottom: 24, gap: 10 },
  card: { borderWidth: 1, borderRadius: 14, padding: 12 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 },
  statusChips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
});
