import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text } from "react-native";

import { useTheme } from "../../context/ThemeContext";

const FADE_DELAY_MS = 3500;
const REMOVE_DELAY_MS = 4300;

export default function WelcomeBanner() {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(true);
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 600, useNativeDriver: true }).start();
    }, FADE_DELAY_MS);
    const removeTimer = setTimeout(() => setVisible(false), REMOVE_DELAY_MS);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [opacity]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.banner, { backgroundColor: colors.surface, borderColor: colors.border, opacity }]}>
      <Text style={[styles.title, { color: colors.foreground }]}>Bienvenido a Tienda Tech</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>
        Mouses, teclados, monitores y más — encuentra lo que buscas.
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: { borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 8 },
  title: { fontSize: 15, fontWeight: "700", textAlign: "center" },
  subtitle: { fontSize: 12, textAlign: "center", marginTop: 2 },
});
