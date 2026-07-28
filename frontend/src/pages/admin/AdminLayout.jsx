import { ArrowLeft } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";

export default function AdminLayout() {
  const location = useLocation();
  const isDashboard = location.pathname === "/admin";

  return (
    <div className="flex flex-col gap-6">
      {!isDashboard && (
        <Link
          to="/admin"
          className="inline-flex w-fit items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} /> Volver al dashboard
        </Link>
      )}
      <Outlet />
    </div>
  );
}
