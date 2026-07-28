import { useEffect, useState } from "react";

import { listBrands, listCategories, listProducts } from "../api/catalog";
import Pagination from "../components/catalog/Pagination";
import ProductCard from "../components/catalog/ProductCard";
import ProductFilters from "../components/catalog/ProductFilters";
import WelcomeBanner from "../components/catalog/WelcomeBanner";

const INITIAL_FILTERS = { search: "", category: "", brand: "", min_price: "", max_price: "" };

export default function Catalog() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ count: 0, total_pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    listCategories()
      .then((data) => setCategories(data.results))
      .catch(() => {});
    listBrands()
      .then((data) => setBrands(data.results))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(true);
      setError("");

      const params = { page, page_size: 12 };
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.brand) params.brand = filters.brand;
      if (filters.min_price) params.min_price = filters.min_price;
      if (filters.max_price) params.max_price = filters.max_price;

      listProducts(params)
        .then((data) => {
          setProducts(data.results);
          setMeta({ count: data.count, total_pages: data.total_pages });
        })
        .catch(() => setError("No se pudieron cargar los productos. Intenta de nuevo."))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timeout);
  }, [filters, page]);

  function handleFilterChange(patch) {
    setPage(1);
    setFilters((prev) => ({ ...prev, ...patch }));
  }

  function handleReset() {
    setPage(1);
    setFilters(INITIAL_FILTERS);
  }

  return (
    <div className="flex flex-col gap-6">
      <WelcomeBanner />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[240px_1fr]">
        <ProductFilters
          categories={categories}
          brands={brands}
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleReset}
        />

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Catálogo</h2>
            {!loading && <span className="text-sm text-muted">{meta.count} productos</span>}
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          {loading ? (
            <p className="py-16 text-center text-muted">Cargando productos…</p>
          ) : products.length === 0 ? (
            <p className="py-16 text-center text-muted">No se encontraron productos con esos filtros.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <Pagination page={page} totalPages={meta.total_pages} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}
