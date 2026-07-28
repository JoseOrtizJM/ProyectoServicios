import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { CHART_COLORS, TOOLTIP_STYLE } from "./chartColors";

export default function HorizontalBarChart({ data, dataKey, height = 260 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid stroke="var(--color-border)" strokeDasharray="4 4" horizontal={false} />
        <XAxis type="number" stroke="var(--color-muted)" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          type="category"
          dataKey="label"
          stroke="var(--color-muted)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          width={140}
        />
        <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "var(--color-surface-muted)" }} />
        <Bar dataKey={dataKey} radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={entry.label} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
