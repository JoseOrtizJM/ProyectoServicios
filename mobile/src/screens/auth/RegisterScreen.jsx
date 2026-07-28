import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";

import { extractErrorMessages } from "../../api/errors";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import PasswordInput from "../../components/ui/PasswordInput";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const INITIAL_FORM = {
  email: "",
  password: "",
  password_confirm: "",
  first_name: "",
  last_name: "",
};

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const { colors } = useTheme();

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(field) {
    return (text) => setForm((prev) => ({ ...prev, [field]: text }));
  }

  async function handleSubmit() {
    setErrors([]);
    setSubmitting(true);
    try {
      await register(form);
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
            Regístrate para comprar y guardar tus pedidos.
          </Text>

          {errors.map((message, index) => (
            <Alert key={`${index}-${message}`}>{message}</Alert>
          ))}

          <View style={styles.row}>
            <View style={styles.half}>
              <Input label="Nombre" value={form.first_name} onChangeText={handleChange("first_name")} />
            </View>
            <View style={styles.half}>
              <Input label="Apellido" value={form.last_name} onChangeText={handleChange("last_name")} />
            </View>
          </View>

          <Input
            label="Correo electrónico"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            value={form.email}
            onChangeText={handleChange("email")}
          />
          <PasswordInput
            label="Contraseña"
            autoComplete="new-password"
            value={form.password}
            onChangeText={handleChange("password")}
          />
          <PasswordInput
            label="Confirmar contraseña"
            autoComplete="new-password"
            value={form.password_confirm}
            onChangeText={handleChange("password_confirm")}
          />

          <Button
            title={submitting ? "Creando cuenta…" : "Crear cuenta"}
            onPress={handleSubmit}
            loading={submitting}
          />

          <Text style={[styles.footer, { color: colors.muted }]}>
            ¿Ya tienes cuenta?{" "}
            <Text style={{ color: colors.primary, fontWeight: "600" }} onPress={() => navigation.navigate("Login")}>
              Inicia sesión
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
  row: { flexDirection: "row", gap: 12 },
  half: { flex: 1 },
  footer: { textAlign: "center", fontSize: 13, marginTop: 8 },
});
