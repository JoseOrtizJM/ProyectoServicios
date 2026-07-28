import { BarChart3, ClipboardList, Package, Star, Tag, Trophy, Users } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { getDashboardSummary } from "../../api/admin";
import { ORDER_STATUS_LABELS } from "../../constants/orderStatus";
import { useTheme } from "../../context/ThemeContext";
import { formatCurrency, formatDate } from "../../utils/format";

const SHORTCUTS = [
  { screen: "AdminProducts", label: "Productos", icon: Package },
  { screen: "AdminCategories", label: "Categorías", icon: Tag },
  { screen: "AdminBrands", label: "Marcas", icon: Trophy },
  { screen: "AdminUsers", label: "Usuarios", icon: Users },
  { screen: "AdminOrders", label: "Pedidos", icon: ClipboardList },
  { screen: "AdminReviews", label: "Reseñas", icon: Star },
  { screen: "AdminAnalytics", label: "Analíticas", icon: BarChart3 },
];

export default function AdminDashboardScreen({ navigation }) {
  const { colors } = useTheme();
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
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (error || !summary) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.danger }}>{error || "No hay datos."}</Text>
      </View>
    );
  }

  const stats = [
    { label: "Pedidos totales", value: String(summary.sales.total_orders) },
    { label: "Ingresos", value: formatCurrency(summary.sales.total_revenue) },
    { label: "Productos activos", value: String(summary.catalog.total_active_products) },
    { label: "Usuarios", value: String(summary.users.total_users) },
  ];

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.scroll}>
      <View style={styles.shortcuts}>
        {SHORTCUTS.map((shortcut) => (
          <Pressable
            key={shortcut.screen}
            onPress={() => navigation.navigate(shortcut.screen)}
            style={[styles.shortcutCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <shortcut.icon size={22} color={colors.primary} />
            <Text style={{ color: colors.foreground, fontSize: 11, fontWeight: "600", textAlign: "center" }}>
              {shortcut.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.statsGrid}>
        {stats.map((stat) => (
          <View key={stat.label} style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={{ color: colors.muted, fontSize: 12 }}>{stat.label}</Text>
            <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "700", marginTop: 2 }}>{stat.value}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Pedidos recientes</Text>
        {summary.recent_orders.length === 0 ? (
          <Text style={{ color: colors.muted, fontSize: 13 }}>Todavía no hay pedidos.</Text>
        ) : (
          summary.recent_orders.map((order) => (
            <View key={order.id} style={styles.recentRow}>
              <Text style={{ color: colors.foreground, fontSize: 12, flex: 1 }} numberOfLines={1}>
                {order.user?.name || order.user?.email}
              </Text>
              <Text style={{ color: colors.muted, fontSize: 10 }}>{formatDate(order.created_at)}</Text>
              <Text style={{ color: colors.muted, fontSize: 10 }}>{ORDER_STATUS_LABELS[order.status]}</Text>
              <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: "600" }}>
                {formatCurrency(order.total)}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  scroll: { padding: 16, gap: 16, paddingBottom: 32 },
  shortcuts: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  shortcutCard: {
    width: "22%",
    minWidth: 76,
    aspectRatio: 1,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 6,
  },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: { flexBasis: "47%", flexGrow: 1, borderWidth: 1, borderRadius: 16, padding: 12 },
  section: { borderWidth: 1, borderRadius: 16, padding: 14, gap: 10 },
  sectionTitle: { fontSize: 14, fontWeight: "700" },
  recentRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 4 },
});
