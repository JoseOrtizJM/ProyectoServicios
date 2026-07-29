import { ImageOff, Pencil, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  createProduct,
  deleteProduct,
  listBrands,
  listCategories,
  listProducts,
  updateProduct,
} from "../../api/catalog";
import { extractErrorMessages } from "../../api/errors";
import Modal from "../../components/admin/Modal";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { formatCurrency } from "../../utils/format";

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  stock: "",
  image_url: "",
  category_id: "",
  brand_id: "",
};

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get("category") || "";
  const brandFilter = searchParams.get("brand") || "";

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    listCategories()
      .then((data) => setCategories(data.results))
      .catch(() => {});
    listBrands()
      .then((data) => setBrands(data.results))
      .catch(() => {});
  }, []);

  function load() {
    setLoading(true);
    setListError("");
    const params = { page_size: 50 };
    if (statusFilter) params.is_active = statusFilter;
    if (categoryFilter) params.category = categoryFilter;
    if (brandFilter) params.brand = brandFilter;
    listProducts(params)
      .then((data) => setProducts(data.results))
      .catch(() => setListError("No se pudo cargar la lista de productos."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [statusFilter, categoryFilter, brandFilter]);

  function updateFilter(key, value) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      return next;
    });
  }

  const activeCategoryName = categories.find((c) => c.id === categoryFilter)?.name;
  const activeBrandName = brands.find((b) => b.id === brandFilter)?.name;

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormErrors([]);
    setModalOpen(true);
  }

  function openEdit(product) {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description || "",
      price: product.price,
      stock: product.stock,
      image_url: product.image_url || "",
      category_id: product.category?.id || "",
      brand_id: product.brand?.id || "",
    });
    setFormErrors([]);
    setModalOpen(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormErrors([]);
    setSubmitting(true);

    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
    };

    try {
      if (editing) {
        await updateProduct(editing.id, payload);
      } else {
        await createProduct(payload);
      }
      setModalOpen(false);
      load();
    } catch (error) {
      setFormErrors(extractErrorMessages(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleActive(product) {
    setListError("");
    try {
      if (product.is_active) {
        if (!window.confirm(`¿Desactivar "${product.name}"?`)) return;
        await deleteProduct(product.id);
      } else {
        await updateProduct(product.id, { is_active: true });
      }
      load();
    } catch (error) {
      setListError(extractErrorMessages(error)[0]);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-foreground">Productos</h1>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={categoryFilter}
            onChange={(event) => updateFilter("category", event.target.value)}
            className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          >
            <option value="">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            value={brandFilter}
            onChange={(event) => updateFilter("brand", event.target.value)}
            className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          >
            <option value="">Todas las marcas</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          >
            <option value="">Todos</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
          <Button type="button" onClick={openCreate}>
            <Plus size={16} /> Nuevo producto
          </Button>
        </div>
      </div>

      {(activeCategoryName || activeBrandName) && (
        <div className="flex flex-wrap gap-2">
          {activeCategoryName && (
            <button
              type="button"
              onClick={() => updateFilter("category", "")}
              className="flex items-center gap-1 rounded-full bg-surface-muted px-3 py-1 text-xs text-foreground"
            >
              Categoría: {activeCategoryName} <X size={12} />
            </button>
          )}
          {activeBrandName && (
            <button
              type="button"
              onClick={() => updateFilter("brand", "")}
              className="flex items-center gap-1 rounded-full bg-surface-muted px-3 py-1 text-xs text-foreground"
            >
              Marca: {activeBrandName} <X size={12} />
            </button>
          )}
        </div>
      )}

      {listError && <Alert>{listError}</Alert>}

      {loading ? (
        <p className="py-8 text-center text-muted">Cargando…</p>
      ) : products.length === 0 ? (
        <p className="py-8 text-center text-muted">No hay productos.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-muted">
              <tr>
                <th className="px-4 py-3" />
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Marca</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-surface-muted text-muted">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                      ) : (
                        <ImageOff size={16} />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">{product.name}</td>
                  <td className="px-4 py-3 text-muted">{product.category?.name || "—"}</td>
                  <td className="px-4 py-3 text-muted">{product.brand?.name || "—"}</td>
                  <td className="px-4 py-3 text-foreground">{formatCurrency(product.price)}</td>
                  <td className="px-4 py-3 text-foreground">{product.stock}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        product.is_active ? "bg-success text-success-foreground" : "bg-danger text-danger-foreground"
                      }`}
                    >
                      {product.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => openEdit(product)}
                        className="text-muted transition-colors hover:text-foreground"
                        aria-label="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(product)}
                        className="text-xs font-medium text-primary underline underline-offset-2"
                      >
                        {product.is_active ? "Desactivar" : "Activar"}
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
        <Modal title={editing ? "Editar producto" : "Nuevo producto"} onClose={() => setModalOpen(false)}>
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
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Precio (MXN)"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
                required
              />
              <Input
                label="Stock"
                name="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={(event) => setForm((prev) => ({ ...prev, stock: event.target.value }))}
                required
              />
            </div>
            <Input
              label="URL de imagen (opcional)"
              name="image_url"
              value={form.image_url}
              onChange={(event) => setForm((prev) => ({ ...prev, image_url: event.target.value }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label htmlFor="category_id" className="text-sm font-medium text-foreground">
                  Categoría
                </label>
                <select
                  id="category_id"
                  value={form.category_id}
                  onChange={(event) => setForm((prev) => ({ ...prev, category_id: event.target.value }))}
                  required
                  className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                >
                  <option value="">Selecciona…</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="brand_id" className="text-sm font-medium text-foreground">
                  Marca
                </label>
                <select
                  id="brand_id"
                  value={form.brand_id}
                  onChange={(event) => setForm((prev) => ({ ...prev, brand_id: event.target.value }))}
                  required
                  className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                >
                  <option value="">Selecciona…</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Button type="submit" disabled={submitting} className="self-start">
              {submitting ? "Guardando…" : "Guardar"}
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
}
