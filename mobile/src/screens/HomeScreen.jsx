import { StyleSheet, Text, View } from "react-native";

import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.foreground }]}>Hola, {user.first_name || user.email}</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>
        El catálogo, carrito y el resto de la app se irán agregando en los próximos sprints.
      </Text>
      <Button title="Mi perfil" onPress={() => navigation.navigate("Profile")} />
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
});
