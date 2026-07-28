import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "../../context/ThemeContext";

const VARIANT_KEYS = {
  danger: ["danger", "dangerForeground"],
  success: ["success", "successForeground"],
  warning: ["warning", "warningForeground"],
};

export default function Alert({ variant = "danger", children }) {
  const { colors } = useTheme();
  const [bgKey, fgKey] = VARIANT_KEYS[variant];

  return (
    <View style={[styles.container, { backgroundColor: colors[bgKey] }]}>
      <Text style={[styles.text, { color: colors[fgKey] }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14 },
  text: { fontSize: 13 },
});
