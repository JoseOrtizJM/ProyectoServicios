import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function PasswordInput({ label, error, className = "", id, name, ...props }) {
  const [visible, setVisible] = useState(false);
  const inputId = id || name;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          name={name}
          type={visible ? "text" : "password"}
          className={`w-full rounded-xl border bg-surface px-3 py-2 pr-10 text-sm text-foreground outline-none transition-colors focus:border-primary ${
            error ? "border-danger" : "border-border"
          } ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          tabIndex={-1}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-foreground"
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}
