import { useState } from "react";

import { changePassword, updateProfile } from "../api/auth";
import { extractErrorMessages } from "../api/errors";
import Alert from "../components/ui/Alert";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import PasswordInput from "../components/ui/PasswordInput";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, updateUser } = useAuth();

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

  async function handleProfileSubmit(event) {
    event.preventDefault();
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

  async function handlePasswordSubmit(event) {
    event.preventDefault();
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
    <div className="mx-auto flex max-w-xl flex-col gap-8">
      <section className="rounded-2xl border border-border bg-surface p-6">
        <h1 className="text-xl font-semibold text-foreground">Mi perfil</h1>
        <p className="mt-1 text-sm text-muted">
          {user.email} · {user.role === "admin" ? "Administrador" : "Usuario"}
        </p>

        <form onSubmit={handleProfileSubmit} className="mt-6 flex flex-col gap-4">
          {profileErrors.map((message, index) => (
            <Alert key={`${index}-${message}`}>{message}</Alert>
          ))}
          {profileSuccess && <Alert variant="success">{profileSuccess}</Alert>}

          <Input
            label="Nombre"
            name="first_name"
            value={profileForm.first_name}
            onChange={(event) => setProfileForm((prev) => ({ ...prev, first_name: event.target.value }))}
          />
          <Input
            label="Apellido"
            name="last_name"
            value={profileForm.last_name}
            onChange={(event) => setProfileForm((prev) => ({ ...prev, last_name: event.target.value }))}
          />

          <Button type="submit" disabled={savingProfile} className="self-start">
            {savingProfile ? "Guardando…" : "Guardar cambios"}
          </Button>
        </form>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="text-lg font-semibold text-foreground">Cambiar contraseña</h2>

        <form onSubmit={handlePasswordSubmit} className="mt-6 flex flex-col gap-4">
          {passwordErrors.map((message, index) => (
            <Alert key={`${index}-${message}`}>{message}</Alert>
          ))}
          {passwordSuccess && <Alert variant="success">{passwordSuccess}</Alert>}

          <PasswordInput
            label="Contraseña actual"
            name="old_password"
            autoComplete="current-password"
            value={passwordForm.old_password}
            onChange={(event) => setPasswordForm((prev) => ({ ...prev, old_password: event.target.value }))}
            required
          />
          <PasswordInput
            label="Nueva contraseña"
            name="new_password"
            autoComplete="new-password"
            value={passwordForm.new_password}
            onChange={(event) => setPasswordForm((prev) => ({ ...prev, new_password: event.target.value }))}
            required
          />
          <PasswordInput
            label="Confirmar nueva contraseña"
            name="new_password_confirm"
            autoComplete="new-password"
            value={passwordForm.new_password_confirm}
            onChange={(event) => setPasswordForm((prev) => ({ ...prev, new_password_confirm: event.target.value }))}
            required
          />

          <Button type="submit" variant="secondary" disabled={savingPassword} className="self-start">
            {savingPassword ? "Actualizando…" : "Actualizar contraseña"}
          </Button>
        </form>
      </section>
    </div>
  );
}
