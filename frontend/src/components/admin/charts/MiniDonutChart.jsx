import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { CHART_COLORS, TOOLTIP_STYLE } from "./chartColors";

export default function MiniDonutChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={56}>
      <PieChart>
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Pie data={data} dataKey="value" nameKey="label" innerRadius={16} outerRadius={26} paddingAngle={2}>
          {data.map((entry, index) => (
            <Cell key={entry.label} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
