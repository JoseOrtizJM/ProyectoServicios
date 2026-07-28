import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { getDashboardSummary, getSalesChart, getTopProducts } from "../../api/admin";
import BarList from "../../components/admin/charts/BarList";
import ColumnChart from "../../components/admin/charts/ColumnChart";
import { ORDER_STATUS_LABELS } from "../../constants/orderStatus";
import { useTheme } from "../../context/ThemeContext";
import { formatCompactCurrency, formatCurrency } from "../../utils/format";

const PERIODS = [
  { value: "day", label: "Día" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
];

const METRICS = [
  { value: "revenue", label: "Ingresos" },
  { value: "orders", label: "Pedidos" },
];

export default function AdminAnalyticsScreen() {
  const { colors } = useTheme();
  const [period, setPeriod] = useState("week");
  const [metric, setMetric] = useState("revenue");
  const [salesPoints, setSalesPoints] = useState([]);
  const [loadingSales, setLoadingSales] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  const [topProducts, setTopProducts] = useState({ top_selling: [], top_rated: [] });
  const [loadingTop, setLoadingTop] = useState(true);

  useEffect(() => {
    setLoadingSales(true);
    setSelectedIndex(null);
    getSalesChart(period)
      .then(setSalesPoints)
      .catch(() => setSalesPoints([]))
      .finally(() => setLoadingSales(false));
  }, [period]);

  useEffect(() => {
    getDashboardSummary()
      .then(setSummary)
      .catch(() => {})
      .finally(() => setLoadingSummary(false));
  }, []);

  useEffect(() => {
    getTopProducts(10)
      .then(setTopProducts)
      .catch(() => {})
      .finally(() => setLoadingTop(false));
  }, []);

  const chartData = useMemo(
    () =>
      salesPoints.map((point) => ({
        label: point.label,
        value: metric === "revenue" ? Number(point.revenue) : point.orders,
      })),
    [salesPoints, metric],
  );

  const totalRevenue = salesPoints.reduce((sum, point) => sum + Number(point.revenue), 0);
  const totalOrders = salesPoints.reduce((sum, point) => sum + point.orders, 0);
  const selectedPoint = selectedIndex !== null ? salesPoints[selectedIndex] : null;

  const sellingData = topProducts.top_selling.map((product) => ({
    label: product.product_name,
    value: product.total_quantity,
  }));
  const ratedData = topProducts.top_rated.map((product) => ({
    label: product.product_name,
    value: product.average_rating,
  }));

  const ordersByStatusData = summary
    ? Object.entries(summary.sales.orders_by_status)
        .filter(([, count]) => count > 0)
        .map(([key, count]) => ({ label: ORDER_STATUS_LABELS[key] || key, value: count }))
    : [];

  const catalogData = summary
    ? [
        { label: "Productos activos", value: summary.catalog.total_active_products },
        { label: "Categorías", value: summary.catalog.total_categories },
        { label: "Marcas", value: summary.catalog.total_brands },
      ]
    : [];

  const usersData = summary
    ? [
        { label: "Usuarios", value: summary.users.total_users },
        { label: "Administradores", value: summary.users.total_admins },
        { label: "Bloqueados", value: summary.users.blocked_users },
      ]
    : [];

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.scroll}>
      <View style={styles.periodRow}>
        {PERIODS.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => setPeriod(option.value)}
            style={[
              styles.periodButton,
              {
                backgroundColor: period === option.value ? colors.primary : colors.surface,
                borderColor: period === option.value ? colors.primary : colors.border,
              },
            ]}
          >
            <Text style={{ color: period === option.value ? colors.primaryForeground : colors.foreground, fontSize: 13 }}>
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <View style={styles.metricToggle}>
            {METRICS.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => {
                  setMetric(option.value);
                  setSelectedIndex(null);
                }}
                style={[
                  styles.metricChip,
                  {
                    backgroundColor: metric === option.value ? colors.accent : colors.surfaceMuted,
                    borderColor: metric === option.value ? colors.accent : colors.border,
                  },
                ]}
              >
                <Text
                  style={{
                    color: metric === option.value ? colors.accentForeground : colors.foreground,
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={{ color: colors.muted, fontSize: 12 }}>
            {metric === "revenue" ? formatCurrency(totalRevenue) : `${totalOrders} pedidos`}
          </Text>
        </View>

        <Text style={{ color: colors.muted, fontSize: 11, marginTop: 4 }}>Toca una columna para ver el detalle</Text>

        {loadingSales ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
        ) : (
          <>
            <ColumnChart
              data={chartData}
              formatValue={metric === "revenue" ? formatCompactCurrency : (value) => String(value)}
              selectedIndex={selectedIndex}
              onSelect={(_, index) => setSelectedIndex((prev) => (prev === index ? null : index))}
            />
            {selectedPoint && (
              <View style={[styles.selectedBox, { backgroundColor: colors.surfaceMuted }]}>
                <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: "600" }}>{selectedPoint.label}</Text>
                <Text style={{ color: colors.muted, fontSize: 12 }}>
                  {formatCurrency(selectedPoint.revenue)} · {selectedPoint.orders} pedido
                  {selectedPoint.orders === 1 ? "" : "s"}
                </Text>
              </View>
            )}
          </>
        )}
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Pedidos por estado</Text>
        {loadingSummary ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
        ) : ordersByStatusData.length === 0 ? (
          <Text style={{ color: colors.muted, fontSize: 13 }}>Todavía no hay pedidos.</Text>
        ) : (
          <BarList data={ordersByStatusData} />
        )}
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Más vendidos (unidades)</Text>
        {loadingTop ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
        ) : sellingData.length === 0 ? (
          <Text style={{ color: colors.muted, fontSize: 13 }}>Todavía no hay ventas.</Text>
        ) : (
          <BarList data={sellingData} />
        )}
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Mejor valorados</Text>
        {loadingTop ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
        ) : ratedData.length === 0 ? (
          <Text style={{ color: colors.muted, fontSize: 13 }}>Todavía no hay reseñas.</Text>
        ) : (
          <BarList data={ratedData} formatValue={(value) => `${value.toFixed(1)} ★`} />
        )}
      </View>

      <View style={styles.row2}>
        <View style={[styles.section, styles.half, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Catálogo</Text>
          {loadingSummary ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
          ) : (
            <BarList data={catalogData} />
          )}
        </View>

        <View style={[styles.section, styles.half, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Usuarios</Text>
          {loadingSummary ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
          ) : (
            <BarList data={usersData} />
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, gap: 16, paddingBottom: 32 },
  periodRow: { flexDirection: "row", gap: 8 },
  periodButton: { flex: 1, borderWidth: 1, borderRadius: 999, paddingVertical: 8, alignItems: "center" },
  section: { borderWidth: 1, borderRadius: 16, padding: 14, gap: 8 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 },
  sectionTitle: { fontSize: 14, fontWeight: "700" },
  metricToggle: { flexDirection: "row", gap: 6 },
  metricChip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  selectedBox: { borderRadius: 12, padding: 10, marginTop: 4 },
  row2: { flexDirection: "row", gap: 16 },
  half: { flex: 1 },
});
