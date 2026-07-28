import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import { extractErrorMessages } from "../../api/errors";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={location.state?.from?.pathname || "/"} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrors([]);
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (error) {
      setErrors(extractErrorMessages(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 rounded-2xl border border-border bg-surface p-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Iniciar sesión</h1>
        <p className="mt-1 text-sm text-muted">Accede a tu cuenta para comprar y ver tu historial.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {errors.map((message, index) => (
          <Alert key={`${index}-${message}`}>{message}</Alert>
        ))}

        <Input
          label="Correo electrónico"
          type="email"
          name="email"
          autoComplete="email"
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          required
        />
        <Input
          label="Contraseña"
          type="password"
          name="password"
          autoComplete="current-password"
          value={form.password}
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          required
        />

        <Button type="submit" disabled={submitting}>
          {submitting ? "Ingresando…" : "Ingresar"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted">
        ¿No tienes cuenta?{" "}
        <Link to="/register" className="font-medium text-primary underline underline-offset-2">
          Regístrate
        </Link>
      </p>
    </div>
  );
}
