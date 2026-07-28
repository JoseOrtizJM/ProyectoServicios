import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip } from "recharts";

import { CHART_COLORS, TOOLTIP_STYLE } from "./chartColors";

export default function MiniBarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={56}>
      <BarChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <Tooltip cursor={{ fill: "var(--color-surface-muted)" }} contentStyle={TOOLTIP_STYLE} />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={entry.label} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
