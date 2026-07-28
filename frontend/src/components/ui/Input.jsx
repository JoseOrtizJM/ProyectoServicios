export default function Input({ label, error, className = "", id, name, ...props }) {
  const inputId = id || name;
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <input
        id={inputId}
        name={name}
        className={`rounded-xl border bg-surface px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary ${
          error ? "border-danger" : "border-border"
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}
