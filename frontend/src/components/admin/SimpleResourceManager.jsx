import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { extractErrorMessages } from "../../api/errors";
import { formatDate } from "../../utils/format";
import Alert from "../ui/Alert";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "./Modal";

const EMPTY_FORM = { name: "", description: "" };

export default function SimpleResourceManager({ title, listFn, createFn, updateFn, deleteFn, productsFilterKey }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  function load() {
    setLoading(true);
    listFn({ page_size: 50 })
      .then((data) => setItems(data.results))
      .catch(() => setListError("No se pudo cargar la lista."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormErrors([]);
    setModalOpen(true);
  }

  function openEdit(item) {
    setEditing(item);
    setForm({ name: item.name, description: item.description || "" });
    setFormErrors([]);
    setModalOpen(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormErrors([]);
    setSubmitting(true);
    try {
      if (editing) {
        await updateFn(editing.id, form);
      } else {
        await createFn(form);
      }
      setModalOpen(false);
      load();
    } catch (error) {
      setFormErrors(extractErrorMessages(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`¿Eliminar "${item.name}"?`)) return;
    setListError("");
    try {
      await deleteFn(item.id);
      load();
    } catch (error) {
      setListError(extractErrorMessages(error)[0]);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        <Button type="button" onClick={openCreate}>
          <Plus size={16} /> Nueva
        </Button>
      </div>

      {listError && <Alert>{listError}</Alert>}

      {loading ? (
        <p className="py-8 text-center text-muted">Cargando…</p>
      ) : items.length === 0 ? (
        <p className="py-8 text-center text-muted">No hay elementos todavía.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-muted">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Descripción</th>
                <th className="px-4 py-3">Creado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">
                    {productsFilterKey ? (
                      <Link
                        to={`/admin/productos?${productsFilterKey}=${item.id}`}
                        className="hover:underline"
                        title="Ver productos de este elemento"
                      >
                        {item.name}
                      </Link>
                    ) : (
                      item.name
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted">{item.description || "—"}</td>
                  <td className="px-4 py-3 text-muted">{formatDate(item.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="text-muted transition-colors hover:text-foreground"
                        aria-label="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="text-muted transition-colors hover:text-danger"
                        aria-label="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <Modal title={editing ? "Editar" : "Nueva"} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {formErrors.map((message, index) => (
              <Alert key={`${index}-${message}`}>{message}</Alert>
            ))}
            <Input
              label="Nombre"
              name="name"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
            <Input
              label="Descripción"
              name="description"
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            />
            <Button type="submit" disabled={submitting} className="self-start">
              {submitting ? "Guardando…" : "Guardar"}
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
}
