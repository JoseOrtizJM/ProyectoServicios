import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { deleteReview, listAdminReviews } from "../../api/admin";
import { listProducts } from "../../api/catalog";
import { extractErrorMessages } from "../../api/errors";
import Alert from "../../components/ui/Alert";
import StarRating from "../../components/ui/StarRating";
import { formatDate } from "../../utils/format";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [productFilter, setProductFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    listProducts({ page_size: 50 })
      .then((data) => setProducts(data.results))
      .catch(() => {});
  }, []);

  function load() {
    setLoading(true);
    setError("");
    const params = { page_size: 50 };
    if (productFilter) params.product = productFilter;
    if (ratingFilter) params.rating = ratingFilter;
    listAdminReviews(params)
      .then((data) => setReviews(data.results))
      .catch(() => setError("No se pudo cargar la lista de reseñas."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [productFilter, ratingFilter]);

  async function handleDelete(review) {
    if (!window.confirm("¿Eliminar esta reseña?")) return;
    setError("");
    try {
      await deleteReview(review.id);
      setReviews((prev) => prev.filter((item) => item.id !== review.id));
    } catch (err) {
      setError(extractErrorMessages(err)[0]);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-foreground">Reseñas</h1>
        <div className="flex flex-wrap gap-3">
          <select
            value={productFilter}
            onChange={(event) => setProductFilter(event.target.value)}
            className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          >
            <option value="">Todos los productos</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
          <select
            value={ratingFilter}
            onChange={(event) => setRatingFilter(event.target.value)}
            className="rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          >
            <option value="">Todas las calificaciones</option>
            {[5, 4, 3, 2, 1].map((value) => (
              <option key={value} value={value}>
                {value} estrellas
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <Alert>{error}</Alert>}

      {loading ? (
        <p className="py-8 text-center text-muted">Cargando…</p>
      ) : reviews.length === 0 ? (
        <p className="py-8 text-center text-muted">No hay reseñas con ese filtro.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">{review.product?.name}</p>
                  <p className="text-xs text-muted">
                    {review.user?.name} · {formatDate(review.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StarRating rating={review.rating} size={14} />
                  <button
                    type="button"
                    onClick={() => handleDelete(review)}
                    className="text-muted transition-colors hover:text-danger"
                    aria-label="Eliminar reseña"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              {review.comment && <p className="mt-2 text-sm text-muted">{review.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
