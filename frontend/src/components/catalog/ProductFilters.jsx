import Button from "../ui/Button";
import Input from "../ui/Input";

export default function ProductFilters({ categories, brands, filters, onChange, onReset }) {
  return (
    <aside className="flex h-fit flex-col gap-4 rounded-2xl border border-border bg-surface p-4">
      <h2 className="text-sm font-semibold text-foreground">Filtros</h2>

      <Input
        label="Buscar"
        name="search"
        placeholder="Nombre del producto…"
        value={filters.search}
        onChange={(event) => onChange({ search: event.target.value })}
      />

      <div className="flex flex-col gap-1">
        <label htmlFor="category" className="text-sm font-medium text-foreground">
          Categoría
        </label>
        <select
          id="category"
          className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
          value={filters.category}
          onChange={(event) => onChange({ category: event.target.value })}
        >
          <option value="">Todas</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="brand" className="text-sm font-medium text-foreground">
          Marca
        </label>
        <select
          id="brand"
          className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
          value={filters.brand}
          onChange={(event) => onChange({ brand: event.target.value })}
        >
          <option value="">Todas</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Input
          label="Precio mín."
          name="min_price"
          type="number"
          min="0"
          value={filters.min_price}
          onChange={(event) => onChange({ min_price: event.target.value })}
        />
        <Input
          label="Precio máx."
          name="max_price"
          type="number"
          min="0"
          value={filters.max_price}
          onChange={(event) => onChange({ max_price: event.target.value })}
        />
      </div>

      <Button variant="outline" type="button" onClick={onReset}>
        Limpiar filtros
      </Button>
    </aside>
  );
}
