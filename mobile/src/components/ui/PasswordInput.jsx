import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { useTheme } from "../../context/ThemeContext";

export default function PasswordInput({ label, error, style, ...props }) {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>}
      <View style={styles.inputWrapper}>
        <TextInput
          secureTextEntry={!visible}
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
        <Pressable onPress={() => setVisible((prev) => !prev)} style={styles.toggle} hitSlop={8}>
          {visible ? <EyeOff size={18} color={colors.muted} /> : <Eye size={18} color={colors.muted} />}
        </Pressable>
      </View>
      {error && <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 4 },
  label: { fontSize: 13, fontWeight: "600" },
  inputWrapper: { justifyContent: "center" },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingRight: 40,
    fontSize: 14,
  },
  toggle: { position: "absolute", right: 10 },
  error: { fontSize: 12 },
});
