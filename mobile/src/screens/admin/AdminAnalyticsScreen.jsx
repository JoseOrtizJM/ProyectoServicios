import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { getSalesChart, getTopProducts } from "../../api/admin";
import BarList from "../../components/admin/charts/BarList";
import ColumnChart from "../../components/admin/charts/ColumnChart";
import { useTheme } from "../../context/ThemeContext";
import { formatCurrency } from "../../utils/format";

const PERIODS = [
  { value: "day", label: "Día" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
];

export default function AdminAnalyticsScreen() {
  const { colors } = useTheme();
  const [period, setPeriod] = useState("week");
  const [salesData, setSalesData] = useState([]);
  const [loadingSales, setLoadingSales] = useState(true);

  const [topProducts, setTopProducts] = useState({ top_selling: [], top_rated: [] });
  const [loadingTop, setLoadingTop] = useState(true);

  useEffect(() => {
    setLoadingSales(true);
    getSalesChart(period)
      .then((points) => setSalesData(points.map((point) => ({ label: point.label, value: Number(point.revenue) }))))
      .catch(() => setSalesData([]))
      .finally(() => setLoadingSales(false));
  }, [period]);

  useEffect(() => {
    getTopProducts(10)
      .then(setTopProducts)
      .catch(() => {})
      .finally(() => setLoadingTop(false));
  }, []);

  const sellingData = topProducts.top_selling.map((product) => ({
    label: product.product_name,
    value: product.total_quantity,
  }));
  const ratedData = topProducts.top_rated.map((product) => ({
    label: product.product_name,
    value: product.average_rating,
  }));
  const totalRevenue = salesData.reduce((sum, point) => sum + point.value, 0);

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
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Ingresos</Text>
          <Text style={{ color: colors.muted, fontSize: 12 }}>{formatCurrency(totalRevenue)}</Text>
        </View>
        {loadingSales ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
        ) : (
          <ColumnChart data={salesData} formatValue={(value) => formatCurrency(value).replace("MX$", "$")} />
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, gap: 16, paddingBottom: 32 },
  periodRow: { flexDirection: "row", gap: 8 },
  periodButton: { flex: 1, borderWidth: 1, borderRadius: 999, paddingVertical: 8, alignItems: "center" },
  section: { borderWidth: 1, borderRadius: 16, padding: 14, gap: 8 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: 14, fontWeight: "700" },
});
