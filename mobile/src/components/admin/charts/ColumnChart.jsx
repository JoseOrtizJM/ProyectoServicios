import { ScrollView, StyleSheet, Text, View } from "react-native";

import { useTheme } from "../../../context/ThemeContext";

const CHART_HEIGHT = 110;
const COLUMN_WIDTH = 30;

export default function ColumnChart({ data, formatValue = (value) => String(value) }) {
  const { colors } = useTheme();
  const max = Math.max(...data.map((point) => point.value), 1);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.container}>
        {data.map((point, index) => {
          const height = point.value > 0 ? Math.max((point.value / max) * CHART_HEIGHT, 6) : 2;
          return (
            <View key={`${point.label}-${index}`} style={styles.column}>
              <Text style={{ color: colors.muted, fontSize: 9 }} numberOfLines={1}>
                {point.value > 0 ? formatValue(point.value) : ""}
              </Text>
              <View style={styles.barTrack}>
                <View
                  style={[styles.bar, { height, backgroundColor: point.value > 0 ? colors.primary : colors.border }]}
                />
              </View>
              <Text style={{ color: colors.muted, fontSize: 9 }}>{point.label}</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "flex-end", gap: 6, paddingVertical: 8 },
  column: { alignItems: "center", width: COLUMN_WIDTH, gap: 4 },
  barTrack: { width: 14, height: CHART_HEIGHT, justifyContent: "flex-end" },
  bar: { width: 14, borderRadius: 6 },
});
