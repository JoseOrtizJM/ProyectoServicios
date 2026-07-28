import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useTheme } from "../../../context/ThemeContext";

const CHART_HEIGHT = 110;
const COLUMN_WIDTH = 34;

export default function ColumnChart({ data, formatValue = (value) => String(value), selectedIndex, onSelect }) {
  const { colors } = useTheme();
  const max = Math.max(...data.map((point) => point.value), 1);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.container}>
        {data.map((point, index) => {
          const height = point.value > 0 ? Math.max((point.value / max) * CHART_HEIGHT, 6) : 2;
          const isSelected = selectedIndex === index;
          return (
            <Pressable
              key={`${point.label}-${index}`}
              onPress={() => onSelect?.(point, index)}
              style={[styles.column, isSelected && { backgroundColor: colors.surfaceMuted, borderRadius: 10 }]}
            >
              <Text
                style={{ color: isSelected ? colors.foreground : colors.muted, fontSize: 9, fontWeight: isSelected ? "700" : "400" }}
                numberOfLines={1}
              >
                {point.value > 0 ? formatValue(point.value) : ""}
              </Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.bar,
                    { height, backgroundColor: point.value > 0 ? (isSelected ? colors.accent : colors.primary) : colors.border },
                  ]}
                />
              </View>
              <Text style={{ color: isSelected ? colors.foreground : colors.muted, fontSize: 9 }}>{point.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "flex-end", gap: 4, paddingVertical: 8 },
  column: { alignItems: "center", width: COLUMN_WIDTH, gap: 4, paddingVertical: 4 },
  barTrack: { width: 14, height: CHART_HEIGHT, justifyContent: "flex-end" },
  bar: { width: 14, borderRadius: 6 },
});
