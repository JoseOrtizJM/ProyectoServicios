import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { changePassword, updateProfile } from "../api/auth";
import { extractErrorMessages } from "../api/errors";
import Alert from "../components/ui/Alert";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import PasswordInput from "../components/ui/PasswordInput";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function ProfileScreen() {
  const { user, updateUser, logout, isAdmin } = useAuth();
  const { theme, colors, toggleTheme } = useTheme();

  const [profileForm, setProfileForm] = useState({
    first_name: user.first_name || "",
    last_name: user.last_name || "",
  });
  const [profileErrors, setProfileErrors] = useState([]);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
    new_password_confirm: "",
  });
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  async function handleProfileSubmit() {
    setProfileErrors([]);
    setProfileSuccess("");
    setSavingProfile(true);
    try {
      const updated = await updateProfile(profileForm);
      updateUser(updated);
      setProfileSuccess("Perfil actualizado correctamente.");
    } catch (error) {
      setProfileErrors(extractErrorMessages(error));
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit() {
    setPasswordErrors([]);
    setPasswordSuccess("");
    setSavingPassword(true);
    try {
      await changePassword(passwordForm);
      setPasswordSuccess("Contraseña actualizada correctamente.");
      setPasswordForm({ old_password: "", new_password: "", new_password_confirm: "" });
    } catch (error) {
      setPasswordErrors(extractErrorMessages(error));
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.scroll}>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Mi perfil</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          {user.email} · {isAdmin ? "Administrador" : "Usuario"}
        </Text>

        {profileErrors.map((message, index) => (
          <Alert key={`${index}-${message}`}>{message}</Alert>
        ))}
        {profileSuccess ? <Alert variant="success">{profileSuccess}</Alert> : null}

        <Input
          label="Nombre"
          value={profileForm.first_name}
          onChangeText={(text) => setProfileForm((prev) => ({ ...prev, first_name: text }))}
        />
        <Input
          label="Apellido"
          value={profileForm.last_name}
          onChangeText={(text) => setProfileForm((prev) => ({ ...prev, last_name: text }))}
        />

        <Button
          title={savingProfile ? "Guardando…" : "Guardar cambios"}
          onPress={handleProfileSubmit}
          loading={savingProfile}
        />
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Cambiar contraseña</Text>

        {passwordErrors.map((message, index) => (
          <Alert key={`${index}-${message}`}>{message}</Alert>
        ))}
        {passwordSuccess ? <Alert variant="success">{passwordSuccess}</Alert> : null}

        <PasswordInput
          label="Contraseña actual"
          value={passwordForm.old_password}
          onChangeText={(text) => setPasswordForm((prev) => ({ ...prev, old_password: text }))}
        />
        <PasswordInput
          label="Nueva contraseña"
          value={passwordForm.new_password}
          onChangeText={(text) => setPasswordForm((prev) => ({ ...prev, new_password: text }))}
        />
        <PasswordInput
          label="Confirmar nueva contraseña"
          value={passwordForm.new_password_confirm}
          onChangeText={(text) => setPasswordForm((prev) => ({ ...prev, new_password_confirm: text }))}
        />

        <Button
          title={savingPassword ? "Actualizando…" : "Actualizar contraseña"}
          variant="secondary"
          onPress={handlePasswordSubmit}
          loading={savingPassword}
        />
      </View>

      <View style={styles.footerActions}>
        <Button title={`Tema ${theme === "dark" ? "claro" : "oscuro"}`} variant="outline" onPress={toggleTheme} />
        <Button title="Cerrar sesión" variant="outline" onPress={logout} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, gap: 16, flexGrow: 1 },
  card: { borderWidth: 1, borderRadius: 16, padding: 20, gap: 14, marginBottom: 16 },
  title: { fontSize: 18, fontWeight: "700" },
  subtitle: { fontSize: 13, marginTop: -8, marginBottom: 4 },
  footerActions: { gap: 12, marginBottom: 24 },
});
