import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { extractErrorMessages } from "../../api/errors";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import PasswordInput from "../../components/ui/PasswordInput";
import { useAuth } from "../../context/AuthContext";

const INITIAL_FORM = {
  email: "",
  password: "",
  password_confirm: "",
  first_name: "",
  last_name: "",
};

export default function Register() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/catalogo" replace />;
  }

  function handleChange(field) {
    return (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrors([]);
    setSubmitting(true);
    try {
      await register(form);
      navigate("/catalogo", { replace: true });
    } catch (error) {
      setErrors(extractErrorMessages(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 rounded-2xl border border-border bg-surface p-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Crear cuenta</h1>
        <p className="mt-1 text-sm text-muted">Regístrate para comprar y guardar tus pedidos.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {errors.map((message, index) => (
          <Alert key={`${index}-${message}`}>{message}</Alert>
        ))}

        <div className="grid grid-cols-2 gap-3">
          <Input label="Nombre" name="first_name" value={form.first_name} onChange={handleChange("first_name")} />
          <Input label="Apellido" name="last_name" value={form.last_name} onChange={handleChange("last_name")} />
        </div>

        <Input
          label="Correo electrónico"
          type="email"
          name="email"
          autoComplete="email"
          value={form.email}
          onChange={handleChange("email")}
          required
        />
        <PasswordInput
          label="Contraseña"
          name="password"
          autoComplete="new-password"
          value={form.password}
          onChange={handleChange("password")}
          required
        />
        <PasswordInput
          label="Confirmar contraseña"
          name="password_confirm"
          autoComplete="new-password"
          value={form.password_confirm}
          onChange={handleChange("password_confirm")}
          required
        />

        <Button type="submit" disabled={submitting}>
          {submitting ? "Creando cuenta…" : "Crear cuenta"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted">
        ¿Ya tienes cuenta?{" "}
        <Link to="/login" className="font-medium text-primary underline underline-offset-2">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
