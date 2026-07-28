import { StyleSheet, Text, TextInput, View } from "react-native";

import { useTheme } from "../../context/ThemeContext";

export default function Input({ label, error, style, ...props }) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>}
      <TextInput
        placeholderTextColor={colors.muted}
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.danger : colors.border,
            color: colors.foreground,
          },
          style,
        ]}
        {...props}
      />
      {error && <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 4 },
  label: { fontSize: 13, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  error: { fontSize: 12 },
});
