const VARIANTS = {
  danger: "bg-danger text-danger-foreground",
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
};

export default function Alert({ variant = "danger", children }) {
  return <div className={`rounded-xl px-4 py-3 text-sm ${VARIANTS[variant]}`}>{children}</div>;
}
