import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";

import { extractErrorMessages } from "../../api/errors";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import PasswordInput from "../../components/ui/PasswordInput";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const { colors } = useTheme();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setErrors([]);
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      // Al autenticarse, AuthContext cambia isAuthenticated y RootNavigator
      // pasa solo al stack de la app — no hace falta navegar a mano.
    } catch (error) {
      setErrors(extractErrorMessages(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Accede a tu cuenta para comprar y ver tu historial.
          </Text>

          {errors.map((message, index) => (
            <Alert key={`${index}-${message}`}>{message}</Alert>
          ))}

          <Input
            label="Correo electrónico"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            value={form.email}
            onChangeText={(text) => setForm((prev) => ({ ...prev, email: text }))}
          />
          <PasswordInput
            label="Contraseña"
            autoComplete="current-password"
            value={form.password}
            onChangeText={(text) => setForm((prev) => ({ ...prev, password: text }))}
          />

          <Button title={submitting ? "Ingresando…" : "Ingresar"} onPress={handleSubmit} loading={submitting} />

          <Text style={[styles.footer, { color: colors.muted }]}>
            ¿No tienes cuenta?{" "}
            <Text
              style={{ color: colors.primary, fontWeight: "600" }}
              onPress={() => navigation.navigate("Register")}
            >
              Regístrate
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 20 },
  card: { borderWidth: 1, borderRadius: 16, padding: 20, gap: 14 },
  subtitle: { fontSize: 13, textAlign: "center", marginBottom: 4 },
  footer: { textAlign: "center", fontSize: 13, marginTop: 8 },
});
