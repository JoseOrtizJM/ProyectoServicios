import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";

import { useTheme } from "../context/ThemeContext";

export default function HomeScreen() {
  const { theme, colors, toggleTheme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.foreground }]}>Bienvenido a Tienda Tech</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>
        El catálogo, carrito y el resto de la app se irán agregando en los próximos sprints. Por
        ahora, esto es el andamiaje base de la app móvil.
      </Text>
      <Text onPress={toggleTheme} style={[styles.link, { color: colors.primary }]}>
        Cambiar a tema {theme === "dark" ? "claro" : "oscuro"}
      </Text>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  link: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "600",
  },
});
