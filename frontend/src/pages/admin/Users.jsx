import { useEffect, useState } from "react";

import { listAdminUsers, updateAdminUser } from "../../api/admin";
import { extractErrorMessages } from "../../api/errors";
import Alert from "../../components/ui/Alert";
import Input from "../../components/ui/Input";
import { useAuth } from "../../context/AuthContext";
import { formatDate } from "../../utils/format";

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(true);
      setError("");
      const params = { page_size: 50 };
      if (roleFilter) params.role = roleFilter;
      if (activeFilter) params.is_active = activeFilter;
      if (search) params.search = search;
      listAdminUsers(params)
        .then((data) => setUsers(data.results))
        .catch(() => setError("No se pudo cargar la lista de usuarios."))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timeout);
  }, [roleFilter, activeFilter, search]);

  async function handleRoleChange(targetUser, role) {
    setError("");
    try {
      const updated = await updateAdminUser(targetUser.id, { role });
      setUsers((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setError(extractErrorMessages(err)[0]);
    }
  }

  async function handleToggleActive(targetUser) {
    setError("");
    try {
      const updated = await updateAdminUser(targetUser.id, { is_active: !targetUser.is_active });
      setUsers((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setError(extractErrorMessages(err)[0]);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-foreground">Usuarios</h1>

      <div className="flex flex-wrap items-end gap-3">
        <Input label="Buscar por correo" name="search" value={search} onChange={(event) => setSearch(event.target.value)} />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-foreground" htmlFor="role_filter">
            Rol
          </label>
          <select
            id="role_filter"
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          >
            <option value="">Todos</option>
            <option value="user">Usuario</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-foreground" htmlFor="active_filter">
            Estado
          </label>
          <select
            id="active_filter"
            value={activeFilter}
            onChange={(event) => setActiveFilter(event.target.value)}
            className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          >
            <option value="">Todos</option>
            <option value="true">Activos</option>
            <option value="false">Bloqueados</option>
          </select>
        </div>
      </div>

      {error && <Alert>{error}</Alert>}

      {loading ? (
        <p className="py-8 text-center text-muted">Cargando…</p>
      ) : users.length === 0 ? (
        <p className="py-8 text-center text-muted">No hay usuarios con ese filtro.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-muted">
              <tr>
                <th className="px-4 py-3">Correo</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Registrado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {users.map((item) => {
                const isSelf = item.id === currentUser.id;
                return (
                  <tr key={item.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-foreground">{item.email}</td>
                    <td className="px-4 py-3 text-muted">{`${item.first_name} ${item.last_name}`.trim() || "—"}</td>
                    <td className="px-4 py-3">
                      <select
                        value={item.role}
                        disabled={isSelf}
                        onChange={(event) => handleRoleChange(item, event.target.value)}
                        className="rounded-lg border border-border bg-surface px-2 py-1 text-xs text-foreground outline-none focus:border-primary disabled:opacity-50"
                      >
                        <option value="user">Usuario</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          item.is_active ? "bg-success text-success-foreground" : "bg-danger text-danger-foreground"
                        }`}
                      >
                        {item.is_active ? "Activo" : "Bloqueado"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted">{formatDate(item.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        disabled={isSelf}
                        onClick={() => handleToggleActive(item)}
                        className="text-xs font-medium text-primary underline underline-offset-2 disabled:opacity-50 disabled:no-underline"
                      >
                        {item.is_active ? "Bloquear" : "Desbloquear"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
