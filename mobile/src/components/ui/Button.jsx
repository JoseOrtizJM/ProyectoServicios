import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

import { useTheme } from "../../context/ThemeContext";

const VARIANT_KEYS = {
  primary: ["primary", "primaryForeground"],
  secondary: ["secondary", "secondaryForeground"],
  outline: ["surface", "foreground"],
  danger: ["danger", "dangerForeground"],
};

export default function Button({ title, onPress, variant = "primary", disabled = false, loading = false }) {
  const { colors } = useTheme();
  const [bgKey, fgKey] = VARIANT_KEYS[variant];
  const backgroundColor = colors[bgKey];
  const textColor = colors[fgKey];
  const borderColor = variant === "outline" ? colors.border : "transparent";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor, borderColor, opacity: disabled || loading ? 0.6 : pressed ? 0.85 : 1 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
  },
});
