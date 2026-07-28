import { ImageOff } from "lucide-react";
import { Link } from "react-router-dom";

import { formatCurrency } from "../../utils/format";

export default function ProductCard({ product }) {
  return (
    <Link
      to={`/productos/${product.id}`}
      className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-shadow hover:shadow-md"
    >
      <div className="flex aspect-square items-center justify-center bg-surface-muted text-muted">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <ImageOff size={32} />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        {product.brand && <span className="text-xs text-muted">{product.brand.name}</span>}
        <h3 className="line-clamp-2 font-medium text-foreground">{product.name}</h3>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-semibold text-foreground">{formatCurrency(product.price)}</span>
          {product.stock === 0 && (
            <span className="rounded-full bg-danger px-2 py-0.5 text-xs text-danger-foreground">Agotado</span>
          )}
        </div>
      </div>
    </Link>
  );
}
