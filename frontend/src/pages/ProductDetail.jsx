import { ImageOff } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getProduct } from "../api/catalog";
import { listProductReviews } from "../api/reviews";
import StarRating from "../components/ui/StarRating";
import { formatCurrency, formatDate } from "../utils/format";

export default function ProductDetail() {
  const { productId } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ average_rating: null, total_reviews: 0 });
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    getProduct(productId)
      .then(setProduct)
      .catch((error) => {
        if (error?.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [productId]);

  useEffect(() => {
    setReviewsLoading(true);
    listProductReviews(productId, { page_size: 20 })
      .then((data) => {
        setReviews(data.results);
        setSummary(data.summary);
      })
      .catch(() => {})
      .finally(() => setReviewsLoading(false));
  }, [productId]);

  if (loading) {
    return <p className="py-16 text-center text-muted">Cargando producto…</p>;
  }

  if (notFound || !product) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface px-6 py-16 text-center">
        <h1 className="text-xl font-semibold text-foreground">Producto no encontrado</h1>
        <Link to="/catalogo" className="text-primary underline underline-offset-2">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-border bg-surface-muted text-muted">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <ImageOff size={48} />
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex gap-2 text-sm text-muted">
            {product.category && <span>{product.category.name}</span>}
            {product.brand && <span>· {product.brand.name}</span>}
          </div>

          <h1 className="text-2xl font-semibold text-foreground">{product.name}</h1>

          {summary.total_reviews > 0 && (
            <div className="flex items-center gap-2">
              <StarRating rating={summary.average_rating} />
              <span className="text-sm text-muted">
                {summary.average_rating} ({summary.total_reviews} reseña{summary.total_reviews === 1 ? "" : "s"})
              </span>
            </div>
          )}

          <p className="text-3xl font-semibold text-foreground">{formatCurrency(product.price)}</p>

          <p className={product.stock > 0 ? "text-sm text-success" : "text-sm text-danger"}>
            {product.stock > 0 ? `${product.stock} disponibles` : "Sin stock por ahora"}
          </p>

          <p className="whitespace-pre-line text-sm text-muted">
            {product.description || "Este producto no tiene descripción todavía."}
          </p>
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">Reseñas</h2>

        {reviewsLoading ? (
          <p className="text-sm text-muted">Cargando reseñas…</p>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-muted">Este producto todavía no tiene reseñas.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-2xl border border-border bg-surface p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">{review.user?.name || "Usuario"}</span>
                  <StarRating rating={review.rating} size={14} />
                </div>
                {review.comment && <p className="mt-2 text-sm text-muted">{review.comment}</p>}
                <p className="mt-2 text-xs text-muted">{formatDate(review.created_at)}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
