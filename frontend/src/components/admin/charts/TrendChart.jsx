import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { TOOLTIP_STYLE } from "./chartColors";

export default function TrendChart({ data, dataKey, color = "var(--color-primary)", formatValue }) {
  const gradientId = `fill-${dataKey}`;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.35} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--color-border)" strokeDasharray="4 4" vertical={false} />
        <XAxis dataKey="label" stroke="var(--color-muted)" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="var(--color-muted)" fontSize={12} tickLine={false} axisLine={false} width={40} />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={formatValue} />
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill={`url(#${gradientId})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
