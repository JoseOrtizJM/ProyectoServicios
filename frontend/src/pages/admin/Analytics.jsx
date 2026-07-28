import { useEffect, useState } from "react";

import { getSalesChart, getTopProducts } from "../../api/admin";
import HorizontalBarChart from "../../components/admin/charts/HorizontalBarChart";
import TrendChart from "../../components/admin/charts/TrendChart";
import { formatCurrency } from "../../utils/format";

const PERIODS = [
  { value: "day", label: "Día" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
];

export default function Analytics() {
  const [period, setPeriod] = useState("week");
  const [salesData, setSalesData] = useState([]);
  const [loadingSales, setLoadingSales] = useState(true);

  const [topProducts, setTopProducts] = useState({ top_selling: [], top_rated: [] });
  const [loadingTop, setLoadingTop] = useState(true);

  useEffect(() => {
    setLoadingSales(true);
    getSalesChart(period)
      .then((points) =>
        setSalesData(
          points.map((point) => ({ label: point.label, revenue: Number(point.revenue), orders: point.orders })),
        ),
      )
      .catch(() => setSalesData([]))
      .finally(() => setLoadingSales(false));
  }, [period]);

  useEffect(() => {
    getTopProducts(10)
      .then(setTopProducts)
      .catch(() => {})
      .finally(() => setLoadingTop(false));
  }, []);

  const sellingChartData = topProducts.top_selling.map((product) => ({
    label: product.product_name,
    value: product.total_quantity,
  }));

  const ratedChartData = topProducts.top_rated.map((product) => ({
    label: product.product_name,
    value: product.average_rating,
  }));

  const totalRevenue = salesData.reduce((sum, point) => sum + point.revenue, 0);
  const totalOrders = salesData.reduce((sum, point) => sum + point.orders, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-foreground">Analíticas</h1>
        <div className="flex gap-2">
          {PERIODS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setPeriod(option.value)}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                period === option.value
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-foreground hover:bg-surface-muted"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-foreground">Ingresos</h2>
          <span className="text-sm text-muted">
            {formatCurrency(totalRevenue)} · {totalOrders} pedidos en el periodo
          </span>
        </div>
        {loadingSales ? (
          <p className="py-16 text-center text-muted">Cargando…</p>
        ) : (
          <TrendChart
            data={salesData}
            dataKey="revenue"
            color="var(--color-primary)"
            formatValue={(value) => formatCurrency(value)}
          />
        )}
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold text-foreground">Pedidos</h2>
        {loadingSales ? (
          <p className="py-16 text-center text-muted">Cargando…</p>
        ) : (
          <TrendChart data={salesData} dataKey="orders" color="var(--color-secondary)" />
        )}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-foreground">Más vendidos (unidades)</h2>
          {loadingTop ? (
            <p className="py-16 text-center text-muted">Cargando…</p>
          ) : sellingChartData.length === 0 ? (
            <p className="py-8 text-center text-muted">Todavía no hay ventas.</p>
          ) : (
            <HorizontalBarChart data={sellingChartData} dataKey="value" />
          )}
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold text-foreground">Mejor valorados</h2>
          {loadingTop ? (
            <p className="py-16 text-center text-muted">Cargando…</p>
          ) : ratedChartData.length === 0 ? (
            <p className="py-8 text-center text-muted">Todavía no hay reseñas.</p>
          ) : (
            <HorizontalBarChart data={ratedChartData} dataKey="value" />
          )}
        </section>
      </div>
    </div>
  );
}
