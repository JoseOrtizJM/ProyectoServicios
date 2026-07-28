import { StyleSheet, Text, View } from "react-native";

import Button from "../components/ui/Button";
import { useTheme } from "../context/ThemeContext";

export default function GuestAccountScreen({ navigation }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.foreground }]}>Bienvenido</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>
        Inicia sesión o crea una cuenta para comprar, ver tu historial de pedidos y usar el asistente.
      </Text>
      <View style={styles.actions}>
        <Button title="Iniciar sesión" onPress={() => navigation.navigate("Login")} />
        <Button title="Crear cuenta" variant="outline" onPress={() => navigation.navigate("Register")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 16 },
  title: { fontSize: 22, fontWeight: "700" },
  subtitle: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  actions: { gap: 12, width: "100%" },
});
