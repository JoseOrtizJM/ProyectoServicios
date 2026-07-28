import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "../../../context/ThemeContext";

export default function BarList({ data, formatValue = (value) => String(value) }) {
  const { colors } = useTheme();
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <View style={{ gap: 12 }}>
      {data.map((item) => (
        <View key={item.label} style={styles.row}>
          <Text style={{ color: colors.foreground, fontSize: 12 }} numberOfLines={1}>
            {item.label}
          </Text>
          <View style={styles.barRow}>
            <View style={[styles.track, { backgroundColor: colors.surfaceMuted }]}>
              <View
                style={[
                  styles.fill,
                  { width: `${Math.max((item.value / max) * 100, 4)}%`, backgroundColor: colors.primary },
                ]}
              />
            </View>
            <Text style={{ color: colors.muted, fontSize: 11, minWidth: 56, textAlign: "right" }}>
              {formatValue(item.value)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { gap: 4 },
  barRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  track: { flex: 1, height: 10, borderRadius: 999, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 999 },
});
